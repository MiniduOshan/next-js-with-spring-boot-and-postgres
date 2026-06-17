"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardHome() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("user-role");
    setRole(storedRole);
    if (storedRole) {
      if (storedRole === "CUSTOMER") router.push("/dashboard/customer/bookings");
      else if (storedRole === "HOTEL_PARTNER") router.push("/dashboard/partner/property");
      else if (storedRole === "ADMIN") router.push("/dashboard/admin/approvals");
    }
  }, [router]);

  const selectRole = (selectedRole: string, email: string) => {
    localStorage.setItem("user-role", selectedRole);
    localStorage.setItem("user-email", email);
    localStorage.setItem("token", "dummy-jwt-token");
    localStorage.setItem("tenant-id", email);

    document.cookie = `token=dummy-jwt-token; path=/`;
    document.cookie = `user-role=${selectedRole}; path=/`;

    if (selectedRole === "CUSTOMER") router.push("/dashboard/customer/bookings");
    else if (selectedRole === "HOTEL_PARTNER") router.push("/dashboard/partner/property");
    else if (selectedRole === "ADMIN") router.push("/dashboard/admin/approvals");
  };

  if (role) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-teal-400 font-semibold animate-pulse">Redirecting to active workspace role...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-extrabold text-white text-center">Select Your Member Portal</h1>
      <p className="text-slate-400 text-center mt-2">Log in or select a quick identity context to explore HotelsYME features.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Customer Portal */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto text-xl font-bold">C</div>
            <h3 className="text-xl font-bold text-white mt-6">Traveler / Guest</h3>
            <p className="text-slate-400 text-sm mt-3">Book rooms, track loyalty points, and post requests in the open negotiation market.</p>
          </div>
          <button onClick={() => selectRole("CUSTOMER", "user@yme.lk")} className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-3 rounded-xl mt-8 transition">
            Access Traveler View
          </button>
        </div>

        {/* Partner Portal */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold">P</div>
            <h3 className="text-xl font-bold text-white mt-6">Hotel Partner</h3>
            <p className="text-slate-400 text-sm mt-3">Manage rooms catalog, active offers, update reservations, and send counter-offers.</p>
          </div>
          <button onClick={() => selectRole("HOTEL_PARTNER", "partner@yme.lk")} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl mt-8 transition">
            Access Partner View
          </button>
        </div>

        {/* Admin Portal */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-xl font-bold">A</div>
            <h3 className="text-xl font-bold text-white mt-6">Super Admin</h3>
            <p className="text-slate-400 text-sm mt-3">Verify property applications, configure SaaS tier boundaries, and monitor health metrics.</p>
          </div>
          <button onClick={() => selectRole("ADMIN", "admin@yme.lk")} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl mt-8 transition">
            Access Super Admin
          </button>
        </div>
      </div>
    </div>
  );
}
