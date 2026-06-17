"use client";

import { BookOpen, Search, Filter, Calendar as CalendarIcon, Download } from 'lucide-react';
import { useState } from 'react';

const mockBookings = [
  { id: 'BK-1001', guest: 'Kasun Perera', hotel: 'Sunil Resort', room: 'Deluxe Ocean View', checkIn: '2026-06-15', checkOut: '2026-06-18', status: 'Confirmed', amount: 'LKR 45,000' },
  { id: 'BK-1002', guest: 'Nimal Fernando', hotel: 'Amal Villas', room: 'Private Villa', checkIn: '2026-06-20', checkOut: '2026-06-25', status: 'Pending', amount: 'LKR 120,000' },
  { id: 'BK-1003', guest: 'Sarah Johnson', hotel: 'Grand Colombo', room: 'Executive Suite', checkIn: '2026-06-10', checkOut: '2026-06-12', status: 'Checked In', amount: 'LKR 85,000' },
  { id: 'BK-1004', guest: 'David Smith', hotel: 'Kandy Hill Retreat', room: 'Standard Room', checkIn: '2026-06-01', checkOut: '2026-06-05', status: 'Checked Out', amount: 'LKR 30,000' },
  { id: 'BK-1005', guest: 'Saman Kumara', hotel: 'Galle Fort Stay', room: 'Heritage Room', checkIn: '2026-07-01', checkOut: '2026-07-03', status: 'Cancelled', amount: 'LKR 25,000' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
    case 'Confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    case 'Checked In': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
    case 'Checked Out': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
    case 'Cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBookings = mockBookings.filter(b => {
    const matchesSearch = b.guest.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase()) || b.hotel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand" /> System Bookings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Global overview of all hotel bookings across the platform.</p>
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Booking ID, Guest, or Hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/50 appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <CalendarIcon className="w-4 h-4" /> Date Range
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-3 py-2 font-medium">Booking ID</th>
                <th className="px-3 py-2 font-medium">Guest / Hotel</th>
                <th className="px-3 py-2 font-medium">Room Type</th>
                <th className="px-3 py-2 font-medium">Dates</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-3 py-4 font-mono font-medium text-slate-900 dark:text-white">{b.id}</td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{b.guest}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.hotel}</p>
                  </td>
                  <td className="px-3 py-4 text-slate-600 dark:text-slate-400">{b.room}</td>
                  <td className="px-3 py-4">
                    <div className="text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      <div><span className="font-semibold">In:</span> {b.checkIn}</div>
                      <div><span className="font-semibold">Out:</span> {b.checkOut}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4 font-semibold text-slate-900 dark:text-white">{b.amount}</td>
                  <td className="px-3 py-4 text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    No bookings found matching your criteria.
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


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <AdminBookings {...props} />
    </DashboardLayout>
  );
}
