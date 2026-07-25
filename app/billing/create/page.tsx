"use client";

import { useEffect, useMemo, useState } from "react";

interface Product {
  _id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
}

interface InvoiceItem {
  productId?: string;
  name: string;
  category?: string;
  quantity: number;
  price: number;
}

const productCategories = [
  "Tables and Benches",
  "Flower Pots",
  "Temple Items",
  "Garden Animal Moulds",
  "Chemical Proof Tanks",
  "Slab Moulds",
  "Kanu Moulds",
  "Beeralu Moulds",
  "Molding Pati",
  "Kalugal Moulds",
  "Silparan Kota",
  "Loover",
  "Roofing Sheets",
  "Bathik Tanks",
  "Water Proof Tanks",
  "Interlock",
  "Doors",
];

export default function BillingCreatePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", quantity: 1, price: 0, category: undefined },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      return;
    }

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProducts(data.products || []);
        }
      } catch (err) {
        // ignore silently; invoice can still be created manually
      }
    }

    loadProducts();
  }, []);

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items],
  );

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        if (field === "productId") {
          const product = products.find((product) => product.productId === value);
          if (product) {
            return {
              ...item,
              productId: product.productId,
              name: product.name,
              category: product.category,
              price: product.price,
            };
          }
          return { ...item, productId: undefined, name: "", category: undefined, price: 0 };
        }

        return {
          ...item,
          [field]: field === "name" ? String(value) : Number(value),
        };
      }),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", quantity: 1, price: 0, category: undefined }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function fetchRecommendations() {
    setLoadingRecommendations(true);
    setShowRecommendations(false);
    try {
      const selectedCategories = Array.from(
        new Set(
          items
            .filter((item) => item.category && item.category.trim().length > 0)
            .map((item) => item.category as string),
        ),
      );

      console.log("All items:", items);
      console.log("Extracted categories:", selectedCategories);

      if (selectedCategories.length === 0) {
        setError("Please select products from the dropdown to populate categories");
        setLoadingRecommendations(false);
        setShowRecommendations(false);
        return;
      }

      console.log("Sending to /api/recommend:", { products: selectedCategories, top_n: 5 });

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: selectedCategories,
          top_n: 5,
        }),
      });

      const data = await response.json();
      console.log("API Response status:", response.status);
      console.log("API Response data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || data.detail || "Unable to fetch recommendations");
      }

      const recommendedProducts = data.recommendations || [];
      if (recommendedProducts.length === 0) {
        setError(`No recommendations found for: ${selectedCategories.join(", ")}`);
        setRecommendations([]);
      } else {
        setError(null);
        setRecommendations(recommendedProducts);
      }
      setShowRecommendations(true);
    } catch (err: any) {
      console.error("Recommendation fetch error:", err);
      setError(err.message);
      setShowRecommendations(true);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  function addRecommendedItem(recommendedCategory: string) {
    const product = products.find((p) => p.category === recommendedCategory);
    if (product) {
      setItems((prev) => [
        ...prev,
        {
          productId: product.productId,
          name: product.name,
          category: product.category,
          quantity: 1,
          price: product.price,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          name: recommendedCategory,
          category: recommendedCategory,
          quantity: 1,
          price: 0,
        },
      ]);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName,
          date,
          items,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to create invoice");
      }

      setMessage(`Invoice created successfully for ${data.invoice.customerName}.`);
      setItems([{ name: "", quantity: 1, price: 0, category: undefined }]);
      setCustomerName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Create invoice</p>
            <h1 className="text-3xl font-semibold text-slate-900">New billing entry</h1>
          </div>
          <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {formatCurrency(totalPrice)} total
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        {error && <div className="rounded-2xl bg-red-50 p-4 text-red-700">{error}</div>}
        {message && <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">{message}</div>}

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Customer name</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Invoice date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </label>
        </div>

        <div className="rounded-3xl bg-slate-50 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Invoice items</p>
              <p className="text-sm text-slate-500">Add product details and pricing for this invoice.</p>
            </div>
            <button type="button" onClick={addItem} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Add item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto] items-end">
                <label className="space-y-2">
                  <span className="text-sm text-slate-700">Product</span>
                  <select
                    value={item.productId ?? ""}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.productId} - {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-slate-700">Quantity</span>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    min={1}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-slate-700">Unit price</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                    min={0}
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <button type="button" onClick={() => removeItem(index)} className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {items.some((item) => item.name.trim().length > 0) && (
          <div className="rounded-3xl bg-blue-50 p-5 border border-blue-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Recommended products</p>
                <p className="text-sm text-slate-500">Suggest items based on current selections</p>
              </div>
              <button
                type="button"
                onClick={fetchRecommendations}
                disabled={loadingRecommendations}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loadingRecommendations ? "Loading..." : "Get recommendations"}
              </button>
            </div>

            {showRecommendations && recommendations.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  {recommendations.length} recommendation{recommendations.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {recommendations.map((productName) => (
                    <button
                      key={productName}
                      type="button"
                      onClick={() => addRecommendedItem(productName)}
                      className="rounded-2xl bg-white border border-blue-300 px-4 py-3 text-sm text-slate-900 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium line-clamp-1">{productName}</div>
                      <div className="text-xs text-slate-500 mt-1">Click to add</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showRecommendations && recommendations.length === 0 && (
              <p className="text-sm text-slate-600">No recommendations found for the selected products</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Estimated final amount</p>
            <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalPrice)}</p>
          </div>

          <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
            {loading ? "Saving invoice..." : "Save Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
