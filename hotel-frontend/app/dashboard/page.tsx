"use client";

import { CalendarCheck, DollarSign, TrendingUp, Users, Plus, Star, X, Building2, MapPin, Settings, Trash2, ArrowLeft, Map as MapIcon } from 'lucide-react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { useAuth } from "@/components/AuthContext";
import TravelerDashboardHome from './TravelerDashboardHome';
import AdminDashboardHome from './AdminDashboardHome';
import { format } from 'date-fns';
import { HotelDetailsModal } from "@/components/HotelDetailsModal";
import { MOCK_BOOKINGS } from './Bookings';
import PartnerStatusMessage from './PartnerStatusMessage';
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useState, useEffect } from 'react';

import { toast } from 'sonner';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'Confirmed': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    case 'Checked In': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    case 'Checked Out': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
};

function DashboardHome() {
  const { user, activeHotel, activeRole, accessibleHotels, switchHotel, refreshHotels } = useAuth();
  const router = useRouter();
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dbRooms, setDbRooms] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState<any>(null);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<any>(null);
  const [selectedHotelForDetails, setSelectedHotelForDetails] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  const handleOpenStatusModal = (b: any) => {
    setSelectedBookingForStatus(b);
    setStatusModalOpen(true);
  };

  useEffect(() => {
    const emailHeader: Record<string, string> = { "X-Owner-Email": user?.email || "" };
    if (activeHotel) {
      emailHeader["X-Hotel-Id"] = activeHotel._id;
    }

    // Bookings
    fetch("/api/bookings", { headers: emailHeader })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formattedData = data.map((b: any) => ({
            id: b._id,
            guest: b.guestName,
            room: b.items ? b.items.map((i: any) => `${i.name} (x${i.quantity})`).join(", ") : (b.roomName || "N/A"),
            start: new Date(b.checkIn),
            end: new Date(b.checkOut),
            statusName: b.status,
            amount: b.amount
          }));
          setDbBookings(formattedData);
        }
      })
      .catch(console.error);

    // Rooms
    fetch("/api/rooms", { headers: emailHeader })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbRooms(data);
      })
      .catch(console.error);

    // Reviews
    fetch("/api/reviews", { headers: emailHeader })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbReviews(data);
      })
      .catch(console.error);

    // Partner Profile
    if (user?.isPartner) {
      fetch("/api/partner-profile/me", { headers: emailHeader })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) setPartnerProfile(data);
        })
        .catch(console.error);
    }
  }, [user?.email, user?.isPartner, activeHotel?._id]);

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    setDbBookings(prev => prev.map(b => b.id === id ? { ...b, statusName: newStatus } : b));

    if (typeof id === 'string') {
      try {
        await fetch(`/api/bookings/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Owner-Email": user?.email || ""
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (err) {
        console.error(err);
      }
    }
    toast.success(`Booking status changed to ${newStatus}`);
    setStatusModalOpen(false);
    setSelectedBookingForStatus(null);
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    try {
      const res = await fetch(`/api/hotels/${hotelToDelete._id}`, {
        method: "DELETE",
        headers: {
          "X-Owner-Email": user?.email || ""
        }
      });
      if (res.ok) {
        toast.success(`${hotelToDelete.propertyName || 'Hotel'} deleted successfully`);

        // Refresh the list and reset active hotel if the deleted one was active
        if (activeHotel?._id === hotelToDelete._id) {
          localStorage.removeItem("yme_active_hotel_id");
        }
        await refreshHotels();
      } else {
        toast.error("Failed to delete hotel");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting hotel");
    } finally {
      setHotelToDelete(null);
    }
  };

  // 1. If Admin, show Administrator panel metrics
  if (user?.isAdmin && !activeHotel) {
    return <AdminDashboardHome />;
  }

  // 2. If Partner, but not approved yet, block list and show standby notice
  if (user?.isPartner && user?.hotelStatus !== "approved") {
    return <PartnerStatusMessage status={user.hotelStatus || "pending"} hotelName={user.hotelName || "Your Property"} />;
  }

  // 3. If Traveler (not a partner or hotel staff), guide to traveler stats
  if (!user?.isPartner && !user?.isStaff && !activeRole) {
    return <TravelerDashboardHome />;
  }

  const isMockAllowed = user?.email?.toLowerCase() === "partner@yme.lk";

  const allBookings = isMockAllowed ? [...dbBookings, ...MOCK_BOOKINGS] : dbBookings;
  const recentBookings = allBookings.slice(0, 5);

  // Dynamic Metrics calculation
  const totalBookingsVal = isMockAllowed ? "124" : String(allBookings.length);
  const bookingsChangeVal = isMockAllowed ? "+12%" : (dbBookings.length > 0 ? "+100%" : "0%");

  let revenueVal = "0";
  let revPercentage = "0%";
  if (isMockAllowed) {
    revenueVal = "2.4M";
    revPercentage = "+18%";
  } else {
    let totalAmtNum = 0;
    allBookings.forEach(b => {
      if (b.statusName === 'Cancelled') return;
      if (!b.amount) return;
      const parsed = parseFloat(b.amount.replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed)) totalAmtNum += parsed;
    });

    if (totalAmtNum >= 1000000) {
      revenueVal = (totalAmtNum / 1000000).toFixed(1) + "M";
    } else {
      revenueVal = totalAmtNum.toLocaleString();
    }
    revPercentage = totalAmtNum > 0 ? "+100%" : "0%";
  }

  let occupancyVal = "0%";
  if (isMockAllowed) {
    occupancyVal = "78%";
  } else {
    const activeBookings = allBookings.filter(b => b.statusName === 'Confirmed' || b.statusName === 'Checked In').length;
    if (activeBookings > 0 && dbRooms.length > 0) {
      const totalCapacity = dbRooms.reduce((sum, r) => sum + (r.qty * (r.capacity || 2)), 0);
      occupancyVal = totalCapacity > 0 ? `${Math.min(100, Math.round((activeBookings / totalCapacity) * 100))}%` : "50%";
    } else {
      occupancyVal = activeBookings > 0 ? "50%" : "0%";
    }
  }
  const occChangeVal = isMockAllowed ? "+5%" : "0%";

  const viewsVal = isMockAllowed ? "3,240" : "12";
  const viewsChangeVal = isMockAllowed ? "+24%" : "0%";

  const stats = [
    { label: "Total Bookings", value: totalBookingsVal, change: bookingsChangeVal, icon: CalendarCheck, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    ...(activeRole !== 'cashier' ? [
      { label: "Revenue (LKR)", value: revenueVal, change: revPercentage, icon: DollarSign, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
      { label: "Occupancy Rate", value: occupancyVal, change: occChangeVal, icon: TrendingUp, color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
      { label: "Profile Views", value: viewsVal, change: viewsChangeVal, icon: Users, color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
    ] : []),
  ];

  const dashboardReviews = isMockAllowed
    ? (dbReviews.length > 0
      ? dbReviews.map(r => ({ name: r.guest, rating: r.score, text: r.text })).slice(0, 3)
      : [
        { name: "Sarah W.", rating: 5, text: "Amazing view and great staff!" },
        { name: "David K.", rating: 4, text: "Good breakfast, room was clean." }
      ])
    : dbReviews.map(r => ({ name: r.guest, rating: r.score, text: r.text })).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-4">

      {/* Header logic for Portfolio vs Single Hotel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          {activeHotel && (activeRole === 'owner' || user?.isAdmin) && (
            <button
              onClick={() => {
                switchHotel('');
                router.push('/dashboard');
              }}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand hover:border-brand/30 rounded-xl transition-all shadow-sm group"
              title="Exit to Portfolio"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{activeHotel ? activeHotel.propertyName : "Portfolio Overview"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{activeHotel ? `Managing ${activeHotel.city} property` : `Combined analytics for ${accessibleHotels.length} properties`}</p>
          </div>
        </div>
      </div>

      {/* Partner Plan Banner */}
      {user?.isPartner && activeRole === 'owner' && partnerProfile && (
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 text-brand rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Current Plan: <span className="text-brand">{partnerProfile.plan}</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You have {partnerProfile.totalBookings} total bookings and {partnerProfile.totalHotels} listed hotels.
                {partnerProfile.plan === "Free" && " Reach 10 bookings to auto-upgrade to Pro!"}
                {partnerProfile.plan === "Pro" && " Reach 100 bookings to auto-upgrade to Premium!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-right">
              <p className="text-xs text-slate-500 font-medium">Pending Commission</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">LKR {partnerProfile.pendingCommission?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards */}
      <div className={`grid grid-cols-1 gap-4 mb-8 ${activeRole === 'cashier' ? 'sm:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{s.change}</span>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{s.label}</h3>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* My Properties Grid (For Owners/Staff with multiple access) */}
      {user?.isPartner && !activeHotel && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 mb-8">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand" />
            My Properties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accessibleHotels.map(hotel => (
              <div
                key={hotel._id}
                onClick={() => switchHotel(hotel._id)}
                className={`relative group rounded-xl border p-4 cursor-pointer transition-all ${activeHotel?._id === hotel._id ? 'border-brand bg-brand/5 dark:bg-brand/10 shadow-sm ring-1 ring-brand' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand/50 hover:shadow-md'}`}
              >
                {activeHotel?._id === hotel._id && (
                  <span className="absolute top-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
                  </span>
                )}
                <div className="flex gap-3 items-center mb-3">
                  {hotel.images && hotel.images[0] ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{hotel.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1"><MapPin className="w-3 h-3" /> {hotel.city}</p>
                  </div>
                </div>
                {(user?.email === hotel.owner || user?.isAdmin) && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent switching active hotel when just managing
                        switchHotel(hotel._id);
                        router.push('/dashboard/hotel');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand/10 hover:bg-brand/20 text-brand text-xs font-semibold py-1.5 rounded-lg transition-colors border border-brand/20"
                    >
                      <Settings className="w-3.5 h-3.5" /> Manage
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHotelToDelete(hotel);
                      }}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                      title="Delete Hotel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {!activeHotel && (
              <Link
                href="/dashboard/hotel"
                className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand/50 hover:bg-brand/5 flex flex-col items-center justify-center p-4 cursor-pointer transition-all min-h-[120px]"
              >
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-2 text-brand">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm">Add New Hotel</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {activeHotel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* New Bookings */}
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${activeRole === 'cashier' ? 'col-span-1 lg:col-span-3' : 'col-span-1 lg:col-span-2'}`}>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Recent Bookings <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{recentBookings.length}</span></h2>
              <Link href="/dashboard/bookings" className="text-brand text-sm font-medium hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-4 font-medium">Guest</th>
                    <th className="px-4 py-4 font-medium">Room Type</th>
                    <th className="px-4 py-4 font-medium">Dates</th>
                    <th className="px-4 py-4 font-medium">Amount</th>
                    <th className="px-4 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentBookings.length > 0 ? recentBookings.map((b, i) => (
                    <tr key={b.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{b.guest}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{b.room}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{b.start instanceof Date ? `${format(b.start, 'MMM dd')} - ${format(b.end, 'MMM dd')}` : `${b.start} - ${b.end}`}</td>
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{b.amount}</td>
                      <td className="px-4 py-4 text-right">
                        <button onClick={() => handleOpenStatusModal(b)} className={`px-3 py-1.5 border rounded-xl text-xs font-semibold shadow-sm transition-opacity hover:opacity-80 cursor-pointer ${getStatusColor(b.statusName)}`}>{b.statusName}</button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No recent bookings.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Info */}
          {activeRole !== 'cashier' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Create New Offer</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Boost your bookings by creating a limited time flash offer.</p>
                  <Link href="/dashboard/offers" className="w-full inline-block bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-semibold transition-colors text-sm">
                    Create Offer
                  </Link>
                </div>

                <Link href="/dashboard/area-info" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white">Hotel Area Info</h3>
                    <p className="text-xs text-slate-500">Nearby attractions & landmarks</p>
                  </div>
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex justify-between items-center">
                  Recent Reviews <Link href="/dashboard/reviews" className="font-normal text-xs text-brand hover:underline cursor-pointer">View All</Link>
                </h3>
                <div className="space-y-3">
                  {dashboardReviews.length > 0 ? dashboardReviews.map((r, i) => (
                    <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white mr-2">{r.name}</span>
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{r.text}</p>
                    </div>
                  )) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No recent reviews yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {statusModalOpen && selectedBookingForStatus && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Update Status</h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Status for <span className="font-semibold text-slate-900 dark:text-white">{selectedBookingForStatus.guest}</span></p>
                <span className={`inline-block px-3 py-1 border rounded-lg text-xs font-bold ${getStatusColor(selectedBookingForStatus.statusName)}`}>
                  {selectedBookingForStatus.statusName}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Change to</p>
                {['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'].map(status => {
                  if (status === selectedBookingForStatus.statusName) return null;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedBookingForStatus.id, status)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${getStatusColor(status)} hover:opacity-80`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {hotelModalOpen && selectedHotelForDetails && (
        <HotelDetailsModal
          hotel={selectedHotelForDetails}
          userEmail={user?.email || ""}
          onClose={() => setHotelModalOpen(false)}
          onStaffUpdated={refreshHotels}
        />
      )}

      <ConfirmationModal
        isOpen={hotelToDelete !== null}
        onClose={() => setHotelToDelete(null)}
        onConfirm={handleDeleteHotel}
        title="Delete Property"
        message={`Are you sure you want to delete "${hotelToDelete?.propertyName || 'this hotel'}"? All associated rooms, bookings, and data will be permanently removed. This action cannot be undone.`}
      />
    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <DashboardHome {...props} />
    </DashboardLayout>
  );
}
