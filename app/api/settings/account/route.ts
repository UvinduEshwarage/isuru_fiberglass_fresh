import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { verifyJwt, signJwt } from "../../../../lib/auth";
import {
  findUserByEmail,
  verifyPassword,
  hashPassword,
  updateAccount,
} from "../../../../lib/userModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  return verifyJwt(token);
}

// ==========================================
// UPDATE ACCOUNT (EMAIL / PASSWORD)
// ==========================================

export async function PUT(request: NextRequest) {
  try {
    const payload = requireAuth(request);

    const body = await request.json();

    const { currentPassword, newEmail, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        {
          error: "Current password is required",
        },
        {
          status: 400,
        },
      );
    }

    const db = await connectDB();

    // Find current user
    const user = await findUserByEmail(db, payload.email);

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user)) {
      return NextResponse.json(
        {
          error: "Current password is incorrect",
        },
        {
          status: 401,
        },
      );
    }

    // Determine final email
    const email =
      newEmail && newEmail.trim() !== "" ? newEmail.trim() : user.email;

    // Prevent duplicate email
    if (email !== user.email) {
      const existing = await findUserByEmail(db, email);

      if (existing) {
        return NextResponse.json(
          {
            error: "Email is already in use",
          },
          {
            status: 409,
          },
        );
      }
    }

    // Determine final password
    let passwordHash = user.passwordHash;
    let salt = user.salt;

    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            error: "Password must be at least 6 characters",
          },
          {
            status: 400,
          },
        );
      }

      const hashed = hashPassword(newPassword);

      passwordHash = hashed.passwordHash;
      salt = hashed.salt;
    }

    // Update account
    await updateAccount(db, user.email, {
      email,
      passwordHash,
      salt,
    });

    // Create a fresh JWT
    const token = signJwt(
      {
        email,
        name: user.name,
        role: user.role,
      },
      {
        expiresIn: 60 * 60 * 24,
      },
    );

    return NextResponse.json({
      message: "Account updated successfully.",
      token,
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
