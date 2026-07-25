import { NextResponse } from "next/server";
import { getMlServiceUrl } from "../../../lib/ml";

export async function GET() {
  try {
    const response = await fetch(
      `${getMlServiceUrl()}/health`
    );

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        status: "offline",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}