"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const productCategories = [
  "Tables and Benches",
  "Flower Pots",
  "Temple Items",
  "Garden Animal Moulds",
  "Chemical Proof Tanks",
  "Slab Moulds",
  "Kanu Moulds",
  "Beeralu Moulds",
  "Molding Pati",
  "Kalugal Moulds",
  "Silparan Kota",
  "Loover",
  "Roofing Sheets",
  "Bathik Tanks",
  "Water Proof Tanks",
  "Interlock",
  "Doors",
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear + i);

function getQuarter(month: number) {
  if (month >= 1 && month <= 3) return "Q1";
  if (month >= 4 && month <= 6) return "Q2";
  if (month >= 7 && month <= 9) return "Q3";
  return "Q4";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

type PredictionHistoryItem = {
  id: string;
  createdAt: string;
  requestData: Record<string, string | number | boolean>;
  predictedRevenue: number;
};

export default function ForecastPage() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [productCategory, setProductCategory] = useState("Tables and Benches");
  const [quantity, setQuantity] = useState(10);
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonOverride, setSeasonOverride] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [predictedRevenue, setPredictedRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);

  const requestData = useMemo(
    () => ({
      Year: year,
      Month: month,
      Quarter: getQuarter(month),
      MonthName: monthOptions.find((item) => item.value === month)?.label || "January",
      ProductCategory: productCategory,
      Quantity: quantity,
      IsSeasonal: isSeasonal,
    }),
    [year, month, productCategory, quantity, isSeasonal]
  );

  // Basic heuristic to auto-detect seasonality from category or month.
  function detectSeasonality(cat: string, m: number) {
    const seasonalCategories = new Set([
      "Flower Pots",
      "Garden Animal Moulds",
      "Temple Items",
      "Bathik Tanks",
      "Seasonal",
    ]);

    if (seasonalCategories.has(cat)) return true;

    // Example: months with higher seasonal demand (Mar-May and Sep-Nov)
    if ([3, 4, 5, 9, 10, 11].includes(m)) return true;

    return false;
  }

  // Keep isSeasonal synced automatically unless user overrides it
  useEffect(() => {
    if (!seasonOverride) {
      setIsSeasonal(detectSeasonality(productCategory, month));
    }
  }, [productCategory, month, seasonOverride]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("revenuePredictionHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  function savePrediction(result: number) {
    const entry: PredictionHistoryItem = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      requestData,
      predictedRevenue: result,
    };

    const updatedHistory = [entry, ...history].slice(0, 20);
    setHistory(updatedHistory);
    window.localStorage.setItem("revenuePredictionHistory", JSON.stringify(updatedHistory));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPredictedRevenue(null);
    setLoading(true);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: requestData }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || payload.detail || "Prediction failed");
      }

      setPredictedRevenue(payload.predicted_revenue);
      savePrediction(payload.predicted_revenue);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Revenue Forecast</h1>
            <p className="mt-2 text-slate-500 max-w-2xl">
              Enter the feature values below to request a revenue prediction from the ML model.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Input features</h2>
            <p className="mt-2 text-sm text-slate-500">
              The prediction model uses year, month, quarter, product category, quantity, and seasonality.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Year</span>
                <select
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {yearOptions.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Month</span>
                <select
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {monthOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Product Category</span>
                <select
                  value={productCategory}
                  onChange={(event) => setProductCategory(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {productCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Seasonality</p>
                <p className="text-sm text-slate-500">Auto-detected from category/month. Override if needed.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`rounded-2xl px-4 py-2 text-sm font-semibold ${isSeasonal ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {isSeasonal ? "Seasonal" : "Not seasonal"}
                </div>

                <button
                  type="button"
                  onClick={() => setSeasonOverride((s) => !s)}
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium bg-slate-50 text-slate-700"
                >
                  {seasonOverride ? "Stop override" : "Override"}
                </button>
              </div>
            </div>

            {seasonOverride && (
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={isSeasonal} onChange={(e) => setIsSeasonal(e.target.checked)} />
                  <span className="text-sm text-slate-700">Force seasonal</span>
                </label>
              </div>
            )}

            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-700">Computed features</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <span className="font-medium">Quarter:</span> {requestData.Quarter}
                </div>
                <div>
                  <span className="font-medium">Month Name:</span> {requestData.MonthName}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Predicting revenue..." : "Predict Revenue"}
            </button>

            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </form>

          <aside className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-800">Prediction result</h2>
              <p className="text-slate-500">
                The model returns an estimated revenue value based on the selected input features.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              <div className="flex items-center justify-between">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Current payload</div>
                <button
                  type="button"
                  onClick={() => setShowPayload((s) => !s)}
                  className="text-sm text-slate-600 underline"
                >
                  {showPayload ? "Hide payload" : "Show payload"}
                </button>
              </div>

              {showPayload && (
                <pre className="mt-3 overflow-x-auto text-sm text-slate-800">
                  {JSON.stringify(requestData, null, 2)}
                </pre>
              )}
            </div>

            <div className="rounded-3xl bg-slate-900 p-5 text-white">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Predicted revenue</div>
              <div className="mt-4 text-3xl font-semibold">
                {predictedRevenue !== null ? formatCurrency(predictedRevenue) : "No prediction yet"}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
