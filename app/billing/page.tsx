"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface BillingSummary {
  totalRevenue: number;
  invoiceCount: number;
  monthlyRevenue: Record<string, number>;
}

interface Invoice {
  _id: string;
  customerName: string;
  totalPrice: number;
  date: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

export default function BillingOverviewPage() {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [latestInvoices, setLatestInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    fetchBilling(token);
  }, []);

  async function fetchBilling(token: string) {
    try {
      setLoading(true);
      const response = await fetch("/api/billing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load billing data");
      }

      setSummary(data.summary);
      setLatestInvoices(data.invoices.slice(0, 5));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return `Rs. ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading billing overview...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Billing Overview</p>
            <h1 className="text-3xl font-semibold text-slate-900">Invoice Management</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/billing/create" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Create Invoice
            </Link>
            <Link href="/billing/history" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
              Invoice History
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary ? formatCurrency(summary.totalRevenue) : "Rs. 0"}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Invoices Created</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary?.invoiceCount ?? 0}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Recent Invoice Total</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{summary ? formatCurrency(Object.values(summary.monthlyRevenue).slice(-1)[0] || 0) : "Rs. 0"}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent invoices</h2>
            <p className="text-sm text-slate-500">Latest created invoices from billing.</p>
          </div>
          <Link href="/billing/history" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            View all
          </Link>
        </div>

        {latestInvoices.length === 0 ? (
          <p className="text-sm text-slate-500">No invoices yet.</p>
        ) : (
          <div className="space-y-3">
            {latestInvoices.map((invoice) => (
              <div key={invoice._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{invoice.customerName}</p>
                    <p className="text-sm text-slate-500">{formatDate(invoice.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(invoice.totalPrice)}</p>
                    <p className="text-sm text-slate-500">{invoice.items.length} items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
