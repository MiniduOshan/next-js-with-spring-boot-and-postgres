"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { CalendarRange, Building2, MapPin, Clock, DollarSign, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ALL_HOTELS } from "@/lib/hotelData";


interface BookingItem {
  name: string;
  price: number;
  quantity: number;
}

interface Booking {
  _id: string;
  hotelId: string;
  guestName: string;
  guestEmail: string;
  items: BookingItem[];
  checkIn: string;
  checkOut: string;
  status: string;
  amount: string;
  serviceCharge?: number;
  taxAmount?: number;
  createdAt: string;
}

function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotelsMap, setHotelsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        const [bookingsRes, hotelsRes] = await Promise.all([
          fetch(`/api/bookings?guestEmail=${user.email}`),
          fetch('/api/hotels')
        ]);
        
        if (bookingsRes.ok) {
          const data = await bookingsRes.json();
          setBookings(data);
        }
        
        if (hotelsRes.ok) {
          const hotelsData = await hotelsRes.json();
          const map: Record<string, string> = {};
          
          ALL_HOTELS.forEach((h: any) => {
            map[h.id.toString()] = h.name;
          });

          hotelsData.forEach((h: any) => {
            map[h._id || h.id] = h.propertyName || h.name;
          });
          
          setHotelsMap(map);
        }
      } catch (err) {
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your bookings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-brand" />
            My Bookings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View your standard hotel reservations.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active bookings</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You haven't made any hotel reservations yet. Browse hotels and book your next stay!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg",
                    booking.status === 'Confirmed' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : booking.status === 'Cancelled' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {booking.status}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand" /> {hotelsMap[booking.hotelId] || booking.hotelId || "Hotel"}
                  </h3>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(hotelsMap[booking.hotelId] || booking.hotelId)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brand flex items-center gap-1 font-medium transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> Hotel Location
                  </a>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex-1">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Check-in</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex-1">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Check-out</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-2">Package Details</p>
                  {booking.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{item.quantity}x {item.name}</span>
                      </div>
                      <span className="text-slate-500 text-xs ml-2 font-bold">${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                  
                  {((booking.serviceCharge ?? 0) > 0 || (booking.taxAmount ?? 0) > 0) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      {(booking.serviceCharge ?? 0) > 0 && (
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span>Service Charge</span>
                          <span>LKR {booking.serviceCharge!.toLocaleString()}</span>
                        </div>
                      )}
                      {(booking.taxAmount ?? 0) > 0 && (
                        <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                          <span>Taxes</span>
                          <span>LKR {booking.taxAmount!.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-brand flex items-center gap-1">
                    <DollarSign className="w-5 h-5 text-brand" /> {booking.amount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <MyBookings {...props} />
    </DashboardLayout>
  );
}
