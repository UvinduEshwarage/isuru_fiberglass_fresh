import { NextRequest, NextResponse } from "next/server";
import { fetchMl } from "../../../lib/ml";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !body.data) {
    return NextResponse.json({ error: "Missing data payload" }, { status: 400 });
  }

  try {
    const result = await fetchMl("predict", { data: body.data });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
