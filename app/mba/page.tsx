"use client";

import Link from "next/link";
import KPICards from "./components/KPICards";
import ConfidenceChart from "./components/ConfidenceChart";
import LiftChart from "./components/LiftChart";
import ProductFrequencyChart from "./components/ProductFrequencyChart";
import MetricGuide from "./components/MetricGuide";

import {
  ShoppingCart,
  ArrowRight,
  Network,
  Sparkles,
  TrendingUp,
  BarChart3,
  BrainCircuit,
  Boxes,
  Activity,
} from "lucide-react";

const stats = [
  {
    title: "Association Rules",
    value: "--",
    subtitle: "Generated rules",
    icon: Network,
  },
  {
    title: "Average Confidence",
    value: "-- %",
    subtitle: "Recommendation strength",
    icon: TrendingUp,
  },
  {
    title: "Average Lift",
    value: "--",
    subtitle: "Relationship quality",
    icon: Activity,
  },
  {
    title: "Top Product",
    value: "--",
    subtitle: "Most associated item",
    icon: Boxes,
  },
];

const pages = [
  {
    title: "Association Rules",
    description:
      "Explore products that are frequently purchased together using Apriori association rules.",
    href: "/mba/frequently-bought",
    icon: Network,
    color: "bg-blue-500",
  },
  {
    title: "Product Recommendations",
    description:
      "Generate intelligent recommendations for a selected customer basket.",
    href: "/mba/recommendations",
    icon: Sparkles,
    color: "bg-emerald-500",
  },
];

const workflow = [
  {
    step: "01",
    title: "Sales Transactions",
    description: "Historical invoices are collected from the POS database.",
  },
  {
    step: "02",
    title: "Apriori Algorithm",
    description:
      "Association rule mining discovers relationships between products.",
  },
  {
    step: "03",
    title: "Business Intelligence",
    description:
      "Managers analyze buying behaviour and identify valuable product bundles.",
  },
  {
    step: "04",
    title: "Recommendations",
    description: "Generate product suggestions for future customer purchases.",
  },
];

export default function MarketBasketDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-lg">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl text-slate-900">
            <div className="inline-flex items-center rounded-full text-4xl font-bold text-slate-300 bg-white/10 px-4 py-2">
              <BrainCircuit className="mr-2 h-4 w-4 text-slate-300 " />
              Business Intelligence Module
            </div>

            <p className="mt-5 max-w-2xl text-slate-300 leading-7 px-4 py-2">
              Analyze customer purchasing behaviour using Association Rule
              Mining (Apriori). Discover frequently purchased products,
              visualize buying patterns, and generate intelligent product
              recommendations for improved sales and cross-selling.
            </p>
          </div>

          <div className="hidden lg:flex">
            <div className="rounded-full bg-white/10 p-10 backdrop-blur-sm">
              <ShoppingCart className="h-32 w-32 text-white" />
            </div>
          </div>
        </div>
      </section>
      <div className="mt-6">
        <ConfidenceChart />
        <br></br>
        <LiftChart />

        <div className="mt-6">
          <MetricGuide />

          <ProductFrequencyChart />
        </div>
      </div>

      <br></br>
      {/* KPI Cards */}
      <section>
        <KPICards />
      </section>

      {/* Main Modules */}
      <section className="grid gap-6 lg:grid-cols-2 bg-black mt-6">
        {pages.map((page) => {
          const Icon = page.icon;

          return (
            <Link
              key={page.title}
              href={page.href}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`inline-flex rounded-2xl ${page.color} p-4 text-black `}
              >
                <Icon className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                {page.title}
              </h2>

              <p className="mt-3 leading-7 text-slate-500">
                {page.description}
              </p>

              <div className="mt-8 flex items-center font-semibold text-slate-900">
                Open Module
                <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-2" />
              </div>
            </Link>
          );
        })}
      </section>

      {/* Workflow */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Market Basket Analysis Workflow
          </h2>

          <p className="mt-2 text-slate-500">
            The complete process used by the recommendation system.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl bg-slate-50 p-6 transition hover:bg-slate-100"
            >
              <div className="text-4xl font-bold text-slate-300">
                {item.step}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
