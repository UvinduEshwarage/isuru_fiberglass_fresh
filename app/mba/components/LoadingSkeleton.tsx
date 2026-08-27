"use client";

interface LoadingSkeletonProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-full bg-slate-200"></div>
            <div className="h-8 w-10 rounded-full bg-slate-200"></div>
            <div className="h-8 w-24 rounded-full bg-slate-200"></div>
          </div>

          <div className="mt-6 h-4 w-3/4 rounded bg-slate-200"></div>

          <div className="mt-2 h-4 w-2/3 rounded bg-slate-200"></div>
        </div>

        <div className="ml-6 flex flex-col gap-3">
          <div className="h-8 w-24 rounded-full bg-slate-200"></div>

          <div className="h-8 w-24 rounded-full bg-slate-200"></div>

          <div className="h-8 w-24 rounded-full bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
