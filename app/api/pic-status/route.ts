import { NextResponse } from "next/server";
import { getAllPICStatus, SheetsError } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAllPICStatus();
    return NextResponse.json(data);
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
