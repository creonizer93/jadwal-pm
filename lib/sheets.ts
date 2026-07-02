import { google } from "googleapis";
import { REGION_ENGINER_SHEETS, REGION_SHEETS, type Region } from "@/lib/regions";
import { bust, cached } from "@/lib/cache";

/** Represents a single row of site data from the spreadsheet */
export interface Site {
  rowIndex: number;
  type: "MR" | "VW";
  site_id: string;
  tower_name: string;
  pic: string;
  jadwal: string; // yyyy-MM-dd or empty string
  mo_site: string;
  status: string; // "Done" or empty
}

/** Represents a PIC with their site completion status */
export interface PICStatus {
  name: string;
  total: number;
  filled: number;
  done: number;
  complete: boolean;   // semua site punya jadwal (filled >= total)
  submitted: boolean;  // semua site Done (done >= total)
}

/** One update in a save batch */
export interface Update {
  rowIndex: number;
  jadwal: string; // yyyy-MM-dd
}

/** Export row for undone sites */
export interface ExportRow {
  id: string;
  scheduleVisit: string;
  engineer: string;
  visitorPermit: string;
}

/** Error class for Google Sheets API quota / auth / network errors */
export class SheetsError extends Error {
  constructor(
    message: string,
    public readonly code: string = "UNKNOWN",
  ) {
    super(message);
    this.name = "SheetsError";
  }
}

/**
 * Normalize a date string from the spreadsheet into yyyy-MM-dd format
 * for HTML date inputs. Handles dd-MM-yyyy, dd/MM/yyyy, and ISO formats.
 */
function normalizeJadwal(raw: string): string {
  if (!raw) return "";
  // Already ISO: 2026-06-12
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // dd-MM-yyyy or dd/MM/yyyy
  const ddMM = raw.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (ddMM) {
    return `${ddMM[3]}-${ddMM[2]}-${ddMM[1]}`;
  }
  // Return as-is if we can't parse — will show empty on datepicker
  return raw;
}

let _sheetsClient: ReturnType<typeof google.sheets> | null = null;

/**
 * Build and return an authenticated Google Sheets client.
 * Memoized: the underlying JWT reuses its cached access token across calls.
 * Credentials are read from environment variables.
 */
function getClient() {
  if (_sheetsClient) return _sheetsClient;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!email || !key || key.includes("...")) {
    throw new SheetsError(
      "Google Service Account credentials not configured. Check GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.",
      "AUTH_MISSING",
    );
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  _sheetsClient = google.sheets({ version: "v4", auth });
  return _sheetsClient;
}

/** Get spreadsheet ID and sheet name from env */
function getConfig() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) {
    throw new SheetsError(
      "GOOGLE_SPREADSHEET_ID not set.",
      "CONFIG_MISSING",
    );
  }

  return { spreadsheetId, sheetName };
}

/** Cache TTLs */
const TTL_ROWS = 10_000; // 10s — short, since data changes on save
const TTL_ENGINER = 60_000; // 60s
const TTL_TITLE = 300_000; // 5 min — title rarely changes

/** Cache key prefix per region's data worksheet rows. */
const rowsKey = (r: Region) => `rows:${REGION_SHEETS[r]}`;

/**
 * Read rows A:G of a region's sheet (cached, single-flighted).
 */
async function getSheetRows(region: Region): Promise<string[][]> {
  const { spreadsheetId } = getConfig();
  const sheetName = REGION_SHEETS[region];

  return cached(rowsKey(region), TTL_ROWS, async () => {
    const sheets = getClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });
    return (res.data.values as string[][]) || [];
  });
}

/**
 * Fetch the title (name) of the configured spreadsheet (cached).
 */
export async function getSpreadsheetTitle(): Promise<string> {
  try {
    const { spreadsheetId } = getConfig();
    return cached("spreadsheet:title", TTL_TITLE, async () => {
      const sheets = getClient();
      const res = await sheets.spreadsheets.get({ spreadsheetId });
      return res.data.properties?.title || "Jadwal Kunjungan PM";
    });
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to get spreadsheet title",
      "API_ERROR",
    );
  }
}

/**
 * Fetch the Engineer sheet and return a map: nickname → email.
 * Region determines which engineer worksheet to read.
 */
