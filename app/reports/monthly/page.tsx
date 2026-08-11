"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, TrendingUp, Calendar, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

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
    const latestGrowth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].growth : 0;

    return { totalRevenue, avgMonthly, totalInvoices, latestGrowth };
  }, [monthlyData]);

  const selectedMonthData = useMemo(() => {
    if (!selectedMonth || monthlyData.length === 0) return null;
    return monthlyData.find((m) => m.month === selectedMonth) || null;
  }, [selectedMonth, monthlyData]);

  // Set initial selected month to most recent
  useEffect(() => {
    if (monthlyData.length > 0 && !selectedMonth) {
      setSelectedMonth(monthlyData[monthlyData.length - 1].month);
    }
  }, [monthlyData, selectedMonth]);

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + "-01");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const formatMonthLong = (monthStr: string) => {
    const date = new Date(monthStr + "-01");
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const handleExport = () => {
    const csvContent = [
      ["Monthly Revenue Report"],
      [],
      ["Summary Stats"],
      ["Total Revenue", formatCurrency(stats.totalRevenue)],
      ["Average Monthly Revenue", formatCurrency(stats.avgMonthly)],
      ["Total Invoices", stats.totalInvoices],
      ["Latest Month Growth", stats.latestGrowth.toFixed(2) + "%"],
      [],
      ["Month Details"],
      ["Month", "Revenue", "Invoices", "Avg Order Value", "Growth %"],
      ...monthlyData.map((m) => [
        formatMonthLong(m.month),
        formatCurrency(m.revenue),
        m.invoiceCount,
        formatCurrency(m.avgOrderValue),
        m.growth.toFixed(2),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute("download", `monthly-revenue-report.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/reports" className="rounded-lg p-1.5 hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Monthly Report</p>
              <h1 className="text-3xl font-semibold text-slate-900">Revenue Trends</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {monthlyData.length > 0 && (
              <select
                value={selectedMonth || ""}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 cursor-pointer hover:bg-slate-50"
              >
                {monthlyData.map((month) => (
                  <option key={month.month} value={month.month}>
                    {formatMonthLong(month.month)}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
        </div>
      </div>

      {/* KPI Cards - Selected Month */}
      {selectedMonthData && (
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{formatMonthLong(selectedMonthData.month)} Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(selectedMonthData.revenue)}
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
                <p className="text-sm text-slate-500">Invoices</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {selectedMonthData.invoiceCount}
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
                <p className="text-sm text-slate-500">Avg Order Value</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(selectedMonthData.avgOrderValue)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100">
                <PieChart className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Month Growth</p>
                <p className={`text-3xl font-bold mt-2 ${selectedMonthData.growth > 0 ? 'text-emerald-600' : selectedMonthData.growth < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {selectedMonthData.growth > 0 ? '+' : ''}{selectedMonthData.growth.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-lg ${selectedMonthData.growth > 0 ? 'bg-emerald-100' : selectedMonthData.growth < 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
                {selectedMonthData.growth > 0 ? (
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats Section */}
      <div className="rounded-3xl bg-blue-50 p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Overall Summary</h2>
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4 border border-blue-100">
            <p className="text-xs font-medium text-blue-700 uppercase">Total Revenue (All Time)</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-blue-100">
            <p className="text-xs font-medium text-blue-700 uppercase">Average Monthly</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{formatCurrency(stats.avgMonthly)}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-blue-100">
            <p className="text-xs font-medium text-blue-700 uppercase">Total Invoices</p>
            <p className="text-2xl font-bold text-blue-900 mt-2">{stats.totalInvoices}</p>
          </div>
          <div className="rounded-xl bg-white p-4 border border-blue-100">
            <p className="text-xs font-medium text-blue-700 uppercase">Latest Month Growth</p>
            <p className={`text-2xl font-bold mt-2 ${stats.latestGrowth > 0 ? 'text-emerald-600' : stats.latestGrowth < 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {stats.latestGrowth > 0 ? '+' : ''}{stats.latestGrowth.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 text-lg">All Months ({monthlyData.length})</h2>
          <p className="text-sm text-slate-500 mt-1">Click on a row to view details for that month</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : monthlyData.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-600">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-6 text-slate-600 font-semibold">Month</th>
                  <th className="text-right py-3 px-6 text-slate-600 font-semibold">Revenue</th>
                  <th className="text-center py-3 px-6 text-slate-600 font-semibold">Invoices</th>
                  <th className="text-right py-3 px-6 text-slate-600 font-semibold">Avg Order</th>
                  <th className="text-center py-3 px-6 text-slate-600 font-semibold">Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => (
                  <tr 
                    key={month.month} 
                    onClick={() => setSelectedMonth(month.month)}
                    className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50 transition ${selectedMonth === month.month ? 'bg-blue-50' : ''}`}
                  >
                    <td className={`py-3 px-6 font-medium ${selectedMonth === month.month ? 'text-blue-900' : 'text-slate-900'}`}>{formatMonth(month.month)}</td>
                    <td className="py-3 px-6 text-right text-slate-900 font-semibold">
                      {formatCurrency(month.revenue)}
                    </td>
                    <td className="py-3 px-6 text-center text-slate-700">{month.invoiceCount}</td>
                    <td className="py-3 px-6 text-right text-slate-700">
                      {formatCurrency(month.avgOrderValue)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {month.growth > 0 ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <ArrowUpRight className="w-4 h-4" />
                          {month.growth.toFixed(1)}%
                        </div>
                      ) : month.growth < 0 ? (
                        <div className="inline-flex items-center gap-1 text-red-600 font-medium">
                          <ArrowDownRight className="w-4 h-4" />
                          {Math.abs(month.growth).toFixed(1)}%
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
