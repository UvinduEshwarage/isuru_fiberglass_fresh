"use client";

import Link from "next/link";
import { Calendar, PieChart, BarChart2 } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Daily Sales Report",
      description:
        "View daily sales performance, transactions, and revenue trends",
      icon: Calendar,
      href: "/reports/daily",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Monthly Revenue Report",
      description: "Analyze monthly revenue patterns, growth, and comparisons",
      icon: PieChart,
      href: "/reports/monthly",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Product Performance Report",
      description: "Track product sales, inventory, and performance metrics",
      icon: BarChart2,
      href: "/reports/product-performance",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">
            Reports
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Generate and analyze business reports
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.href}
              href={report.href}
              className="group rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-300"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-linear-to-br ${report.color} mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-700">
                {report.title}
              </h3>

              <p className="text-sm text-slate-600 mb-4">
                {report.description}
              </p>

              <div className="inline-flex items-center text-sm font-medium text-slate-900 group-hover:translate-x-1 transition-transform">
                View Report →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Quick Insights
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium">Daily Reports</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">Track</p>
            <p className="text-xs text-blue-700 mt-1">
              Daily sales and transactions
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <p className="text-sm text-purple-900 font-medium">
              Monthly Analysis
            </p>
            <p className="text-2xl font-bold text-purple-600 mt-2">Analyze</p>
            <p className="text-xs text-purple-700 mt-1">
              Monthly revenue patterns
            </p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-sm text-emerald-900 font-medium">
              Product Metrics
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">Monitor</p>
            <p className="text-xs text-emerald-700 mt-1">
              Product performance trends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
