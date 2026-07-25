// "use client";

// import { usePathname } from "next/navigation";
// import { User } from "lucide-react";
// import Link from "next/link";

// export default function Topbar() {
//   const pathname = usePathname() || "/";

//   // Simple title mapping based on pathname
//   const title = (() => {
//     if (pathname === "/dashboard") return "Dashboard";
//     if (pathname.startsWith("/dashboard/revenue-summary")) return "Revenue Summary";
//     if (pathname.startsWith("/dashboard/sales-trends")) return "Sales Trends";
//     if (pathname.startsWith("/billing")) return "Billing";
//     if (pathname.startsWith("/products")) return "Products";
//     if (pathname.startsWith("/predict")) return "Revenue Prediction";
//     if (pathname.startsWith("/mba")) return "Market Basket Analysis";
//     if (pathname.startsWith("/reports")) return "Reports";
//     if (pathname.startsWith("/settings")) return "Settings";
//     return "Analytics Dashboard";
//   })();

//   return (
//     <header className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
//       <div>
//         <h1 className="text-lg font-semibold">{title}</h1>
//         <p className="text-sm text-slate-500">Overview and insights</p>
//       </div>

//       <div className="flex items-center gap-4">
//         <Link href="/settings/profile" className="flex items-center gap-2">
//           <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
//             <User className="w-5 h-5 text-slate-600" />
//           </div>

//           <div className="hidden sm:block text-sm">
//             <div className="font-medium">Admin</div>
//             <div className="text-xs text-slate-500">admin@example.com</div>
//           </div>
//         </Link>
//       </div>
//     </header>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Profile {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function Topbar() {
  const pathname = usePathname() || "/";

  const [profile, setProfile] = useState<Profile>({
    name: "Admin",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch("/api/settings/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }

  const title = (() => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/dashboard/revenue-summary")) return "Revenue Summary";
    if (pathname.startsWith("/dashboard/sales-trends")) return "Sales Trends";
    if (pathname.startsWith("/billing")) return "Billing";
    if (pathname.startsWith("/products")) return "Products";
    if (pathname.startsWith("/predict")) return "Revenue Prediction";
    if (pathname.startsWith("/mba")) return "Market Basket Analysis";
    if (pathname.startsWith("/reports")) return "Reports";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Analytics Dashboard";
  })();

  return (
    <header className="flex items-center justify-between bg-white p-4 rounded shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-slate-500">Overview and insights</p>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/settings/profile"
          className="flex items-center gap-2"
        >
          
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
           <Image
              src="/favicon.ico"
               alt="Business Logo"
                 width={32}
                 height={32}
               className="object-contain"
                />
          </div>
          <div className="hidden sm:block text-sm">
            <div className="font-medium">
              {profile.name}
            </div>

            <div className="text-xs text-slate-500">
              {profile.email}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}