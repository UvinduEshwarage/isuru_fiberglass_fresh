import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
// import { ensureInvoiceIndexes, invoiceCollection, InvoiceDocument } from "../../../lib/invoiceModel";
import {
  ensureNewInvoiceIndexes,
  newInvoiceCollection,
  NewInvoiceDocument,
} from "../../../lib/newInvoiceModel";

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("Missing Authorization header");
  }
  return verifyJwt(token);
}

function generateInvoiceId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${datePart}-${randomPart}`;
}

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }

  const db = await connectDB();
  await ensureNewInvoiceIndexes(db);
  const invoices = await newInvoiceCollection(db)
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (Number(invoice.totalPrice) || 0),
    0,
  );
  const invoiceCount = invoices.length;

  const monthlyRevenue: Record<string, number> = {};
  invoices.forEach((invoice) => {
    const date = new Date(invoice.date || invoice.createdAt);
    if (Number.isNaN(date.valueOf())) return;
    const month = date.toISOString().slice(0, 7);
    monthlyRevenue[month] =
      (monthlyRevenue[month] || 0) + (Number(invoice.totalPrice) || 0);
  });

  return NextResponse.json({
    invoices,
    summary: {
      totalRevenue,
      invoiceCount,
      monthlyRevenue,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const customerName = body?.customerName;
  const items = Array.isArray(body?.items) ? (body.items as any[]) : null;
  const date = body?.date ? new Date(body.date) : new Date();

  if (!customerName || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Request must include customerName and an array of items" },
      { status: 400 },
    );
  }

  const invoiceTotal = items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return sum + price * quantity;
  }, 0);

  const invoice = {
    InvoiceID: generateInvoiceId(),
    customerName,
    items,
    totalPrice: invoiceTotal,
    date: date.toISOString(),
    createdAt: new Date().toISOString(),
  };

  const db = await connectDB();
  await ensureNewInvoiceIndexes(db);
  const result = await newInvoiceCollection(db).insertOne(invoice);

  return NextResponse.json(
    { invoice: { ...invoice, _id: result.insertedId.toString() } },
    { status: 201 },
  );
}