export async function getEngineerMap(region: Region): Promise<Map<string, string>> {
  try {
    return cached(`eng:${REGION_ENGINER_SHEETS[region]}`, TTL_ENGINER, async () => {
      const sheets = getClient();
      const { spreadsheetId } = getConfig();
      const engSheet = REGION_ENGINER_SHEETS[region];

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${engSheet}!A:B`,
      });

      const rows = res.data.values || [];
      const map = new Map<string, string>();
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const email = (row[0] || "").trim();
        const nickname = (row[1] || "").trim().toUpperCase();
        if (email && nickname) {
          map.set(nickname, email);
        }
      }
      return map;
    });
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to get engineer map",
      "API_ERROR",
    );
  }
}

/**
 * Get all PICs with their completion status for a given region.
 * Region determines which data worksheet to read.
 */
export async function getAllPICStatus(region: Region): Promise<PICStatus[]> {
  try {
    const rows = await getSheetRows(region);
    if (rows.length < 2) return []; // header only

    const dataRows = rows.slice(1);

    // Group by PIC
    const picMap = new Map<string, { total: number; filled: number; done: number }>();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const pic = (row[3] || "").trim();
      const jadwal = (row[4] || "").trim();
      const status = (row[6] || "").trim();

      if (!pic) continue;

      if (!picMap.has(pic)) {
        picMap.set(pic, { total: 0, filled: 0, done: 0 });
      }

      const entry = picMap.get(pic)!;
      entry.total += 1;
      if (jadwal !== "") entry.filled += 1;
      if (status === "Done") entry.done += 1;
    }

    const result: PICStatus[] = [];
    picMap.forEach(({ total, filled, done }, name) => {
      result.push({
        name,
        total,
        filled,
        done,
        complete: filled >= total,
        submitted: done >= total,
      });
    });

    return result;
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to get PIC status",
      "API_ERROR",
    );
  }
}

/**
 * Get all sites for a specific PIC in a given region.
 * Region determines which data worksheet to read.
 */
export async function getSitesByPIC(picName: string, region: Region): Promise<Site[]> {
  try {
    const rows = await getSheetRows(region);
    if (rows.length < 2) return [];

    const sites: Site[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const pic = (row[3] || "").trim();
      if (pic !== picName) continue;

      sites.push({
        rowIndex: i + 1, // 1-indexed row in Sheets
        type: ((row[0] || "").trim() as "MR" | "VW") || "MR",
        site_id: (row[1] || "").trim(),
        tower_name: (row[2] || "").trim(),
        pic: (row[3] || "").trim(),
        jadwal: normalizeJadwal((row[4] || "").trim()),
        mo_site: (row[5] || "").trim(),
        status: (row[6] || "").trim(),
      });
    }

    // Sort: MR first, then VW
    sites.sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === "MR" ? -1 : 1;
    });

    return sites;
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to get sites for PIC",
      "API_ERROR",
    );
  }
}

/**
 * Get export data for all sites where Status is NOT "Done" in a given region.
 * Joins with the region's Engineer sheet for email lookup.
 */
export async function getUndoneExportData(region: Region): Promise<ExportRow[]> {
  try {
    // Reuse cached data rows + cached engineer map
    const [rows, engMap] = await Promise.all([
      getSheetRows(region),
      getEngineerMap(region),
    ]);

    const result: ExportRow[] = [];
    const visitorPermit = "HARIA HUDA QURNIAWAN-3506181308900005";

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const status = (row[6] || "").trim();
      if (status === "Done") continue;

      const pic = (row[3] || "").trim().toUpperCase();
      const jadwal = normalizeJadwal((row[4] || "").trim());
      const moSite = (row[5] || "").trim();

      if (!moSite) continue; // skip rows without MO Site
      if (!jadwal) continue; // only export sites with schedule

      const engineer = engMap.get(pic) || "";

      result.push({
        id: moSite,
        scheduleVisit: jadwal,
        engineer,
        visitorPermit,
      });
    }

    return result;
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to get export data",
      "API_ERROR",
    );
  }
}

/**
 * Save jadwal updates back to the spreadsheet for a given region.
 * Uses batchUpdate to write all changes in one API call.
 */
export async function saveJadwal(
  updates: Update[],
  region: Region,
): Promise<{ count: number }> {
  if (!updates.length) return { count: 0 };

  try {
    const sheets = getClient();
    const { spreadsheetId } = getConfig();
    const sheetName = REGION_SHEETS[region];

    // Build batch update data — column E for each rowIndex
    const data = updates.map((u) => ({
      range: `${sheetName}!E${u.rowIndex}`,
      values: [[u.jadwal]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data,
      },
    });

    return { count: updates.length };
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to save jadwal",
      "API_ERROR",
    );
  } finally {
    // Invalidate cached rows for this region so next read reflects the write
    if (updates.length) bust(rowsKey(region));
  }
}
