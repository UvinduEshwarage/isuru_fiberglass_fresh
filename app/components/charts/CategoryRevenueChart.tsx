"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryRevenueItem {
  category: string;
  revenue: number;
}

interface Props {
  data: CategoryRevenueItem[];
}

export default function CategoryRevenueChart({ data }: Props) {
  const chartData = {
    labels: data.map((item) => item.category),

    datasets: [
      {
        data: data.map((item) => item.revenue),

        backgroundColor: [
          "#0f766e",
          "#14b8a6",
          "#06b6d4",
          "#3b82f6",
          "#8b5cf6",
          "#f59e0b",
          "#ef4444",
          "#84cc16",
          "#ec4899",
          "#6366f1",
        ],

        borderWidth: 2,
      },
    ],
  };

  const options: any = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },

      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[350px]">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
