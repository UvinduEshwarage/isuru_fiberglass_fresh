"use client";

import { useEffect, useState } from "react";
import MonthlyRevenueChart from "../../components/charts/MonthlyRevenueChart";
import QuarterRevenueChart from "../../components/charts/QuarterRevenueChart";

type TrendRecord = {
  date: string;
  revenue: number;
};

type TrendResponse = {
  monthly_revenue: { month: string; revenue: number }[];
  total_revenue: number;
  average_revenue: number;
  record_count: number;
  trend_direction: string;
};

function getQuarter(month: number) {
  if (month >= 1 && month <= 3) return "Q1";
  if (month >= 4 && month <= 6) return "Q2";
  if (month >= 7 && month <= 9) return "Q3";
  return "Q4";
}

export default function ForecastChartsPage() {
  const [monthlyData, setMonthlyData] = useState<
    TrendResponse["monthly_revenue"]
  >([]);
  const [quarterData, setQuarterData] = useState<
    { quarter: string; revenue: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sampleRecords: TrendRecord[] = [
      { date: "2026-01-01", revenue: 420000 },
      { date: "2026-02-01", revenue: 450000 },
      { date: "2026-03-01", revenue: 470000 },
      { date: "2026-04-01", revenue: 500000 },
      { date: "2026-05-01", revenue: 530000 },
      { date: "2026-06-01", revenue: 560000 },
    ];

    async function loadTrends() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/revenue-trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: sampleRecords }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(
            payload.error || payload.detail || "Failed to load forecast charts",
          );
        }

        setMonthlyData(payload.monthly_revenue);

        const quarterMap = new Map<string, number>();
        payload.monthly_revenue.forEach(
          (item: { month: string; revenue: number }) => {
            const monthIndex = Number(item.month.split("-")[1]);
            const quarter = getQuarter(monthIndex);
            quarterMap.set(
              quarter,
              (quarterMap.get(quarter) || 0) + item.revenue,
            );
          },
        );

        setQuarterData(
          Array.from(quarterMap.entries()).map(([quarter, revenue]) => ({
            quarter,
            revenue,
          })),
        );
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadTrends();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Forecast Charts</h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Visualize projected revenue trends using the existing revenue trends
            endpoint.
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Projected Monthly Forecast
                </h2>
              </div>
            </div>
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                Loading chart...
              </div>
            ) : (
              <MonthlyRevenueChart data={monthlyData} />
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Quarterly Forecast
                </h2>
                <p className="text-sm text-slate-500">
                  Calculated from the trend response data.
                </p>
              </div>
            </div>
            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                Loading chart...
              </div>
            ) : (
              <QuarterRevenueChart data={quarterData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
