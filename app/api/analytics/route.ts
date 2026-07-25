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
// ML ANALYTICS
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

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

// =========================
// GET DASHBOARD
// =========================
export async function GET(request: NextRequest) {
  try {
    // ---------------------
    // AUTH
    // ---------------------
    try {
      requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: (error as Error).message,
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------
    // DB
    // ---------------------
    const db = await connectDB();
    await ensureInvoiceIndexes(db);

    const invoices = await invoiceCollection(db).find().toArray();

    // =====================
    // BASIC STATS
    // =====================
    const invoiceCount = invoices.length;

    // Avoid double counting monthly revenue
    const uniqueMonthlyRevenue = new Map<string, number>();

    invoices.forEach((inv: any) => {
      const key = `${inv.Year}-${String(inv.Month).padStart(2, "0")}`;

      if (!uniqueMonthlyRevenue.has(key)) {
        uniqueMonthlyRevenue.set(
          key,
          Number(inv.MonthlyRevenue) || 0
        );
      }
    });

    const totalRevenue = [...uniqueMonthlyRevenue.values()].reduce(
      (sum, value) => sum + value,
      0
    );

    const averageInvoice =
      invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

    // =====================
    // MONTHLY REVENUE
    // =====================
    const monthlyRevenue: Record<string, number> = {};

    invoices.forEach((inv: any) => {
      const monthKey = `${inv.Year}-${String(inv.Month).padStart(
        2,
        "0"
      )}`;

      monthlyRevenue[monthKey] =
        Number(inv.MonthlyRevenue) || 0;
    });

    // =====================
    // PRODUCT REVENUE
    // =====================
    const productRevenue: Record<string, number> = {};

    invoices.forEach((inv: any) => {
      const category = inv.ProductCategory;

      productRevenue[category] =
        (productRevenue[category] || 0) +
        (Number(inv.Quantity) || 0);
    });

    const topProducts = Object.entries(productRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([product, quantity]) => ({
        product,
        quantity,
      }));

    // =====================
    // QUARTER REVENUE
    // =====================
    const quarterRevenue: Record<string, number> = {};

    invoices.forEach((inv: any) => {
      const quarter = inv.Quarter;

      quarterRevenue[quarter] =
        (quarterRevenue[quarter] || 0) +
        (Number(inv.MonthlyRevenue) || 0);
    });

    // =====================
    // RECENT RECORDS
    // =====================
    const recentInvoices = [...invoices]
      .sort((a: any, b: any) => {
        if (a.Year !== b.Year) {
          return b.Year - a.Year;
        }

        return b.Month - a.Month;
      })
      .slice(0, 5);

    // =====================
    // ML DATA
    // =====================
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

    // =====================
    // RESPONSE
    // =====================
    return NextResponse.json({
      success: true,

      summary: {
        invoiceCount,
        totalRevenue,
        averageInvoice,
      },

      monthlyRevenue,

      topProducts,

      quarterRevenue,

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
      {
        status: 500,
      }
    );
  }
}