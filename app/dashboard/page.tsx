"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import MonthlyRevenueChart from "../components/charts/MonthlyRevenueChart";
import CategoryRevenueChart from "../components/charts/CategoryRevenueChart";
import CategoryQuantityChart from "../components/charts/CategoryQuantityChart";
import QuarterRevenueChart from "../components/charts/QuarterRevenueChart";
import RecentTransactionsTable from "../components/RecentTransactionsTable";

interface DashboardResponse {
  totalRecords: number;
  totalRevenue: number;
  totalQuantity: number;
  averageRevenue: number;

  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];

  categoryRevenue: {
    category: string;
    revenue: number;
  }[];

  categoryQuantity: {
    category: string;
    quantity: number;
  }[];

  quarterRevenue: {
    quarter: string;
    revenue: number;
  }[];

  recentRecords: any[];
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchDashboard(token);
  }, []);

  async function fetchDashboard(token: string) {
    try {
      setLoading(true);

      const response = await fetch("/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load");
      }

      setDashboard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  const formatCurrency = (value: number) => {
    // Use localized number formatting and prefix with 'Rs.' for Sri Lankan Rupee
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);

    return `Rs. ${formatted}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";

    try {
      const d = new Date(value);
      return d.toLocaleString();
    } catch (e) {
      return String(value);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Analytics Dashboard
            </h1>
            
            
            

            <p className="text-slate-500">
              Revenue & Sales Overview
            </p>
          </div>

          
        </div>

        {/* KPI CARDS */}
        <div className="grid md:grid-cols-4 text-slate-800 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-slate-500 text-sm">
              Total Records
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {dashboard.totalRecords}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-slate-500 text-sm">
              Total Revenue
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(dashboard.totalRevenue)}
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-slate-500 text-sm">
              Total Quantity
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {dashboard.totalQuantity}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-slate-500 text-sm">
              Average Revenue  (per month)
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {formatCurrency(
                dashboard.averageRevenue
              )}
            </h2>
          </div>
        </div>

        {/* MONTHLY REVENUE */}
        <section id="revenue-summary" className="bg-white rounded-xl text-slate-800 shadow p-5 mb-8">
          <h2 className="font-semibold text-lg mb-2">
            Revenue Summary
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Monthly revenue trend for the business, plus top performance indicators.
          </p>

          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="text-base font-medium text-slate-700 mb-3">
              Monthly Revenue Trend
            </h3>
            <MonthlyRevenueChart
              data={dashboard.monthlyRevenue}
            />
          </div>
        </section>

        {/* QUARTER CHART */}
        <section id="sales-trends" className="bg-white text-slate-800 rounded-xl shadow p-5 mb-8">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-semibold text-lg mb-2">
                Sales Trends
              </h2>
              <p className="text-sm text-slate-500">
                Explore category performance, quantity trends, and quarterly revenue insight.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-base font-medium text-slate-700 mb-3">
                  Revenue by Category
                </h3>
                <CategoryRevenueChart data={dashboard.categoryRevenue} />
              </div>

              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-base font-medium text-slate-700 mb-3">
                  Quantity by Category
                </h3>
                <CategoryQuantityChart data={dashboard.categoryQuantity} />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-5">
              <h3 className="text-base font-medium text-slate-700 mb-3">
                Quarterly Revenue
              </h3>
              <QuarterRevenueChart data={dashboard.quarterRevenue} />
            </div>
          </div>
        </section>

        {/* RECENT RECORDS */}
        <RecentTransactionsTable records={dashboard.recentRecords} />



      </div>
    </div>
  );
}