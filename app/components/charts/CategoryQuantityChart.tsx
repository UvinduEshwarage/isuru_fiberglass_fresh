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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface CategoryQuantityItem {
  category: string;
  quantity: number;
}

interface Props {
  data: CategoryQuantityItem[];
}

export default function CategoryQuantityChart({
  data,
}: Props) {
  const chartData = {
    labels: data.map((item) => item.category),

    datasets: [
      {
        label: "Quantity",
        data: data.map((item) => item.quantity),

        backgroundColor: "#0f766e",

        borderRadius: 8,
      },
    ],
  };

  const options: any = {
    indexAxis: "y",

    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.parsed.x.toLocaleString()} units`,
        },
      },
    },

    scales: {
      x: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-87.5">
      <Bar
        data={chartData}
        options={options}
      />
    </div>
  );
}