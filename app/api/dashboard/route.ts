import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
import { ensureInvoiceIndexes, invoiceCollection } from "../../../lib/invoiceModel";

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
  await ensureInvoiceIndexes(db);
  const invoices = await invoiceCollection(db).find().toArray();

  const invoiceCount = invoices.length;
  const totalRevenue = invoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
  const averageInvoice = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

  const monthlyRevenue: Record<string, number> = {};
  const customerRevenue: Record<string, number> = {};
  const productRevenue: Record<string, number> = {};

  invoices.forEach((invoice) => {
    const date = new Date(invoice.date || invoice.createdAt);
    const month = Number.isNaN(date.valueOf()) ? "unknown" : date.toISOString().slice(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (Number(invoice.total) || 0);
    customerRevenue[invoice.customerName] = (customerRevenue[invoice.customerName] || 0) + (Number(invoice.total) || 0);

    Array.isArray(invoice.items) && invoice.items.forEach((item) => {
      const name = item?.name || "Unknown product";
      const quantity = Number(item?.quantity) || 1;
      const price = Number(item?.price) || 0;
      productRevenue[name] = (productRevenue[name] || 0) + quantity * price;
    });
  });

  const topCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerName, revenue]) => ({ customerName, revenue }));

  const topProducts = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([product, revenue]) => ({ product, revenue }));

  return NextResponse.json({
    invoiceCount,
    totalRevenue,
    averageInvoice,
    monthlyRevenue,
    topCustomers,
    topProducts,
  });
}
