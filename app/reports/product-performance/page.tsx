"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ProductStats {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  appearances: number;
  avgPrice: number;
}

export default function ProductPerformanceReportPage() {
  const [products, setProducts] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"revenue" | "quantity" | "appearances">("revenue");

  useEffect(() => {
    async function loadProductData() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/billing", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          const invoices = data.invoices || [];
          const productMap = new Map<string, { quantity: number; revenue: number; appearances: number; prices: number[] }>();

          invoices.forEach((inv: any) => {
            inv.items?.forEach((item: any) => {
              if (!productMap.has(item.name)) {
                productMap.set(item.name, { quantity: 0, revenue: 0, appearances: 0, prices: [] });
              }

              const entry = productMap.get(item.name)!;
              entry.quantity += item.quantity || 1;
              entry.revenue += (item.price * (item.quantity || 1)) || 0;
              entry.appearances += 1;
              entry.prices.push(item.price || 0);
            });
          });

          const productArray = Array.from(productMap.entries()).map(([name, stats]) => ({
            name,
            totalQuantity: stats.quantity,
            totalRevenue: stats.revenue,
            appearances: stats.appearances,
            avgPrice: stats.prices.length > 0 ? stats.prices.reduce((a, b) => a + b, 0) / stats.prices.length : 0,
          }));

          setProducts(productArray);
        } else {
          setError(data.error || "Failed to load product data");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadProductData();
  }, []);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    if (sortBy === "revenue") {
      sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sortBy === "quantity") {
      sorted.sort((a, b) => b.totalQuantity - a.totalQuantity);
    } else {
      sorted.sort((a, b) => b.appearances - a.appearances);
    }
    return sorted;
  }, [products, sortBy]);

  const stats = useMemo(() => {
    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);
    const topProduct = products.length > 0 ? products.reduce((max, p) => p.totalRevenue > max.totalRevenue ? p : max) : null;

    return { totalRevenue, totalQuantity, topProduct, uniqueProducts: products.length };
  }, [products]);

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-lg p-1.5 hover:bg-slate-100">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Product Performance</h1>
          <p className="text-sm text-slate-600 mt-1">Sales and revenue by product</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Total Revenue</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Qty Sold</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{stats.totalQuantity}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Products</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{stats.uniqueProducts}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase">Top Product</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 line-clamp-1">{stats.topProduct?.name || "—"}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-x-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-sm">{products.length} products</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-slate-400"
          >
            <option value="revenue">Revenue</option>
            <option value="quantity">Quantity</option>
            <option value="appearances">Popularity</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-6 text-sm text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-6 text-sm text-red-600">{error}</div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-600">No data available</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Qty Sold
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Appearances
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sortedProducts.map((product, idx) => (
                <tr key={product.name} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 w-6 text-center">#{idx + 1}</span>
                      {product.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    {formatCurrency(product.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700">{product.totalQuantity}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700">{product.appearances} times</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-700">
                    {formatCurrency(product.avgPrice)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                      {((product.totalRevenue / stats.totalRevenue) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
