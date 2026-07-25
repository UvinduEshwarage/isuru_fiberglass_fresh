"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

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
    return invoices.filter((inv) => inv.date === selectedDate);
  }, [invoices, selectedDate]);

  const dailyStats = useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const count = filteredInvoices.length;
    const avgValue = count > 0 ? total / count : 0;

    return { total, count, avgValue };
  }, [filteredInvoices]);

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-lg p-1.5 hover:bg-slate-100">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Daily Sales Report</h1>
          <p className="text-sm text-slate-600 mt-1">for {selectedDate}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 border border-slate-200">
        <label className="space-y-2 max-w-xs">
          <span className="text-sm font-medium text-slate-700">Select Date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Sales</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dailyStats.total)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{dailyStats.count}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Avg Order Value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(dailyStats.avgValue)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 text-sm">{filteredInvoices.length} transaction{filteredInvoices.length !== 1 ? 's' : ''}</h2>
        </div>

        {loading ? (
          <div className="text-center py-6 text-sm text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-red-600">{error}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-600">No sales on this date</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredInvoices.map((invoice) => {
                const totalQty = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
                const time = new Date(invoice.createdAt).toLocaleTimeString();
                return (
                  <tr key={invoice._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{invoice.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {invoice.items.map((item) => item.name).join(", ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{totalQty}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(invoice.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
