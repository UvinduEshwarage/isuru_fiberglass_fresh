"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface QuarterRevenueItem {
  quarter: string;
  revenue: number;
}

interface Props {
  data: QuarterRevenueItem[];
}

export default function QuarterRevenueChart({ data }: Props) {
  const sortedData = [...data].sort((a, b) => {
    const qA = Number(a.quarter.replace("Q", ""));
    const qB = Number(b.quarter.replace("Q", ""));

    return qA - qB;
  });

  const chartData = {
    labels: sortedData.map((item) => item.quarter),

    datasets: [
      {
        label: "Revenue",

        data: sortedData.map((item) => item.revenue),

        backgroundColor: ["#0f766e", "#14b8a6", "#06b6d4", "#3b82f6"],

        borderRadius: 10,
      },
    ],
  };

  const options: any = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        ticks: {
          callback: (value: any) => `$${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="h-87.5">
      <Bar data={chartData} options={options} />
    </div>
  );
}
