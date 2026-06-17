"use client";

import { useEffect, useState } from "react";
import { baseClient } from "@/core/api/baseClient";

interface BookingItem {
  name: string;
  price: number;
  quantity: number;
}

interface Booking {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  amount: string;
  items: BookingItem[];
  createdAt: string;
}

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        const email = localStorage.getItem("user-email") || "user@yme.lk";
        const res = await baseClient.get(`/api/bookings?guestEmail=${email}`);
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to load customer bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Booking Reservations</h1>
      
      {loading ? (
        <p className="text-slate-400 animate-pulse">Fetching reservation records...</p>
      ) : bookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <p className="text-slate-400">You do not have any bookings logged yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6 hover:border-slate-700 transition">
              <div>
                <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  booking.status === "Approved" || booking.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                  booking.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                  "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {booking.status}
                </span>
                <h3 className="text-xl font-bold text-white mt-4">
                  {booking.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Dates: {new Date(booking.checkIn).toLocaleDateString()} &mdash; {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  Created at: {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col justify-between items-end shrink-0">
                <span className="text-2xl font-extrabold text-white">LKR {parseFloat(booking.amount).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
