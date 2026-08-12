import type { Metadata } from "next";
import Sidebar from "../dashboard/Sidebar";
import Topbar from "../dashboard/Topbar";

export const metadata: Metadata = {
  title: "Forecasting - Isuru Fiberglass",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 ">
      <Sidebar />

      <main className="ml-72 min-h-screen">
        <div className="p-4 md:p-6">
          <Topbar />
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
