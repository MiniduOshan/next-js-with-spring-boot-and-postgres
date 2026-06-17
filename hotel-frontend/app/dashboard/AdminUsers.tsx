"use client";

import { Users, Search, Filter, ShieldCheck, Mail, Ban, MoreVertical, Building } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;

// Mock data
const mockUsers = [
  { id: 1, name: 'Kasun Perera', email: 'kasun@example.com', role: 'Customer', status: 'Active', joined: '2023-11-12' },
  { id: 2, name: 'Sunil Silva', email: 'sunil@hotel.lk', role: 'Hotel Owner', status: 'Active', joined: '2023-10-05', hotel: 'Sunil Resort' },
  { id: 3, name: 'Nimal Fernando', email: 'nimal@example.com', role: 'Customer', status: 'Suspended', joined: '2024-01-22' },
  { id: 4, name: 'Amal Perera', email: 'amal@villas.lk', role: 'Hotel Owner', status: 'Pending', joined: '2024-03-15', hotel: 'Amal Villas' },
];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const router = useRouter();

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" /> Manage Users
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View and manage customers and hotel owners across the platform.</p>
        </div>
        <button className="bg-brand hover:bg-brand-hover text-white px-3 py-2 rounded-xl font-semibold shadow-sm transition-colors">
          + Add New User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none"
            >
              <option value="All">All Roles</option>
              <option value="Customer">Customers</option>
              <option value="Hotel Owner">Hotel Owners</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2 font-medium">User Details</th>
                <th className="px-3 py-2 font-medium">Role / Affiliation</th>
                <th className="px-3 py-2 font-medium">Joined Date</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-semibold ${
                        user.role === 'Hotel Owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                      {user.hotel && (
                        <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Building className="w-3 h-3" /> {user.hotel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-400">
                    {user.joined}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      user.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/communications?email=${encodeURIComponent(user.email)}`)}
                        className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" 
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title={user.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}>
                        {user.status === 'Suspended' ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
