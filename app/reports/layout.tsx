import type { Metadata } from "next";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";

export const metadata: Metadata = {
  title: "Reports - Isuru Fiberglass",
};

export default function BillingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen text-slate-800 bg-slate-50">
      <div className="flex">
        <div className="hidden md:block w-72">
          <Sidebar />
        </div>

        <div className="flex-1 min-h-screen">
          <div className="p-4 md:p-6">
            <Topbar />
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
