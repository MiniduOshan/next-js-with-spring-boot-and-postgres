"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, subDays, isWithinInterval, startOfDay, isSameDay, startOfMonth, getDaysInMonth } from 'date-fns';
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

const statuses = [
  { name: "Pending", color: "bg-amber-100 text-amber-700" },
  { name: "Confirmed", color: "bg-brand/20 text-brand" },
  { name: "Checked In", color: "bg-blue-100 text-blue-700" },
  { name: "Checked Out", color: "bg-purple-100 text-purple-700" },
  { name: "Cancelled", color: "bg-red-100 text-red-700" },
];

const ROOMS_LIST = ["Deluxe Ocean View (101)", "Deluxe Ocean View (102)", "Standard Double (201)", "Standard Double (202)", "Executive Suite (301)"];

const baseDate = startOfDay(new Date());

export const MOCK_BOOKINGS = [
  { id: 1, guest: 'John Smith', room: ROOMS_LIST[0], start: addDays(baseDate, 1), end: addDays(baseDate, 3), statusName: 'Confirmed', amount: "LKR 70,000" },
  { id: 2, guest: 'Jane Doe', room: ROOMS_LIST[2], start: addDays(baseDate, 4), end: addDays(baseDate, 6), statusName: 'Pending', amount: "LKR 28,000" },
  { id: 3, guest: 'Alice Brown', room: ROOMS_LIST[4], start: subDays(baseDate, 2), end: addDays(baseDate, 5), statusName: 'Checked In', amount: "LKR 120,000" },
  { id: 4, guest: 'Bob Wilson', room: ROOMS_LIST[1], start: subDays(baseDate, 5), end: subDays(baseDate, 1), statusName: 'Checked Out', amount: "LKR 45,000" },
  { id: 5, guest: 'Emma Davis', room: ROOMS_LIST[3], start: addDays(baseDate, 1), end: addDays(baseDate, 2), statusName: 'Cancelled', amount: "LKR 15,000" },
  { id: 6, guest: 'Michael Scott', room: ROOMS_LIST[0], start: addDays(baseDate, 8), end: addDays(baseDate, 12), statusName: 'Pending', amount: "LKR 140,000" },
];

