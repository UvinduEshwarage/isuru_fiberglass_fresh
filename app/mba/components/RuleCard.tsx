"use client";

export type AssociationRule = {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
};

interface RuleCardProps {
  rule: AssociationRule;
}

function MetricBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      <span className="opacity-70">{label}</span>

      <span>
        {label === "Lift"
          ? value.toFixed(2)
          : value.toFixed(3)}
      </span>
    </div>
  );
}

export default function RuleCard({
  rule,
}: RuleCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {rule.antecedents.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
              >
                {item}
              </span>
            ))}

            <span className="mx-2 text-lg text-slate-400">
              →
            </span>

            {rule.consequents.map((item) => (
              <span
                key={item}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">
              Example:
            </span>{" "}
            {rule.antecedents.join(", ")} →{" "}
            {rule.consequents.join(", ")}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <MetricBadge
            label="Support"
            value={rule.support}
          />

          <MetricBadge
            label="Confidence"
            value={rule.confidence}
          />

          <MetricBadge
            label="Lift"
            value={rule.lift}
          />
        </div>
      </div>
    </div>
  );
}