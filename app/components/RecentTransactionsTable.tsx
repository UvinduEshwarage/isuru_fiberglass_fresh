"use client";

import React from "react";

interface RecordRow {
  Year?: number | string;
  Month?: number | string;
  ProductCategory?: string;
  Quantity?: number;
  MonthlyRevenue?: number;
  _source?: string;
  createdAt?: string;
  [key: string]: any;
}

export default React.memo(function RecentTransactionsTable({
  records,
}: {
  records: RecordRow[];
}) {
  const formatCurrency = (value: number) => {
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

  return (
    <div className="bg-white text-slate-800 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <p className="text-sm text-slate-500">
            Latest sales and revenue activity
          </p>
        </div>

        <span className="text-sm text-slate-500">{records.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Period
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quantity
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Revenue
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Source
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Created
              </th>
            </tr>
          </thead>

          <tbody>
            {records.map((record: RecordRow, index: number) => (
              <tr
                key={index}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">
                    {record.Year}
                  </div>
                  <div className="text-xs text-slate-500">
                    Month {record.Month}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    {record.ProductCategory}
                  </span>
                </td>

                <td className="px-6 py-4 text-right font-medium">
                  {record.Quantity?.toLocaleString?.()}
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(record.MonthlyRevenue || 0)}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${record._source === "new_invoices" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}
                  >
                    {record._source === "new_invoices" ? "New" : "Historical"}
                  </span>
                </td>

                <td className="px-6 py-4 text-center text-sm text-slate-500">
                  {formatDate(record.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
