"use client";

import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = "No Association Rules Found",
  description = "Try changing your search criteria or generate more transaction data to discover product relationships.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
      <div className="rounded-full bg-slate-100 p-5">
        <SearchX className="h-12 w-12 text-slate-500" />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-slate-800">
        {title}
      </h2>

      <p className="mt-3 max-w-lg text-slate-500">
        {description}
      </p>
    </div>
  );
}