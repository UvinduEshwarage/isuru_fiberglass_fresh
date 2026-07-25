"use client";

import { useEffect, useState } from "react";

type AssociationRule = {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
};

export default function FrequentlyBoughtPage() {
  const [rules, setRules] = useState<AssociationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"confidence" | "support" | "lift">("confidence");

  useEffect(() => {
    async function loadRules() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/association-rules?top=12");
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch association rules");
        }

          setRules(payload.rules || []);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    }

    loadRules();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = rules
    .filter((r) => {
      if (!normalizedQuery) return true;
      const hay = (r.antecedents.join(' ') + ' ' + r.consequents.join(' ')).toLowerCase();
      return hay.includes(normalizedQuery);
    })
    .sort((a, b) => (b as any)[sortKey] - (a as any)[sortKey]);

  function MetricBadge({ label, value }: { label: string; value: number }) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
        <span className="opacity-70">{label}</span>
        <span>{typeof value === 'number' ? value.toFixed(label === 'Lift' ? 2 : 3) : value}</span>
      </div>
    );
  }

  function RuleCard({ rule }: { rule: AssociationRule }) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              {rule.antecedents.map((a) => (
                <div key={a} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800">{a}</div>
              ))}

              <div className="mx-2 text-slate-400">→</div>

              {rule.consequents.map((c) => (
                <div key={c} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800 border border-emerald-100">{c}</div>
              ))}
            </div>

            <div className="mt-4 text-sm text-slate-600">
              <div><span className="font-semibold text-slate-800">Example pairing:</span> {rule.antecedents.join(', ')} → {rule.consequents.join(', ')}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <MetricBadge label="Support" value={rule.support} />
            <MetricBadge label="Confidence" value={rule.confidence} />
            <MetricBadge label="Lift" value={rule.lift} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Frequently Bought Together</h1>
          <p className="mt-2 text-slate-500 max-w-2xl">
            Discover common product pairings and combinations based on association rules.
          </p>
        </div>

        {error ? (
          <div className="rounded-3xl bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
        ) : null}

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <input
                type="search"
                placeholder="Search product or pairing"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-72 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
              />

              <div className="text-sm text-slate-500">Showing {filtered.length} of {rules.length}</div>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <label className="text-sm text-slate-600">Sort by</label>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <option value="confidence">Confidence</option>
                <option value="support">Support</option>
                <option value="lift">Lift</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full rounded-2xl border border-slate-100 bg-slate-50 p-6 text-slate-600">Loading frequently bought products...</div>
            ) : (
              filtered.map((rule, index) => (
                <RuleCard key={index} rule={rule} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
