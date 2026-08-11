"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, TrendingUp, Calendar, Package } from "lucide-react";

interface Invoice {
  _id: string;
  customerName: string;
  date: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  createdAt: string;
}

export default function DailySalesReportPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function loadInvoices() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/billing", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.invoices || []);
        } else {
          setError(data.error || "Failed to load invoices");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Extract date part from invoice date (handles both full timestamp and date-only formats)
      const invDate = inv.date || inv.createdAt;
      const invDateOnly = new Date(invDate).toISOString().slice(0, 10);
      return invDateOnly === selectedDate;
    });
  }, [invoices, selectedDate]);

  const dailyStats = useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const count = filteredInvoices.length;
    const avgValue = count > 0 ? total / count : 0;
    const totalQuantity = filteredInvoices.reduce((sum, inv) => sum + inv.items.reduce((s, item) => s + item.quantity, 0), 0);

    return { total, count, avgValue, totalQuantity };
  }, [filteredInvoices]);

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExport = () => {
    const csvContent = [
      ["Daily Sales Report"],
      ["Date", formatDate(selectedDate)],
      [],
      ["Metric", "Value"],
      ["Total Revenue", formatCurrency(dailyStats.total)],
      ["Total Transactions", dailyStats.count],
      ["Total Quantity Sold", dailyStats.totalQuantity],
      ["Average Order Value", formatCurrency(dailyStats.avgValue)],
      [],
      ["Transactions"],
      ["Customer Name", "Items", "Quantity", "Amount", "Time"],
      ...filteredInvoices.map((invoice) => {
        const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
        const time = new Date(invoice.createdAt).toLocaleTimeString();
        return [
          invoice.customerName,
          invoice.items.map((item) => item.name).join("; "),
          totalQty,
          formatCurrency(invoice.totalAmount || 0),
          time,
        ];
      }),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute("download", `daily-sales-${selectedDate}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/reports" className="rounded-lg p-1.5 hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Daily Report</p>
              <h1 className="text-3xl font-semibold text-slate-900">Sales Report</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 cursor-pointer"
            />
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatCurrency(dailyStats.total)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Transactions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {dailyStats.count}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {dailyStats.totalQuantity}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg Order Value</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatCurrency(dailyStats.avgValue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 text-lg">{filteredInvoices.length} Transaction{filteredInvoices.length !== 1 ? 's' : ''}</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-600">No sales on {formatDate(selectedDate)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-6 text-slate-600 font-semibold">Customer</th>
                  <th className="text-left py-3 px-6 text-slate-600 font-semibold">Items</th>
                  <th className="text-center py-3 px-6 text-slate-600 font-semibold">Qty</th>
                  <th className="text-right py-3 px-6 text-slate-600 font-semibold">Amount</th>
                  <th className="text-left py-3 px-6 text-slate-600 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
                  const time = new Date(invoice.createdAt).toLocaleTimeString();
                  return (
                    <tr key={invoice._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-6 text-slate-900 font-medium">{invoice.customerName}</td>
                      <td className="py-3 px-6 text-slate-700">
                        {invoice.items.map((item) => item.name).join(", ")}
                      </td>
                      <td className="py-3 px-6 text-center text-slate-700">{totalQty}</td>
                      <td className="py-3 px-6 text-right text-slate-900 font-semibold">
                        {formatCurrency(invoice.totalAmount || 0)}
                      </td>
                      <td className="py-3 px-6 text-slate-600">{time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
