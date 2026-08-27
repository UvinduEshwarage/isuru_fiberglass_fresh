type AssociationRule = {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
};

export default function AssociationRulesTable({
  rules,
}: {
  rules: AssociationRule[];
}) {
  if (!rules || rules.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
        No rules available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-700">
            <th className="px-4 py-3">Rule</th>
            <th className="px-4 py-3">Support</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Lift</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rules.map((rule, index) => (
            <tr key={index} className="hover:bg-slate-50">
              <td className="px-4 py-4">
                <div className="font-medium text-slate-900">
                  {rule.antecedents.join(" + ")} →{" "}
                  {rule.consequents.join(" + ")}
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600">
                {rule.support.toFixed(3)}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {rule.confidence.toFixed(3)}
              </td>
              <td className="px-4 py-4 text-slate-600">
                {rule.lift.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
