import { NextResponse } from "next/server";
import { saveJadwal, SheetsError } from "@/lib/sheets";
import { parseRegion } from "@/lib/regions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updates = body.updates;
    const region = parseRegion(body.region);

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "updates must be an array" },
        { status: 400 },
      );
    }

    const result = await saveJadwal(updates, region);
    return NextResponse.json({ success: true, count: result.count });
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
