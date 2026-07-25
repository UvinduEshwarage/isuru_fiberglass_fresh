"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PredictionHistoryItem = {
  id: string;
  createdAt: string;
  requestData: Record<string, string | number | boolean>;
  predictedRevenue: number;
};

export default function PredictionHistoryPage() {
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("revenuePredictionHistory");
    if (!saved) return;

    try {
      setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prediction History</h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Review revenue forecasts you generated previously using the existing prediction API endpoint.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">No saved forecasts yet</h2>
            <p className="mt-3 text-slate-500">
              The history view will list prior predictions and the input values used for each forecast.
            </p>

            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Generate a forecast from the Forecast page to save it here.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="text-sm text-slate-500">Created</p>
                    <p className="text-base font-medium text-slate-900">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                    {formatCurrency(item.predictedRevenue)}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {Object.entries(item.requestData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</p>
                      <p className="mt-1 text-sm text-slate-700">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <Link
            href="/predict/forecast"
            className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Forecast Page
          </Link>
        </div>
      </div>
    </div>
  );
}
