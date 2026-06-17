"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("user-role");
    const storedEmail = localStorage.getItem("user-email");
    setRole(storedRole);
    setEmail(storedEmail);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/");
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link href="/" className="text-xl font-bold text-teal-400">
              Hotels<span className="text-white">YME</span>
            </Link>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname === "/dashboard" ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
              Home Overview
            </Link>

            {role === "CUSTOMER" && (
              <>
                <Link href="/dashboard/customer/bookings" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/customer/bookings") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  My Bookings
                </Link>
                <Link href="/dashboard/customer/bidding" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/customer/bidding") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Reverse Bidding
                </Link>
                <Link href="/dashboard/customer/rewards" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/customer/rewards") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Loyalty Points
                </Link>
              </>
            )}

            {role === "HOTEL_PARTNER" && (
              <>
                <Link href="/dashboard/partner/property" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/partner/property") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Property Details
                </Link>
                <Link href="/dashboard/partner/bookings" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/partner/bookings") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Manage Reservations
                </Link>
                <Link href="/dashboard/partner/open-market" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/partner/open-market") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Bidding Open Market
                </Link>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <Link href="/dashboard/admin/approvals" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/admin/approvals") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Approval Queue
                </Link>
                <Link href="/dashboard/admin/SaaS-tiers" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/admin/SaaS-tiers") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  SaaS Tiers Config
                </Link>
                <Link href="/dashboard/admin/health-metrics" className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${pathname.includes("/admin/health-metrics") ? "bg-slate-800 text-teal-400" : "hover:bg-slate-800 text-slate-400"}`}>
                  Health Telemetry
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-slate-950/40 border border-slate-800 mb-4">
            <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold">
              {email ? email[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{email}</p>
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">{role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 text-sm font-bold py-2.5 rounded-lg border border-rose-500/20 transition">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content wrapper */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between px-8">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Member Workspace</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
