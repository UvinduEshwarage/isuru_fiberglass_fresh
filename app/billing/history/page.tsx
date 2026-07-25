"use client";

import { useEffect, useMemo, useState } from "react";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  _id: string;
  InvoiceID?: string;
  customerName: string;
  totalPrice: number;
  date: string;
  createdAt: string;
  items: InvoiceItem[];
}

interface BillingResponse {
  invoices: Invoice[];
  summary: {
    totalRevenue: number;
    invoiceCount: number;
    monthlyRevenue: Record<string, number>;
  };
}

export default function BillingHistoryPage() {
  const [data, setData] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    fetchHistory(token);
  }, []);

  async function fetchHistory(token: string) {
    try {
      setLoading(true);
      const response = await fetch("/api/billing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load invoice history");
      }
      setData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = useMemo(() => {
    if (!data || !search.trim()) {
      return data?.invoices || [];
    }

    const q = search.toLowerCase();
    return data.invoices.filter((invoice) => {
      const invoiceId = String(invoice.InvoiceID || invoice._id || "").toLowerCase();
      const customer = String(invoice.customerName || "").toLowerCase();
      const date = String(invoice.date || "").toLowerCase();
      const items = invoice.items.map((item) => String(item.name || "").toLowerCase()).join(" ");

      return (
        invoiceId.includes(q) ||
        customer.includes(q) ||
        date.includes(q) ||
        items.includes(q)
      );
    });
  }, [data, search]);

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleString();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading invoice history...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Invoice History</p>
            <h1 className="text-3xl font-semibold text-slate-900">All invoices</h1>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {data?.summary.invoiceCount ?? 0} total invoices
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{data ? formatCurrency(data.summary.totalRevenue) : "Rs. 0"}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Invoice Count</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{data?.summary.invoiceCount ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Latest Month</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{data ? Object.keys(data.summary.monthlyRevenue).slice(-1)[0] || "-" : "-"}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Search invoices</p>
            <p className="text-sm text-slate-500">Search by Invoice ID, customer name, date, or item.</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="w-full max-w-md rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{invoice.InvoiceID || invoice._id.slice(-6)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{invoice.customerName}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalPrice)}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{invoice.items.length}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(invoice.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
