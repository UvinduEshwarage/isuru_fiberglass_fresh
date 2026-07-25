"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface MonthlyData {
  month: string;
  revenue: number;
  invoiceCount: number;
  avgOrderValue: number;
  growth: number;
}

export default function MonthlyRevenueReportPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMonthlyData() {
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
          const invoices = data.invoices || [];
          const monthMap = new Map<string, { revenue: number; count: number; amounts: number[] }>();

          invoices.forEach((inv: any) => {
            const date = new Date(inv.date || inv.createdAt);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM

            if (!monthMap.has(monthKey)) {
              monthMap.set(monthKey, { revenue: 0, count: 0, amounts: [] });
            }

            const entry = monthMap.get(monthKey)!;
            entry.revenue += inv.totalAmount || 0;
            entry.count += 1;
            entry.amounts.push(inv.totalAmount || 0);
          });

          const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
          const data_array = months.map(([month, stats], idx) => ({
            month,
            revenue: stats.revenue,
            invoiceCount: stats.count,
            avgOrderValue: stats.count > 0 ? stats.revenue / stats.count : 0,
            growth: idx > 0 ? ((stats.revenue - (months[idx - 1][1].revenue)) / (months[idx - 1][1].revenue || 1)) * 100 : 0,
          }));

          setMonthlyData(data_array);
        } else {
          setError(data.error || "Failed to load monthly data");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadMonthlyData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
    const avgMonthly = monthlyData.length > 0 ? totalRevenue / monthlyData.length : 0;
    const totalInvoices = monthlyData.reduce((sum, m) => sum + m.invoiceCount, 0);

    return { totalRevenue, avgMonthly, totalInvoices };
  }, [monthlyData]);

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + "-01");
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-lg p-1.5 hover:bg-slate-100">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Monthly Revenue Report</h1>
          <p className="text-sm text-slate-600 mt-1">Revenue trends by month</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Avg Monthly</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(stats.avgMonthly)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Invoices</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.totalInvoices}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 text-sm">{monthlyData.length} months</h2>
        </div>

        {loading ? (
          <div className="text-center py-6 text-sm text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-red-600">{error}</div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-600">No data available</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Month
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Invoices
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Avg Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {monthlyData.map((month) => (
                <tr key={month.month} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatMonth(month.month)}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {formatCurrency(month.revenue)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700">{month.invoiceCount}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700">
                    {formatCurrency(month.avgOrderValue)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {month.growth > 0 ? (
                      <span className="text-emerald-600 font-medium">
                        ↑ {month.growth.toFixed(1)}%
                      </span>
                    ) : month.growth < 0 ? (
                      <span className="text-red-600 font-medium">
                        ↓ {Math.abs(month.growth).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