function Bookings() {
  const { user, activeRole, activeHotel } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');

  useEffect(() => {
    const isMockAllowed = user?.email?.toLowerCase() === "partner@yme.lk";
    const headers: Record<string, string> = {
      "X-Owner-Email": user?.email || ""
    };
    if (activeHotel) {
      headers["X-Hotel-Id"] = activeHotel._id;
    }

    fetch("/api/bookings", { headers })
      .then(res => res.json())
      .then(data => {
        let formattedData: any[] = [];
        if (data && data.length > 0) {
          formattedData = data.map((b: any) => ({
            id: b._id,
            guest: b.guestName,
            room: b.items ? b.items.map((i: any) => `${i.name} (x${i.quantity})`).join(", ") : (b.roomName || "N/A"),
            start: new Date(b.checkIn),
            end: new Date(b.checkOut),
            statusName: b.status,
            amount: b.amount,
            guestEmail: b.guestEmail
          }));
        }

        if (isMockAllowed) {
          setBookings([...formattedData, ...MOCK_BOOKINGS]);
        } else {
          setBookings(formattedData);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMockAllowed) {
          setBookings(MOCK_BOOKINGS);
        }
      });
  }, [user?.email, activeHotel?._id]);

  const handleSendDiscount = async (bookingId: string | number) => {
    if (typeof bookingId !== 'string') {
      toast.error("Discount offers are only available for real bookings.");
      return;
    }
    if (!discountAmount.trim()) {
      toast.error("Please enter a discount amount.");
      return;
    }

    const toastId = toast.loading("Sending discount offer...");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/offer-discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountAmount,
          message: `The hotel has offered you a special discount of ${discountAmount} for your upcoming stay at ${activeHotel?.propertyName || 'our property'}.`
        })
      });
      if (res.ok) {
        toast.success("Discount offer sent to guest!", { id: toastId });
        setShowDiscountInput(false);
        setDiscountAmount('');
      } else {
        const errorData = await res.json();
        console.error("Discount Error:", errorData);
        toast.error(errorData.error || "Failed to send discount", { id: toastId });
      }
    } catch (err) { toast.error("Error sending discount", { id: toastId }); }
  };

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    // Optimistic update
    setBookings(bookings.map(b => b.id === id ? { ...b, statusName: newStatus } : b));

    if (typeof id === 'string') {
      // It's a DB booking
      try {
        await fetch(`/api/bookings/${id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.error(err);
      }
    }

    toast.success(`Booking status changed to ${newStatus}`);
    setSelectedBookingDetails(null);
  };

  const handlePrev = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'Month') newDate.setMonth(newDate.getMonth() - 1);
      else if (view === 'Week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'Month') newDate.setMonth(newDate.getMonth() + 1);
      else if (view === 'Week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Guest Name,Check In,Check Out,Room,Status\n"
      + "John Smith,2026-06-10,2026-06-12,Deluxe Ocean View (101),Confirmed\n"
      + "Jane Doe,2026-06-11,2026-06-15,Executive Suite (301),Pending\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_${format(currentDate, "yyyy-MM")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statuses = [
    { name: "Pending", color: "bg-amber-100 text-amber-700" },
    { name: "Confirmed", color: "bg-brand/20 text-brand" },
    { name: "Checked In", color: "bg-blue-100 text-blue-700" },
    { name: "Checked Out", color: "bg-purple-100 text-purple-700" },
    { name: "Cancelled", color: "bg-red-100 text-red-700" },
  ];

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const today = new Date();

  // Computations for dynamic views
  const dayBookings = bookings.filter(b => isWithinInterval(startOfDay(currentDate), { start: startOfDay(b.start), end: startOfDay(b.end) }));

  const firstDayOfMonth = startOfMonth(currentDate);
  const paddingDays = firstDayOfMonth.getDay();
  const monthDays = Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => addDays(firstDayOfMonth, i));

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your reservations and calendar.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            Add Booking
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 min-w-[150px] justify-center">
            <CalendarIcon className="w-4 h-4 text-brand" /> {format(currentDate, "MMMM yyyy")}
          </div>
          <button onClick={handleNext} className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-400"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(['Day', 'Week', 'Month'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                view === v ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-wrap items-center gap-3">
        {statuses.map(s => (
          <div key={s.name} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className={`w-3 h-3 rounded-full ${s.color.split(' ')[0]}`}></div>
            {s.name}
          </div>
        ))}
      </div>

      {/* Calendar Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        {view === 'Day' && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{format(currentDate, "EEEE, MMMM d, yyyy")}</h2>
            <div className="space-y-3">
              {dayBookings.length === 0 ? (
                <p className="text-slate-500 py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">No bookings for this day.</p>
              ) : (
                dayBookings.map(b => {
                  const status = statuses.find(s => s.name === b.statusName) || statuses[0];
                  return (
                    <div key={b.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setSelectedBookingDetails(b)}>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{b.guest}</p>
                        <p className="text-sm text-slate-500">{b.room}</p>
                      </div>
                      <span className={`px-3 py-1 ${status.color.replace('text-', 'text-')} text-xs font-bold rounded-full`}>{b.statusName}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {view === 'Month' && (
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-slate-50 dark:bg-slate-800 p-3 text-center text-xs font-semibold text-slate-500">{d}</div>
            ))}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`padding-${i}`} className="bg-slate-50/50 dark:bg-slate-800/20 p-4 h-28" />
            ))}
            {monthDays.map((d, i) => {
              const bookingsToday = bookings.filter(b => isWithinInterval(startOfDay(d), { start: startOfDay(b.start), end: startOfDay(b.end) }));
              return (
                <div key={i} className={`bg-white dark:bg-slate-900 p-2 h-28 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSameDay(d, today) ? 'ring-2 ring-brand ring-inset' : ''}`}>
                  <p className={`text-[10px] font-medium ${isSameDay(d, today) ? 'text-brand' : 'text-slate-500'}`}>{format(d, 'd')}</p>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {bookingsToday.map((b, idx) => {
                      const status = statuses.find(s => s.name === b.statusName) || statuses[0];
                      return (
                        <div key={idx} className={`text-[10px] ${status.color} p-1 rounded truncate cursor-pointer hover:opacity-80`} onClick={() => setSelectedBookingDetails(b)}>
                          {b.guest}
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'Week' && (
          <div className="overflow-x-auto text-left">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
                <div className="p-4 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center justify-center">
                  Rooms
                </div>
                {weekDays.map((d, i) => (
                  <div key={i} className={`p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-0 ${isSameDay(d, today) ? 'bg-brand-light/50 dark:bg-slate-800' : ''}`}>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{format(d, 'E')}</p>
                    <p className={`text-xs font-bold mt-1 ${isSameDay(d, today) ? 'text-brand' : 'text-slate-900 dark:text-white'}`}>{format(d, 'd')}</p>
                  </div>
                ))}
              </div>

              {/* Grid content */}
              {ROOMS_LIST.map((room, ri) => (
                <div key={room} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="p-4 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{room}</span>
                  </div>

                  {/* Slots */}
                  {weekDays.map((d, di) => {
                    const booking = bookings.find(b => b.room === room && isWithinInterval(startOfDay(d), { start: startOfDay(b.start), end: startOfDay(b.end) }));
                    const isStart = booking && isSameDay(startOfDay(booking.start), startOfDay(d));
                    const isFirstInRow = di === 0;
                    const showLabel = isStart || isFirstInRow;
                    const status = booking ? (statuses.find(s => s.name === booking.statusName) || statuses[0]) : null;

                    return (
                      <div key={di} className={`border-r border-slate-100 dark:border-slate-800 last:border-0 p-2 relative h-20 ${isSameDay(d, today) ? 'bg-brand-light/20 dark:bg-slate-800/30' : ''}`}>
                        {booking && status && (
                          <div
                            onClick={() => setSelectedBookingDetails(booking)}
                            className={`absolute top-2 bottom-2 left-0 right-0 ${status.color.split(' ')[0]} border border-white dark:border-slate-800 flex flex-col justify-center px-2 z-10 cursor-pointer hover:opacity-90 
                           ${!isStart && !isFirstInRow ? '-ml-px border-l-0 rounded-none' : 'rounded-l-lg ml-1'}
                           ${isSameDay(startOfDay(booking.end), startOfDay(d)) || di === 6 ? 'rounded-r-lg mr-1' : 'border-r-0 rounded-none'}
                           `}>
                            {showLabel && (
                              <>
                                <span className={`text-[10px] font-bold ${status.color.split(' ')[1]} truncate`}>{booking.guest}</span>
                                <span className={`text-[9px] font-semibold ${status.color.split(' ')[1]} truncate`}>{status.name}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Manual Booking</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Guest Name</label>
                <input type="text" placeholder="e.g. John Smith" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check In</label>
                  <input type="date" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Check Out</label>
                  <input type="date" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Room Type</label>
                <select className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-xs">
                  <option>Deluxe Ocean View (101)</option>
                  <option>Deluxe Ocean View (102)</option>
                  <option>Standard Double (201)</option>
                  <option>Standard Double (202)</option>
                  <option>Executive Suite (301)</option>
                </select>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success("Booking confirmed successfully");
                  setIsModalOpen(false);
                }}
                className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors"
                type="button"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBookingDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Booking Details</h3>
              <button onClick={() => { setSelectedBookingDetails(null); setShowDiscountInput(false); setDiscountAmount(''); }} className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Guest Name</p>
                <p className="font-semibold text-slate-900 dark:text-white text-lg">{selectedBookingDetails.guest}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">Check In</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{format(selectedBookingDetails.start, 'MMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">Check Out</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{format(selectedBookingDetails.end, 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Room</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedBookingDetails.room}</p>
              </div>
              <div className="space-y-1 flex items-center gap-3">
                <p className="text-sm font-medium text-slate-500">Status</p>
                <span className={`px-3 py-1 ${statuses.find(s => s.name === selectedBookingDetails.statusName)?.color} text-xs font-bold rounded-full`}>
                  {selectedBookingDetails.statusName}
                </span>
              </div>

              {showDiscountInput && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Send Discount Offer</p>
                  <input
                    type="text"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="e.g. 10% OFF or LKR 2,000"
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowDiscountInput(false); setDiscountAmount(''); }}
                      className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSendDiscount(selectedBookingDetails.id)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      Send to Guest
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-wrap">
              <button onClick={() => { setSelectedBookingDetails(null); setShowDiscountInput(false); }} className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors mr-auto">Close</button>

              {(selectedBookingDetails.statusName === 'Pending' || selectedBookingDetails.statusName === 'Confirmed') && activeRole !== 'cashier' && (
                <button
                  onClick={() => handleStatusChange(selectedBookingDetails.id, 'Cancelled')}
                  className="px-4 py-2 rounded-xl font-medium text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                >
                  Cancel Booking
                </button>
              )}

              {selectedBookingDetails.statusName === 'Confirmed' && activeRole !== 'cashier' && !showDiscountInput && (
                <button onClick={() => setShowDiscountInput(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-colors">Offer Discount</button>
              )}

              {selectedBookingDetails.statusName === 'Pending' && (
                <button
                  onClick={() => handleStatusChange(selectedBookingDetails.id, 'Confirmed')}
                  className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  Confirm Booking
                </button>
              )}

              {selectedBookingDetails.statusName === 'Confirmed' && (
                <button
                  onClick={() => handleStatusChange(selectedBookingDetails.id, 'Checked In')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  Mark as Checked In
                </button>
              )}

              {selectedBookingDetails.statusName === 'Checked In' && (
                <button
                  onClick={() => handleStatusChange(selectedBookingDetails.id, 'Checked Out')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  Mark as Checked Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <Bookings {...props} />
    </DashboardLayout>
  );
}
