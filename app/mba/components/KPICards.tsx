"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Network,
  ShieldCheck,
  TrendingUp,
  Package,
  AlertCircle,
} from "lucide-react";

type AssociationRule = {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
};

type KPI = {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-12 w-12 rounded-2xl bg-slate-200" />

      <div className="mt-6 h-4 w-32 rounded bg-slate-200" />

      <div className="mt-4 h-8 w-24 rounded bg-slate-300" />

      <div className="mt-4 h-3 w-40 rounded bg-slate-200" />
    </div>
  );
}

function StatCard({ stat }: { stat: KPI }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-700" />
        </div>

        <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          Live
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-500">{stat.title}</p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</h2>

      <p className="mt-2 text-sm text-slate-500">{stat.subtitle}</p>
    </div>
  );
}

export default function KPICards() {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRules() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/association-rules?top=50");

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch association rules");
        }

        setRules(Array.isArray(payload.rules) ? payload.rules : []);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  const statistics = useMemo(() => {
    if (!rules.length) {
      return {
        totalRules: 0,
        avgConfidence: 0,
        avgSupport: 0,
        avgLift: 0,
        topProduct: "-",
      };
    }

    const avgConfidence =
      rules.reduce((sum, r) => sum + r.confidence, 0) / rules.length;

    const avgSupport =
      rules.reduce((sum, r) => sum + r.support, 0) / rules.length;

    const avgLift = rules.reduce((sum, r) => sum + r.lift, 0) / rules.length;

    const frequency: Record<string, number> = {};

    rules.forEach((rule) => {
      [...rule.antecedents, ...rule.consequents].forEach((product) => {
        frequency[product] = (frequency[product] || 0) + 1;
      });
    });

    const topProduct =
      Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

    return {
      totalRules: rules.length,
      avgConfidence,
      avgSupport,
      avgLift,
      topProduct,
    };
  }, [rules]);

  const cards: KPI[] = [
    {
      title: "Association Rules",
      value: statistics.totalRules.toString(),
      subtitle: "Rules loaded from ML service",
      icon: Network,
    },
    {
      title: "Average Confidence",
      value: `${(statistics.avgConfidence * 100).toFixed(1)}%`,
      subtitle: "Average of loaded rules",
      icon: ShieldCheck,
    },
    {
      title: "Average Lift",
      value: statistics.avgLift.toFixed(2),
      subtitle: "Average relationship strength",
      icon: TrendingUp,
    },
    {
      title: "Top Product",
      value:
        statistics.topProduct.length > 18
          ? statistics.topProduct.substring(0, 18) + "..."
          : statistics.topProduct,
      subtitle: `Avg Support ${(statistics.avgSupport * 100).toFixed(1)}%`,
      icon: Package,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
        <AlertCircle className="h-6 w-6" />

        <div>
          <h3 className="font-semibold">Unable to load KPI statistics</h3>

          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} stat={card} />
      ))}
    </div>
  );
}
