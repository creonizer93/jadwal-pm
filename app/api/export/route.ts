import { NextResponse } from "next/server";
import { getUndoneExportData, SheetsError } from "@/lib/sheets";
import { parseRegion } from "@/lib/regions";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const region = parseRegion(new URL(request.url).searchParams.get("region"));
    const rows = await getUndoneExportData(region);

    // Build worksheet rows with separated columns
    const sheetRows = rows.map((r) => ({
      ID: r.id,
      "Schedule Visit": r.scheduleVisit,
      Engineer: r.engineer,
      "Visitor Permit": r.visitorPermit,
    }));

    const ws = XLSX.utils.json_to_sheet(
      sheetRows.length ? sheetRows : [{ ID: "", "Schedule Visit": "", Engineer: "", "Visitor Permit": "" }],
      { header: ["ID", "Schedule Visit", "Engineer", "Visitor Permit"] },
    );

    // Auto-size columns roughly by header/content length
    const colWidths = ["ID", "Schedule Visit", "Engineer", "Visitor Permit"].map(
      (k, idx) => {
        const maxLen = Math.max(
          k.length,
          ...rows.map((r) => {
            const v =
              idx === 0
                ? r.id
                : idx === 1
                ? r.scheduleVisit
                : idx === 2
                ? r.engineer
                : r.visitorPermit;
            return (v || "").length;
          }),
        );
        return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
      },
    );
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jadwal");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;

    const filename = `export-jadwal-${region}-belum-done.xlsx`;

    return new NextResponse(buf as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    if (err instanceof SheetsError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: (err as Error).message || "Unknown error" },
      { status: 500 },
    );
  }
}
