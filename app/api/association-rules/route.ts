import { NextRequest, NextResponse } from "next/server";
import { getMlServiceUrl } from "../../../lib/ml";

export async function GET(request: NextRequest) {
  try {
    const top =
      request.nextUrl.searchParams.get("top") ?? "10";

    const response = await fetch(
      `${getMlServiceUrl()}/association_rules?top=${top}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch association rules");
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}