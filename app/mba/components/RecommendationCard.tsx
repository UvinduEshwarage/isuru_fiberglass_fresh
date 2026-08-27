"use client";

import { Sparkles, ShoppingCart } from "lucide-react";

interface RecommendationCardProps {
  product: string;
  confidence?: number;
}

export default function RecommendationCard({
  product,
  confidence,
}: RecommendationCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-emerald-100 p-3">
          <ShoppingCart className="h-6 w-6 text-emerald-700" />
        </div>

        <Sparkles className="h-5 w-5 text-amber-500" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-800">{product}</h3>

      <p className="mt-2 text-sm text-slate-500">
        Recommended product based on Market Basket Analysis.
      </p>

      {confidence !== undefined && (
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm text-slate-500">Confidence</span>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
