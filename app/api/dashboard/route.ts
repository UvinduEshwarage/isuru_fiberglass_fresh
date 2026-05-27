import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
import {
  ensureInvoiceIndexes,
  invoiceCollection,
} from "../../../lib/invoiceModel";

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
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 }
    );
  }

  const db = await connectDB();
  await ensureInvoiceIndexes(db);

  const invoices = await invoiceCollection(db).find().toArray();

  // =========================
  // BASIC STATS
  // =========================
  const invoiceCount = invoices.length;

  const totalRevenue = invoices.reduce((sum, invoice: any) => {
    return sum + (Number(invoice.totalPrice) || 0);
  }, 0);

  const averageInvoice =
    invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

  // =========================
  // ANALYTICS MAPS
  // =========================
  const monthlyRevenue: Record<string, number> = {};
  const customerRevenue: Record<string, number> = {};
  const productRevenue: Record<string, number> = {};

  invoices.forEach((invoice: any) => {
    // -------------------------
    // DATE
    // -------------------------
    const date = new Date(invoice.date);

    const month = Number.isNaN(date.valueOf())
      ? "unknown"
      : date.toISOString().slice(0, 7);

    // -------------------------
    // REVENUE
    // -------------------------
    const revenue = Number(invoice.totalPrice) || 0;

    // -------------------------
    // MONTHLY
    // -------------------------
    monthlyRevenue[month] =
      (monthlyRevenue[month] || 0) + revenue;

    // -------------------------
    // CUSTOMER
    // -------------------------
    const customer =
      invoice.customerName || "Unknown Customer";

    customerRevenue[customer] =
      (customerRevenue[customer] || 0) + revenue;

    // -------------------------
    // PRODUCT
    // -------------------------
    const product =
      invoice.productName || "Unknown Product";

    productRevenue[product] =
      (productRevenue[product] || 0) + revenue;
  });

  // =========================
  // TOP CUSTOMERS
  // =========================
  const topCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerName, revenue]) => ({
      customerName,
      revenue,
    }));

  // =========================
  // TOP PRODUCTS
  // =========================
  const topProducts = Object.entries(productRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([product, revenue]) => ({
      product,
      revenue,
    }));

  // =========================
  // RECENT INVOICES
  // =========================
  const recentInvoices = invoices
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5);

  // =========================
  // RESPONSE
  // =========================
  return NextResponse.json({
    invoiceCount,
    totalRevenue,
    averageInvoice,
    monthlyRevenue,
    topCustomers,
    topProducts,
    recentInvoices,
  });
}