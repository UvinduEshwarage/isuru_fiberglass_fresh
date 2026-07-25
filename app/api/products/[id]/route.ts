import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "../../../../lib/mongodb";
import { verifyJwt } from "../../../../lib/auth";
import { productCollection } from "../../../../lib/productModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("Missing Authorization header");
  }
  return verifyJwt(token);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }

  const db = await connectDB();
  const resolvedParams: any = await params;
  const id = String(resolvedParams.id || resolvedParams?.productId || "");
  const product = await productCollection(db).findOne({ _id: new ObjectId(id) });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "No body provided" }, { status: 400 });
  }

  const db = await connectDB();
  const resolvedParams: any = await params;
  const id = String(resolvedParams.id || "");

  const update: any = {
    updatedAt: new Date().toISOString(),
  };

  if (body.name != null) update.name = String(body.name).trim();
  if (body.category != null) update.category = String(body.category).trim();
  if (body.description != null) update.description = String(body.description).trim();
  if (body.stock != null) update.stock = Number(body.stock);
  if (body.price != null) update.price = Number(body.price);
  if (body.active != null) update.active = Boolean(body.active);

  const result = await productCollection(db).updateOne({ _id: new ObjectId(id) }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Product updated" });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }

  const db = await connectDB();
  const resolvedParams: any = await params;
  const id = String(resolvedParams.id || "");
  const result = await productCollection(db).deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Product deleted" });
}
