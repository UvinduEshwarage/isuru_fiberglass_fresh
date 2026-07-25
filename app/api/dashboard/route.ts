import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { verifyJwt } from "../../../lib/auth";
import {
  ensureInvoiceIndexes,
  invoiceCollection,
} from "../../../lib/invoiceModel";
import {
  ensureNewInvoiceIndexes,
  newInvoiceCollection,
} from "../../../lib/newInvoiceModel";

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
      {
        error: (error as Error).message,
      },
      {
        status: 401,
      }
    );
  }

  try {
    const db = await connectDB();

    await ensureInvoiceIndexes(db);

    const invoices = await invoiceCollection(db).find().toArray();

    // fetch recent records from new_invoices collection
    await ensureNewInvoiceIndexes(db);

    const newInvoices = await newInvoiceCollection(db)
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // map new invoice documents to a shape compatible with the dashboard table
    const recentFromNew = newInvoices.map((n) => {
      const date = n.date ? new Date(n.date) : new Date(n.createdAt || Date.now());
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const quantity = Array.isArray(n.items)
        ? n.items.reduce((s, it) => s + (it.quantity || 0), 0)
        : 0;

      const category = Array.isArray(n.items) && n.items.length > 0
        ? n.items[0].name
        : n.customerName || "-";

      return {
        Year: year,
        Month: month,
        ProductCategory: category,
        Quantity: quantity,
        MonthlyRevenue: n.totalPrice || 0,
        // keep original for reference
        _source: "new_invoices",
        _id: n._id,
        createdAt: n.createdAt,
      };
    });

    // ======================
    // Basic Statistics
    // ======================

    const totalRecords = invoices.length;

    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + (invoice.MonthlyRevenue || 0),
      0
    );

    const totalQuantity = invoices.reduce(
      (sum, invoice) => sum + (invoice.Quantity || 0),
      0
    );

    const averageRevenue =
      totalRecords > 0 ? totalRevenue / totalRecords : 0;

    // ======================
    // Monthly Revenue
    // ======================

    const monthlyRevenueMap: Record<string, number> = {};

    invoices.forEach((invoice) => {
      const monthKey = `${invoice.Year}-${String(
        invoice.Month
      ).padStart(2, "0")}`;

      monthlyRevenueMap[monthKey] =
        (monthlyRevenueMap[monthKey] || 0) +
        invoice.MonthlyRevenue;
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month,
        revenue,
      }));

    // ======================
    // Category Revenue
    // ======================

    const categoryRevenueMap: Record<string, number> = {};

    invoices.forEach((invoice) => {
      categoryRevenueMap[invoice.ProductCategory] =
        (categoryRevenueMap[invoice.ProductCategory] || 0) +
        invoice.MonthlyRevenue;
    });

    const categoryRevenue = Object.entries(categoryRevenueMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, revenue]) => ({
        category,
        revenue,
      }));

    // ======================
    // Category Quantity
    // ======================

    const categoryQuantityMap: Record<string, number> = {};

    invoices.forEach((invoice) => {
      categoryQuantityMap[invoice.ProductCategory] =
        (categoryQuantityMap[invoice.ProductCategory] || 0) +
        invoice.Quantity;
    });

    const categoryQuantity = Object.entries(categoryQuantityMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category, quantity]) => ({
        category,
        quantity,
      }));

    // ======================
    // Quarter Revenue
    // ======================

    const quarterRevenueMap: Record<string, number> = {};

    invoices.forEach((invoice) => {
      quarterRevenueMap[invoice.Quarter] =
        (quarterRevenueMap[invoice.Quarter] || 0) +
        invoice.MonthlyRevenue;
    });

    const quarterRevenue = Object.entries(quarterRevenueMap).map(
      ([quarter, revenue]) => ({
        quarter,
        revenue,
      })
    );

    // ======================
    // Recent Records
    // ======================

    const recentFromOld = [...invoices]
      .sort((a, b) => {
        if (a.Year !== b.Year) {
          return b.Year - a.Year;
        }

        return b.Month - a.Month;
      })
      .slice(0, 10);

    // Combine recent records: prefer new_invoices first, then fill from old invoices
    const recentRecords = [...recentFromNew];

    for (const r of recentFromOld) {
      if (recentRecords.length >= 10) break;
      recentRecords.push(r as any);
    }

    return NextResponse.json({
      totalRecords,
      totalRevenue,
      totalQuantity,
      averageRevenue,
      monthlyRevenue,
      categoryRevenue,
      categoryQuantity,
      quarterRevenue,
      recentRecords,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}