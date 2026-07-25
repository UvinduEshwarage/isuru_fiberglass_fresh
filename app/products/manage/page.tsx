"use client";

import { useEffect, useMemo, useState } from "react";

interface Product {
  _id: string;
  productId: string;
  name: string;
  category: string;
  description?: string;
  stock: number;
  price: number;
  active: boolean;
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
}

const CATEGORY_OPTIONS = [
  "Moulds",
  "Garden Products",
  "Construction Products",
  "Temple Products",
  "Tanks",
  "Doors",
  "Roofing Sheets",
];

function createAbbreviation(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function generateProductId(name: string, category: string) {
  if (!name.trim() || !category.trim()) {
    return "";
  }

  const categoryCode = createAbbreviation(category);
  const nameCode = createAbbreviation(name);
  const suffix = Date.now().toString().slice(-5);

  return `${categoryCode}-${nameCode}-${suffix}`;
}

export default function ProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    productId: "",
    name: "",
    category: "",
    description: "",
    stock: 0,
    price: 0,
    active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const autoProductId = generateProductId(form.name, form.category);
    setForm((prev) => {
      if (prev.productId === autoProductId) return prev;
      return { ...prev, productId: autoProductId };
    });
  }, [form.name, form.category]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required to load products.");
      setLoading(false);
      return;
    }
    fetchProducts(token);
  }, []);

  async function fetchProducts(token: string) {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ProductsResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || "Unable to load products.");
      }
      setProducts(data.products || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetchProducts(token);
    }
  }, [search]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return products;
    }
    const q = search.toLowerCase();
    return products.filter((product) => {
      return (
        product.productId.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.description || "").toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  const formatCurrency = (value: number) => `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}`;

  async function handleDelete(productId: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required to delete products.");
      return;
    }

    setDeletingIds((prev) => [...prev, productId]);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete product.");
      }

      setProducts((prev) => prev.filter((product) => product._id !== productId));
      setSuccessMessage("Product deleted successfully.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== productId));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required to add products.");
      return;
    }

    setSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create product.");
      }

      setProducts((prev) => [...prev, data.product]);
      setForm({ productId: "", name: "", category: "", description: "", stock: 0, price: 0, active: true });
      setSuccessMessage("Product created successfully.");
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product management...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Product management</p>
            <h1 className="text-3xl font-semibold text-slate-900">Catalog and inventory</h1>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {products.length} products loaded
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Add a new product</p>
              <p className="text-sm text-slate-500">Create a new product SKU in the catalog.</p>
            </div>
          </div>
          {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {successMessage && <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Product ID</span>
                <input
                  value={form.productId}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                  placeholder="Auto-generated from name and category"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="Product name"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Price</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="0"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Stock</span>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  placeholder="0"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Active</span>
                <select
                  value={form.active ? "true" : "false"}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value === "true" }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="Optional product description"
                rows={3}
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting ? "Saving..." : "Create Product"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Search products</p>
              <p className="text-sm text-slate-500">Filter by ID, name, category, or description.</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredProducts.map((product) => {
                  const deleting = deletingIds.includes(product._id);
                  return (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{product.productId}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{product.category}</td>
                      <td className="px-6 py-4 text-right text-sm text-slate-900">{product.stock}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{product.active ? "Active" : "Inactive"}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          disabled={deleting}
                          className="inline-flex items-center rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
                        >
                          {deleting ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
