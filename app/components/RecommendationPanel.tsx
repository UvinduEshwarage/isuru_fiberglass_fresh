type RecommendationPanelProps = {
  recommendations: string[];
  rules: Array<{
    antecedents: string[];
    consequents: string[];
    support: number;
    confidence: number;
    lift: number;
  }>;
  loading?: boolean;
  error?: string;
};

export default function RecommendationPanel({
  recommendations,
  rules,
  loading = false,
  error = "",
}: RecommendationPanelProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">
          Recommendation Output
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Recommended products are derived from association rules whose
          antecedents match your selected items.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
          <div className="font-semibold">Error</div>
          <div className="mt-1 text-sm">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
          <div className="inline-flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></div>
            Loading recommendations...
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
          Submit a product basket to see recommendations.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Recommendations ({recommendations.length})
            </div>
            <ul className="mt-3 space-y-2 text-slate-800">
              {recommendations.map((product, index) => (
                <li
                  key={product}
                  className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  <span className="font-medium">{index + 1}.</span> {product}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Matched rules ({rules.length})
            </div>
            <div className="mt-4 space-y-4">
              {rules.length === 0 ? (
                <div className="text-slate-600">
                  No matching rules were found.
                </div>
              ) : (
                rules.map((rule, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <div className="font-medium text-slate-900">
                      {rule.antecedents.join(" + ")} →{" "}
                      {rule.consequents.join(" + ")}
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3 text-sm text-slate-600">
                      <div>Support: {rule.support.toFixed(3)}</div>
                      <div>Confidence: {rule.confidence.toFixed(3)}</div>
                      <div>Lift: {rule.lift.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
