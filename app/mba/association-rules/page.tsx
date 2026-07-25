// "use client";

// import { useEffect, useState } from "react";
// import AssociationRulesTable from "../../components/AssociationRulesTable";

// type AssociationRule = {
//   antecedents: string[];
//   consequents: string[];
//   support: number;
//   confidence: number;
//   lift: number;
// };

// export default function AssociationRulesPage() {
//   const [rules, setRules] = useState<AssociationRule[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadRules() {
//       setLoading(true);
//       setError("");

//       try {
//         const response = await fetch("/api/association-rules?top=15");
//         const payload = await response.json();

//         if (!response.ok) {
//           throw new Error(payload.error || "Failed to fetch association rules");
//         }

//         setRules(payload);
//       } catch (err: any) {
//         setError(err.message || "Unexpected error");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadRules();
//   }, []);

//   return (
//     <div className="min-h-screen bg-slate-100 p-6">
//       <div className="max-w-6xl mx-auto space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Association Rules</h1>
//           <p className="mt-2 text-slate-500 max-w-2xl">
//             View the association rules generated from the product transaction data. Each rule shows antecedents, consequents, support, confidence, and lift.
//           </p>
//         </div>

//         {error ? (
//           <div className="rounded-3xl bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
//         ) : null}

//         <div className="rounded-3xl bg-white p-6 shadow-sm">
//           <div className="mb-5 flex items-center justify-between gap-4">
//             <div>
//               <h2 className="text-xl font-semibold text-slate-900">Top Association Rules</h2>
//               <p className="text-sm text-slate-500">Rules are sorted by confidence, and the top 15 are shown.</p>
//             </div>
//             <div className="text-sm text-slate-500">{loading ? "Loading rules..." : `${rules.length} rules loaded`}</div>
//           </div>

//           <AssociationRulesTable rules={rules} />
//         </div>
//       </div>
//     </div>
//   );
// }
