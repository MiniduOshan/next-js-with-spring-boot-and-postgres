"use client";

import { useEffect, useState } from "react";
import { adminClient } from "@/core/api/adminClient";
import { baseClient } from "@/core/api/baseClient";

interface UserListItem {
  email: string;
  role: string;
  plan: string;
  verified: boolean;
  totalHotels: number;
}

export default function AdminApprovals() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await adminClient.getUsersList();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load platform users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleVerify = async (email: string) => {
    try {
      await baseClient.put("/api/hotel-profile/verify", {
        ownerEmail: email,
        verified: true,
      });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, verified: true } : u));
    } catch (err) {
      console.error("Failed to verify user hotel:", err);
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-2">Platform Verification Queue</h1>
      <p className="text-slate-400 text-sm mb-8">Review new partner profiles, verify applications, and manage billing tier overrides.</p>

      {loading ? (
        <p className="text-slate-400 animate-pulse">Fetching member approvals queue...</p>
      ) : users.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <p className="text-slate-400">Queue is currently empty.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-6">Partner Identity / Email</th>
                <th className="p-6">SaaS Tier Plan</th>
                <th className="p-6">Total Properties</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  <td className="p-6 font-semibold text-white">{user.email}</td>
                  <td className="p-6">
                    <span className="bg-slate-800 text-teal-400 font-bold px-2.5 py-1 rounded-md text-xs">
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-6 text-slate-300">{user.totalHotels} Properties</td>
                  <td className="p-6">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${user.verified ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                    <span className="text-slate-400 text-xs ml-2">{user.verified ? "Approved" : "Pending Approval"}</span>
                  </td>
                  <td className="p-6 text-right">
                    {!user.verified && (
                      <button onClick={() => handleVerify(user.email)} className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition">
                        Verify Property
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
