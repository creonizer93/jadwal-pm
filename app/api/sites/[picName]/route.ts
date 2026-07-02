import { NextResponse } from "next/server";
import { getSitesByPIC, SheetsError } from "@/lib/sheets";
import { parseRegion } from "@/lib/regions";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { picName: string } },
) {
  try {
    const picName = decodeURIComponent(params.picName);
    const region = parseRegion(new URL(request.url).searchParams.get("region"));
    const data = await getSitesByPIC(picName, region);
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
