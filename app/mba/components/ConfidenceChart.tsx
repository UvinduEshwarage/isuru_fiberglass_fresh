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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type AssociationRule = {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
};

export default function ConfidenceChart() {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRules() {
      try {
        setLoading(true);

        const response = await fetch("/api/association-rules?top=20");

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch association rules");
        }

        setRules(result.rules ?? []);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: rules.map((rule, index) => `Rule ${index + 1}`),

      datasets: [
        {
          label: "Confidence",

          data: rules.map((rule) => Number((rule.confidence * 100).toFixed(2))),

          backgroundColor: "#2563eb",

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

      tooltip: {
        callbacks: {
          title: (items: any) => {
            const index = items[0].dataIndex;

            const rule = rules[index];

            return `${rule.antecedents.join(", ")} → ${rule.consequents.join(
              ", ",
            )}`;
          },

          label: (item: any) => `Confidence : ${item.raw}%`,
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        max: 100,

        title: {
          display: true,

          text: "Confidence (%)",
        },
      },

      x: {
        title: {
          display: true,

          text: "Association Rules",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-56 rounded bg-slate-200" />

          <div className="h-80 rounded bg-slate-100" />
        </div>
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          Confidence Analysis
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Confidence score of the top association rules generated using the
          Apriori algorithm.
        </p>
      </div>

      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
