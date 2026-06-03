import { NextResponse } from "next/server";
import { getUndoneExportData, SheetsError } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getUndoneExportData();

    // Build CSV
    const headers = ["ID", "Schedule Visit", "Engineer", "Visitor Permit"];
    const csvRows = [headers.join(",")];

    for (const row of rows) {
      csvRows.push(
        [
          escapeCsv(row.id),
          escapeCsv(row.scheduleVisit),
          escapeCsv(row.engineer),
          escapeCsv(row.visitorPermit),
        ].join(","),
      );
    }

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export-jadwal-belum-done.csv"`,
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

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
