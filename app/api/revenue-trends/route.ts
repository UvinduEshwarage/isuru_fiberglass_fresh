import { NextRequest, NextResponse } from "next/server";
import { fetchMl } from "../../../lib/ml";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || !Array.isArray(body.records)) {
    return NextResponse.json(
      { error: "Missing records array" },
      { status: 400 }
    );
  }

  try {
    const result = await fetchMl("revenue_trends", {
      records: body.records,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}