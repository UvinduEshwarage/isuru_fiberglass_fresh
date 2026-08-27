"use client";

import { FormEvent, useState } from "react";
import RecommendationPanel from "../../components/RecommendationPanel";
import TopRecommendation from "../components/TopRecommendation";
import RecommendationCard from "../components/RecommendationCard";

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

export default function RecommendationsPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    "Flower Pots",
    "Water Proof Tanks",
  ]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [rules, setRules] = useState<
    Array<{
      antecedents: string[];
      consequents: string[];
      support: number;
      confidence: number;
      lift: number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations([]);
    setRules([]);

    try {
      if (selectedProducts.length === 0) {
        throw new Error("Please select at least one product");
      }

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: selectedProducts, top_n: 5 }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error || payload.detail || "Failed to fetch recommendations",
        );
      }

      setRecommendations(payload.recommendations || []);
      setRules(payload.rules || []);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function toggleProduct(product: string) {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product],
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Product Recommendations
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Send a basket of products to the recommendation endpoint and get
            suggested complementary items.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl bg-white p-6 shadow-sm"
          >
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Select products
                </span>
                <p className="mt-2 text-xs text-slate-500 mb-3">
                  Choose products from your inventory to get recommendations
                </p>
              </label>

              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                {productCategories.map((product) => (
                  <label
                    key={product}
                    className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product)}
                      onChange={() => toggleProduct(product)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900"
                    />
                    <span className="text-sm text-slate-700">{product}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || selectedProducts.length === 0}
              className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? "Generating recommendations..."
                : "Get Recommendations"}
            </button>

            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </form>

          <aside className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                How it works
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select products from your inventory, then get recommendations
                based on association rules that show what products are
                frequently bought together.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Selected basket ({selectedProducts.length})
              </div>
              <div className="mt-3 space-y-2">
                {selectedProducts.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No products selected
                  </div>
                ) : (
                  selectedProducts.map((product) => (
                    <div
                      key={product}
                      className="rounded-lg bg-white px-3 py-2 text-sm text-slate-800"
                    >
                      {product}
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="space-y-6">
          {recommendations.length > 0 && (
            <TopRecommendation product={recommendations[0]} />
          )}

          {recommendations.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((product, index) => (
                <RecommendationCard key={index} product={product} />
              ))}
            </div>
          )}

          {rules.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">
                Matching Association Rules
              </h2>

              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="font-medium">
                      {rule.antecedents.join(", ")} →{" "}
                      {rule.consequents.join(", ")}
                    </div>

                    <div className="mt-2 flex gap-4 text-sm text-slate-500">
                      <span>Support: {rule.support.toFixed(3)}</span>

                      <span>Confidence: {rule.confidence.toFixed(3)}</span>

                      <span>Lift: {rule.lift.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
