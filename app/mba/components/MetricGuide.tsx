"use client";

import { BarChart3, ShieldCheck, TrendingUp } from "lucide-react";

const metrics = [
  {
    title: "Support",
    icon: BarChart3,
    color: "bg-blue-50 text-blue-700",
    description:
      "Support measures how frequently a product combination appears in all transactions. Higher support indicates a more common purchasing pattern.",
  },
  {
    title: "Confidence",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-700",
    description:
      "Confidence indicates the probability that customers who purchase the antecedent products will also purchase the consequent products.",
  },
  {
    title: "Lift",
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-700",
    description:
      "Lift evaluates the strength of an association. A lift greater than 1 indicates products are purchased together more often than expected by chance.",
  },
];

export default function MetricGuide() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">
        Understanding Association Metrics
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        These metrics help evaluate the quality and usefulness of association
        rules generated using the Apriori algorithm.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.title}
              className="rounded-2xl border border-slate-100 p-5"
            >
              <div className={`inline-flex rounded-xl p-3 ${metric.color}`}>
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-semibold">{metric.title}</h3>

              <p className="mt-2 text-sm text-slate-500">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
