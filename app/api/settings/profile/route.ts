import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { verifyJwt } from "../../../../lib/auth";
import { findUserByEmail, updateProfile } from "../../../../lib/userModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  return verifyJwt(token);
}

// ======================
// GET PROFILE
// ======================

export async function GET(request: NextRequest) {
  try {
    const payload = requireAuth(request);

    const db = await connectDB();

    const user = await findUserByEmail(db, payload.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 401,
      },
    );
  }
}

// ======================
// UPDATE PROFILE
// ======================

export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);

    const body = await request.json();

    const { name, phone } = body;

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required",
        },
        {
          status: 400,
        },
      );
    }

    const db = await connectDB();

    await updateProfile(db, payload.email, {
      name,
      phone,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
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
