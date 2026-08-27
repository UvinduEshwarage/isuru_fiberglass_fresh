"use client";

import { useEffect, useMemo, useState } from "react";

interface Product {
  _id: string;

  productId: string;
  name: string;
  category: string;
  description?: string;

  image?: {
    url: string;
    publicId: string;
  };

  stock: number;
  price: number;
  active: boolean;

  createdAt: string;
}
interface ProductsResponse {
  products: Product[];
}

export default function ProductInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required to load inventory.");
      setLoading(false);
      return;
    }
    fetchProducts(token);
  }, []);

  async function fetchProducts(token: string) {
    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ProductsResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || "Unable to load inventory.");
      }
      setProducts(data.products || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5),
    [products],
  );
  const totalStockValue = useMemo(
    () =>
      products.reduce((sum, product) => sum + product.stock * product.price, 0),
    [products],
  );

  const formatCurrency = (value: number) =>
    `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading inventory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">
              Inventory overview
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Product stock summary
            </h1>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {products.length} products
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total stock value</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {formatCurrency(totalStockValue)}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Low stock products</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {lowStockProducts.length}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Active SKUs</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {products.filter((product) => product.active).length}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Image
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Product ID
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Name
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Category
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Stock
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Price
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (
              <tr
                key={product._id}
                className="transition-colors hover:bg-slate-50"
              >
                {/* Product Image */}
                <td className="px-6 py-4">
                  {product.image?.url ? (
                    <img
                      src={product.image.url}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-[10px] text-slate-400">
                      No image
                    </div>
                  )}
                </td>

                {/* Product ID */}
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {product.productId}
                </td>

                {/* Name */}
                <td className="px-6 py-4 text-sm text-slate-700">
                  {product.name}
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-sm text-slate-700">
                  {product.category}
                </td>

                {/* Stock */}
                <td
                  className={`px-6 py-4 text-right text-sm font-semibold ${
                    product.stock <= 5 ? "text-rose-600" : "text-slate-900"
                  }`}
                >
                  {product.stock}
                </td>

                {/* Price */}
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  {formatCurrency(product.price)}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      product.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
