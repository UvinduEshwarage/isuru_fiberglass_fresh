"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  BarChart2,
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  PlusCircle,
  Archive,
  Box,
  Layers,
  Zap,
  Calendar,
  PieChart,
  Settings,
  User,
  ShoppingCart,
} from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  icon?: any;
  children?: NavItem[];
};

const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  {
    label: "Overview analytics",
    icon: BarChart2,
    children: [
      { label: "Revenue summary", href: "/dashboard#revenue-summary", icon: DollarSign },
      { label: "Sales trends", href: "/dashboard#sales-trends", icon: TrendingUp },
    ],
  },
  {
    label: "Billing",
    icon: CreditCard,
    children: [
      { label: "Create Invoice", href: "/billing/create", icon: PlusCircle },
      { label: "Invoice History", href: "/billing/history", icon: Archive },
    ],
  },
  {
    label: "Products",
    icon: Box,
    children: [
      { label: "Product Management", href: "/products/manage", icon: Layers },
      { label: "Inventory Overview", href: "/products/inventory", icon: Archive },
    ],
  },
  {
    label: "Revenue Prediction",
    icon: Zap,
    children: [
      { label: "Revenue Forecast", href: "/predict/forecast", icon: Calendar },
      { label: "Prediction History", href: "/predict/history", icon: FileText },
      { label: "Forecast Charts", href: "/predict/charts", icon: PieChart },
    ],
  },
  {
    label: "Market Basket Analysis",
    icon: ShoppingCart,
    children: [
      { label: "Frequently Bought Together", href: "/mba/frequently-bought", icon: ShoppingCart },
      { label: "Product Recommendations", href: "/mba/recommendations", icon: Layers },
    ],
  },
  {
    label: "Reports",
    icon: FileText,
    children: [
      { label: "Daily Sales Report", href: "/reports/daily", icon: Calendar },
      { label: "Monthly Revenue Report", href: "/reports/monthly", icon: PieChart },
      { label: "Product Performance Report", href: "/reports/product-performance", icon: BarChart2 },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Business Settings", href: "/settings/business", icon: Settings },
      { label: "User Profile", href: "/settings/profile", icon: User },
    ],
  },
];

function Item({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname() || "/";
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const Icon = item.icon;
  const childActive = hasChildren
    ? item.children!.some((child) => child.href && pathname.startsWith(child.href))
    : false;
  const isActive = item.href ? pathname.startsWith(item.href) : childActive;
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (hasChildren && childActive) {
      setOpen(true);
    }
  }, [childActive, hasChildren]);

  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-slate-100 ${
          isActive ? "bg-slate-100 font-semibold" : ""
        }`}
        onClick={() => hasChildren && setOpen((s) => !s)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-slate-600" />}

          {item.href ? (
            <Link href={item.href} className="text-sm">
              {item.label}
            </Link>
          ) : (
            <span className="text-sm">{item.label}</span>
          )}
        </div>

        {hasChildren && (
          <svg
            className={`w-3 h-3 transform transition-transform ${open ? "rotate-90" : ""}`}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 4L14 10L6 16V4Z" fill="currentColor" />
          </svg>
        )}
      </div>

      {hasChildren && open && (
        <div className="pl-6 mt-1 flex flex-col gap-1">
          {item.children!.map((c) => (
            <Item key={c.label} item={c} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ className = "" }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-white border-r min-h-full ${className}`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">Isuru Fiberglass</h3>
          <p className="text-xs text-slate-500">Business Analytics</p>
        </div>

        <div>
          <button
            onClick={() => setCollapsed((s) => !s)}
            className="p-2 rounded bg-slate-100 hover:bg-slate-200"
            aria-expanded={!collapsed}
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            {nav.map((n) => (
              <Item key={n.label} item={n} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            {nav.map((n) => (
              <Link key={n.label} href={n.href || "#"} className="p-2 rounded hover:bg-slate-100">
                {n.icon && <n.icon className="w-5 h-5 text-slate-600" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Link href="/settings/profile" className="flex items-center gap-3">
          <User className="w-5 h-5 text-slate-600" />
          <div className="text-sm">Profile</div>
        </Link>
      </div>
    </aside>
  );
}
