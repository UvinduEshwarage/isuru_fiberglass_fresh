"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface MonthlyRevenueItem {
  month: string;
  revenue: number;
}

interface Props {
  data: MonthlyRevenueItem[];
}

export default function MonthlyRevenueChart({ data }: Props) {
  const labels = data.map((item) => {
    const [year, month] = item.month.split("-");

    return new Date(Number(year), Number(month) - 1).toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: data.map((item) => item.revenue),

        fill: true,

        tension: 0.4,

        borderWidth: 3,

        borderColor: "#0f766e",

        backgroundColor: "rgba(15,118,110,0.15)",

        pointRadius: 5,

        pointHoverRadius: 7,

        pointBackgroundColor: "#0f766e",
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
          callback: (value: any) => `Rs. ${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="h-87.5">
      <Line data={chartData} options={options} />
    </div>
  );
}
