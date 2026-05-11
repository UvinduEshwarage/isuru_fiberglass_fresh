import { NextRequest, NextResponse } from "next/server";
import { signJwt, verifyJwt } from "../../../lib/auth";
import { connectDB } from "../../../lib/mongodb";
import { createUser, ensureUserIndexes, findUserByEmail, hashPassword, verifyPassword } from "../../../lib/userModel";

const DEFAULT_ADMIN = {
  email: "admin@example.com",
  password: "password123",
  name: "Admin User",
  role: "admin",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const db = await connectDB();
  await ensureUserIndexes(db);

  let user = await findUserByEmail(db, email);
  if (!user && email === DEFAULT_ADMIN.email) {
    const { passwordHash, salt } = hashPassword(DEFAULT_ADMIN.password);
    await createUser(db, {
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: DEFAULT_ADMIN.role,
      passwordHash,
      salt,
    });
    user = await findUserByEmail(db, email);
  }

  if (!user || !verifyPassword(password, user)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signJwt({ email: user.email, name: user.name, role: user.role }, { expiresIn: 60 * 60 * 24 });
  return NextResponse.json({ token, user: { email: user.email, name: user.name, role: user.role } });
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Missing Authorization header" }, { status: 401 });
  }

  try {
    const payload = verifyJwt(token);
    return NextResponse.json({ valid: true, user: payload });
  } catch (error) {
    return NextResponse.json({ valid: false, error: (error as Error).message }, { status: 401 });
  }
}
