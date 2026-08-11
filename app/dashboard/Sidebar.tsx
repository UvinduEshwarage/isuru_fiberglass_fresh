"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
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
    href: "/mba",
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
        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
  ${
    isActive
      ? "bg-slate-700 text-white font-semibold"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`}
        onClick={() => hasChildren && setOpen((s) => !s)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-blue-500"}`} />}

          {item.href ? (
            <Link href={item.href} className="text-sm">
              {item.label}
            </Link>
          ) : (
            <span className="text-sm">{item.label}</span>
          )}
        </div>

        {hasChildren && (
          <ChevronRight
  className={`w-4 h-4 transition-transform ${
    open ? "rotate-90" : ""
  }`}
/>
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

  function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

  return (
    // <aside
    //   className={`flex flex-col bg-linear-to-b from-white to-blue-50 border-r border-blue-100 min-h-full ${className}`}
    //   aria-label="Sidebar"
    // >
    <aside
  className="fixed
    top-0
    left-0
    h-screen
    w-72
    bg-slate-900
    text-white
    border-r
    border-slate-800
    flex
    flex-col"
>
      {/* <div className="flex items-center justify-between p-4 border-b border-blue-100"> */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800">
        <div>
          {/* <h3 className="text-lg font-semibold text-blue-900">Isuru Fiberglass</h3> */}
          <h3 className="text-lg font-bold text-white">
    Isuru Fiberglass
</h3>
          {/* <p className="text-xs text-blue-500">Business Analytics</p> */}
          <p className="text-xs text-slate-400">
    POS & Business Analytics
</p>
        </div>

        <div>
          <button
            onClick={() => setCollapsed((s) => !s)}
            className="p-2 rounded bg-blue-50 hover:bg-blue-100"
            aria-expanded={!collapsed}
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none">
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
              <Link key={n.label} href={n.href || "#"} className="p-2 rounded hover:bg-blue-50">
                {n.icon && <n.icon className="w-5 h-5 text-blue-600" />}
              </Link>
            ))}
          </div>
        )}
      </div>
          <AlertDialog>
 <AlertDialogTrigger
  className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl bg-linear-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-red-700 hover:to-red-600"
>
  Logout
</AlertDialogTrigger>

  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        Confirm Logout
      </AlertDialogTitle>

      <AlertDialogDescription>
        Are you sure you want to log out of the POS system?
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>
        Cancel
      </AlertDialogCancel>

      <AlertDialogAction
        onClick={logout}
        className="bg-red-600 hover:bg-red-700"
      >
        Logout
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </aside>
  )
}


