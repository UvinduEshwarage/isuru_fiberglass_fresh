"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LinearScale,
  Tooltip,
  Legend,
);

type AssociationRule = {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
};

export default function ProductFrequencyChart() {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRules() {
      try {
        const response = await fetch("/api/association-rules?top=50");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch association rules");
        }

        setRules(result.rules || []);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  const chartData = useMemo(() => {
    const frequency: Record<string, number> = {};

    rules.forEach((rule) => {
      [...rule.antecedents, ...rule.consequents].forEach((product) => {
        frequency[product] = (frequency[product] || 0) + 1;
      });
    });

    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: sorted.map(([name]) => name),

      datasets: [
        {
          label: "Frequency",

          data: sorted.map(([, count]) => count),

          backgroundColor: "#f59e0b",

          borderRadius: 8,
        },
      ],
    };
  }, [rules]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="animate-pulse h-96 rounded bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800">
        Top Product Frequency
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Products appearing most frequently within the generated association
        rules.
      </p>

      <div className="mt-6 h-96">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
