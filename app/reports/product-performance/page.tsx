"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Package, TrendingUp, ShoppingCart, Award } from "lucide-react";

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

  const handleExport = () => {
    const csvContent = [
      ["Product Performance Report"],
      [],
      ["Summary Stats"],
      ["Total Revenue", formatCurrency(stats.totalRevenue)],
      ["Total Quantity Sold", stats.totalQuantity],
      ["Unique Products", stats.uniqueProducts],
      ["Top Product", stats.topProduct?.name || "N/A"],
      [],
      ["Product Details"],
      ["Rank", "Product Name", "Revenue", "Quantity Sold", "Appearances", "Avg Price", "% of Total"],
      ...sortedProducts.map((product, idx) => [
        idx + 1,
        product.name,
        formatCurrency(product.totalRevenue),
        product.totalQuantity,
        product.appearances,
        formatCurrency(product.avgPrice),
        ((product.totalRevenue / stats.totalRevenue) * 100).toFixed(2),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute("download", `product-performance-report.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/reports" className="rounded-lg p-1.5 hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Performance Report</p>
              <h1 className="text-3xl font-semibold text-slate-900">Product Analytics</h1>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Qty Sold</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.totalQuantity}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Products</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {stats.uniqueProducts}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-100">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Top Product</p>
              <p className="text-lg font-bold text-slate-900 mt-2 line-clamp-2">
                {stats.topProduct?.name || "—"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 text-lg">{products.length} Product{products.length !== 1 ? 's' : ''}</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="appearances">Sort by Popularity</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12 text-sm text-slate-600">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-6 text-slate-600 font-semibold">#</th>
                  <th className="text-left py-3 px-6 text-slate-600 font-semibold">Product Name</th>
                  <th className="text-right py-3 px-6 text-slate-600 font-semibold">Revenue</th>
                  <th className="text-center py-3 px-6 text-slate-600 font-semibold">Qty Sold</th>
                  <th className="text-center py-3 px-6 text-slate-600 font-semibold">Appearances</th>
                  <th className="text-right py-3 px-6 text-slate-600 font-semibold">Avg Price</th>
                  <th className="text-center py-3 px-6 text-slate-600 font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product, idx) => (
                  <tr key={product.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-6 text-slate-600 font-medium">#{idx + 1}</td>
                    <td className="py-3 px-6 text-slate-900 font-medium">{product.name}</td>
                    <td className="py-3 px-6 text-right text-slate-900 font-semibold">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                    <td className="py-3 px-6 text-center text-slate-700">{product.totalQuantity}</td>
                    <td className="py-3 px-6 text-center text-slate-700">{product.appearances}x</td>
                    <td className="py-3 px-6 text-right text-slate-700">
                      {formatCurrency(product.avgPrice)}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                        {((product.totalRevenue / stats.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
