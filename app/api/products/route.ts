import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
import { ensureProductIndexes, productCollection, ProductDocument } from "../../../lib/productModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("Missing Authorization header");
  }
  return verifyJwt(token);
}

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }

  const db = await connectDB();
  await ensureProductIndexes(db);

  const search = request.nextUrl.searchParams.get("search") || "";
  const limitParam = request.nextUrl.searchParams.get("limit");
  const skipParam = request.nextUrl.searchParams.get("skip");
  const filter: any = { active: true };

  if (search) {
    const q = new RegExp(search, "i");
    filter.$or = [{ productId: q }, { name: q }, { category: q }, { description: q }];
  }

  let cursor = productCollection(db).find(filter).sort({ name: 1 });

  if (limitParam) {
    const l = Number(limitParam);
    if (!Number.isNaN(l) && l > 0) cursor = cursor.limit(l);
  }

  if (skipParam) {
    const s = Number(skipParam);
    if (!Number.isNaN(s) && s > 0) cursor = cursor.skip(s);
  }

  const products = await cursor.toArray();

  const normalizedProducts = products.map((product) => ({
    ...product,
    _id: product._id?.toString() || "",
  }));

  return NextResponse.json({ products: normalizedProducts });
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.productId || !body.name || body.stock == null || body.price == null) {
    return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
  }

  const product: ProductDocument = {
    productId: String(body.productId).trim(),
    name: String(body.name).trim(),
    category: String(body.category || "Uncategorized").trim(),
    description: body.description ? String(body.description).trim() : "",
    stock: Number(body.stock) || 0,
    price: Number(body.price) || 0,
    active: body.active !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = await connectDB();
  await ensureProductIndexes(db);

  try {
    const result = await productCollection(db).insertOne(product);
    return NextResponse.json({ product: { ...product, _id: result.insertedId.toString() } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unable to create product" }, { status: 500 });
  }
}
