import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Product Management</p>
            <h1 className="text-3xl font-semibold text-slate-900">Manage your product catalog</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products/manage"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Product Management
            </Link>
            <Link
              href="/products/inventory"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              Inventory Overview
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Create and maintain products</p>
          <p className="mt-3 text-slate-900">Add SKU, pricing, stock, and category details for new products.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Inventory insights</p>
          <p className="mt-3 text-slate-900">Track stock levels and identify low inventory products.</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Product search</p>
          <p className="mt-3 text-slate-900">Search by product ID, name, category, or description.</p>
        </div>
      </div>
    </div>
  );
}
