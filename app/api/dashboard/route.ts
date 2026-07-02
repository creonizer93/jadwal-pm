import { NextResponse } from "next/server";
import { getAllPICStatus, getSpreadsheetTitle, SheetsError } from "@/lib/sheets";
import { parseRegion } from "@/lib/regions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const region = parseRegion(new URL(request.url).searchParams.get("region"));
    const [title, pics] = await Promise.all([
      getSpreadsheetTitle().catch(() => "Jadwal Kunjungan PM"),
      getAllPICStatus(region),
    ]);
    return NextResponse.json({ title, pics });
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
