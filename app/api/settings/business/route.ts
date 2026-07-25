import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "../../../../lib/auth";
import { connectDB } from "../../../../lib/mongodb";
import {
  findBusinessSettings,
  createBusinessSettings,
  updateBusinessSettings,
} from "../../../../lib/businessModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  return verifyJwt(token);
}

// ======================
// GET BUSINESS SETTINGS
// ======================

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);

    const db = await connectDB();

    let settings = await findBusinessSettings(db);

    if (!settings) {
      await createBusinessSettings(db);

      settings = await findBusinessSettings(db);
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

// ======================
// UPDATE BUSINESS SETTINGS
// ======================

export async function PUT(request: NextRequest) {
  try {
    requireAuth(request);

    const body = await request.json();

    const {
      businessName,
      ownerName,
      email,
      phone,
      address,
      currency,
      taxRate,
    } = body;

    const db = await connectDB();

    await updateBusinessSettings(db, {
      businessName,
      ownerName,
      email,
      phone,
      address,
      currency,
      taxRate,
    });

    return NextResponse.json({
      message: "Business settings updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
