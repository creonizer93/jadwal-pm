import { google } from "googleapis";

/** Represents a single row of site data from the spreadsheet */
export interface Site {
  rowIndex: number;
  type: "MR" | "VW";
  site_id: string;
  tower_name: string;
  pic: string;
  jadwal: string; // yyyy-MM-dd or empty string
}

/** Represents a PIC with their site completion status */
export interface PICStatus {
  name: string;
  total: number;
  filled: number;
  complete: boolean;
}

/** One update in a save batch */
export interface Update {
  rowIndex: number;
  jadwal: string; // yyyy-MM-dd
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
 * Build and return an authenticated Google Sheets client.
 * Credentials are read from environment variables.
 */
function getClient() {
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

  return google.sheets({ version: "v4", auth });
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

/**
 * Fetch the title (name) of the configured spreadsheet.
 */
export async function getSpreadsheetTitle(): Promise<string> {
  try {
    const sheets = getClient();
    const { spreadsheetId } = getConfig();
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    return res.data.properties?.title || "Jadwal Kunjungan PM";
  } catch (err: unknown) {
    if (err instanceof SheetsError) throw err;
    throw new SheetsError(
      (err as Error).message || "Failed to get spreadsheet title",
      "API_ERROR",
    );
  }
}

/**
 * Get all PICs with their completion status.
 * Queries the entire sheet once via batchGet for efficiency.
 */
export async function getAllPICStatus(): Promise<PICStatus[]> {
  try {
    const sheets = getClient();
    const { spreadsheetId, sheetName } = getConfig();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:E`, // columns A through E
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return []; // header only

    // rows[0] is header; data starts at rowIndex 1
    const dataRows = rows.slice(1);

    // Group by PIC
    const picMap = new Map<string, { total: number; filled: number }>();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const pic = (row[3] || "").trim();
      const jadwal = (row[4] || "").trim();

      if (!pic) continue;

      if (!picMap.has(pic)) {
        picMap.set(pic, { total: 0, filled: 0 });
      }

      const entry = picMap.get(pic)!;
      entry.total += 1;
      if (jadwal !== "") entry.filled += 1;
    }

    const result: PICStatus[] = [];
    picMap.forEach(({ total, filled }, name) => {
      result.push({
        name,
        total,
        filled,
        complete: filled >= total,
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
 * Get all sites for a specific PIC.
 */
export async function getSitesByPIC(picName: string): Promise<Site[]> {
  try {
    const sheets = getClient();
    const { spreadsheetId, sheetName } = getConfig();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:E`,
    });

    const rows = res.data.values || [];
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
        jadwal: (row[4] || "").trim(),
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
 * Save jadwal updates back to the spreadsheet.
 * Uses batchUpdate to write all changes in one API call.
 */
export async function saveJadwal(
  updates: Update[],
): Promise<{ count: number }> {
  if (!updates.length) return { count: 0 };

  try {
    const sheets = getClient();
    const { spreadsheetId, sheetName } = getConfig();

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
  }
}
