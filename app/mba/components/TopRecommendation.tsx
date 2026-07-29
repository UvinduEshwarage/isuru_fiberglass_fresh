"use client";

import { Award, ArrowRight } from "lucide-react";

interface TopRecommendationProps {
  product: string;
  confidence?: number;
}

export default function TopRecommendation({
  product,
  confidence,
}: TopRecommendationProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <Award className="h-8 w-8" />

        <div>
          <h2 className="text-2xl font-bold">
            Top Recommendation
          </h2>

          <p className="text-emerald-100">
            Highest priority recommendation from the Apriori model.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-white/10 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-emerald-100">
            Recommended Product
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {product}
          </h3>
        </div>

        <ArrowRight className="hidden h-8 w-8 md:block" />

        {confidence !== undefined && (
          <div className="rounded-2xl bg-white px-5 py-3 text-center text-slate-800">
            <div className="text-xs uppercase text-slate-500">
              Confidence
            </div>

            <div className="mt-1 text-2xl font-bold text-emerald-700">
              {(confidence * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}