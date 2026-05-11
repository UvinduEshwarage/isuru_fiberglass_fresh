import { NextRequest, NextResponse } from "next/server";
import { fetchMl } from "../../../lib/ml";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !Array.isArray(body.products)) {
    return NextResponse.json({ error: "Missing products list" }, { status: 400 });
  }

  try {
    const result = await fetchMl("recommend", {
      products: body.products,
      top_n: body.top_n ?? 5,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
