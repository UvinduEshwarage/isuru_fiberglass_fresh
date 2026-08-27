import Link from "next/link";

const cards = [
  {
    title: "Forecast Revenue",
    description: "Generate a revenue prediction from input features.",
    href: "/predict/forecast",
  },
  {
    title: "Prediction History",
    description: "Review your saved revenue forecasts and analysis.",
    href: "/predict/history",
  },
  {
    title: "Forecast Charts",
    description: "Visualize revenue forecast patterns and trends.",
    href: "/predict/charts",
  },
];

export default function PredictPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Revenue Prediction
          </h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Use revenue forecasting tools to estimate future sales. Start with a
            forecast, then review history and chart outputs.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-3 text-slate-500">{card.description}</p>
              <span className="mt-4 inline-flex items-center rounded-full bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                Open
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
