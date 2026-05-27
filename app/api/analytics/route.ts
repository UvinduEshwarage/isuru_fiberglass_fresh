import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
import {
  invoiceCollection,
  ensureInvoiceIndexes,
} from "../../../lib/invoiceModel";
import { getMlServiceUrl, MlTrendRecord } from "../../../lib/ml";

// =========================
// AUTH
// =========================
function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new Error("Missing Authorization header");
  }

  return verifyJwt(token);
}

// =========================
// ML ANALYTICS (SAFE)
// =========================
async function fetchTrendAnalysis(records: MlTrendRecord[]) {
  try {
    const mlUrl = getMlServiceUrl();

    const response = await fetch(`${mlUrl}/analytics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

// =========================
// GET ANALYTICS
// =========================
export async function GET(request: NextRequest) {
  try {
    // -------------------------
    // AUTH
    // -------------------------
    try {
      requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: (error as Error).message },
        { status: 401 }
      );
    }

    // -------------------------
    // DB
    // -------------------------
    const db = await connectDB();
    await ensureInvoiceIndexes(db);

    const invoices = await invoiceCollection(db).find().toArray();

    // =========================
    // BASIC STATS
    // =========================
    const invoiceCount = invoices.length;

    const totalRevenue = invoices.reduce((sum, inv: any) => {
      return sum + (Number(inv.totalPrice) || 0);
    }, 0);

    const averageInvoice =
      invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

    // =========================
    // ANALYTICS MAPS
    // =========================
    const monthlyRevenue: Record<string, number> = {};
    const productRevenue: Record<string, number> = {};
    const categoryRevenue: Record<string, number> = {};

    // =========================
    // PROCESS DATA
    // =========================
    invoices.forEach((inv: any) => {
      const date = inv.date ? new Date(inv.date) : new Date();

      const month = Number.isNaN(date.valueOf())
        ? "Unknown"
        : date.toISOString().slice(0, 7);

      const revenue = Number(inv.totalPrice) || 0;

      // -------------------------
      // MONTHLY
      // -------------------------
      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) + revenue;

      // -------------------------
      // PRODUCT
      // -------------------------
      const product = inv.productName || "Unknown Product";

      productRevenue[product] =
        (productRevenue[product] || 0) + revenue;

      // -------------------------
      // CATEGORY
      // -------------------------
      const category = inv.category || "Unknown Category";

      categoryRevenue[category] =
        (categoryRevenue[category] || 0) + revenue;
    });

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
    // TOP CATEGORIES
    // =========================
    const topCategories = Object.entries(categoryRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, revenue]) => ({
        category,
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
    // ML TREND DATA
    // =========================
    const records: MlTrendRecord[] = Object.entries(
      monthlyRevenue
    ).map(([month, revenue]) => ({
      date: `${month}-01`,
      revenue,
    }));

    const trendAnalysis =
      records.length > 0
        ? await fetchTrendAnalysis(records)
        : null;

    // =========================
    // RESPONSE
    // =========================
    return NextResponse.json({
      success: true,

      summary: {
        invoiceCount,
        totalRevenue,
        averageInvoice,
      },

      monthlyRevenue,

      topProducts,

      topCategories,

      recentInvoices,

      trendAnalysis,
    });
  } catch (error) {
    console.error("Analytics Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}