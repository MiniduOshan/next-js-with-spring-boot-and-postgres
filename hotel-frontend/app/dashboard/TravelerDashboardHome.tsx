"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { CalendarCheck, Heart, MapPin, Bell, ArrowRight, Sparkles, Star, Crown, Zap, Gift } from 'lucide-react';
import { useAuth } from "@/components/AuthContext";
import { useSavedHotels } from "@/lib/useSavedHotels";
import { format, parseISO } from 'date-fns';

export default function TravelerDashboardHome() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    fetch('/api/notifications', {
      headers: {
        'X-Recipient-Email': user.email
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
        setLoadingNotifs(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingNotifs(false);
      });
  }, [user?.email]);

  const { savedHotels } = useSavedHotels();
  const activeNotifsCount = notifications.filter(n => !n.read).length;

  const stats = [
    { label: "Upcoming Trips", value: "2", icon: CalendarCheck, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Saved Hotels", value: String(savedHotels.length), icon: Heart, color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10" },
    { label: "Unread Alerts", value: String(activeNotifsCount), icon: Bell, color: "text-amber-550 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  ];

  const planMeta: Record<string, { icon: React.ReactNode; label: string; colorClass: string; borderClass: string; bgClass: string }> = {
    free:    { icon: <Gift className="w-4 h-4" />,  label: 'Free',    colorClass: 'text-slate-600 dark:text-slate-300', borderClass: 'border-slate-200 dark:border-slate-700', bgClass: 'bg-slate-50 dark:bg-slate-800' },
    pro:     { icon: <Zap  className="w-4 h-4" />,  label: 'Pro',     colorClass: 'text-brand',                          borderClass: 'border-brand/30 dark:border-brand/40',   bgClass: 'bg-brand/5 dark:bg-brand/10' },
    premium: { icon: <Crown className="w-4 h-4" />, label: 'Premium', colorClass: 'text-violet-600 dark:text-violet-400', borderClass: 'border-violet-300 dark:border-violet-600', bgClass: 'bg-violet-50 dark:bg-violet-900/20' },
  };

  const plan = user?.subscriptionPlan || 'free';
  const meta = planMeta[plan] || planMeta.free;
  const expiryDate = user?.subscriptionExpiry ? parseISO(user.subscriptionExpiry) : null;
  const isExpired = expiryDate ? expiryDate < new Date() : false;

  return (
    <div id="traveler-home-dashboard" className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Welcome back, {user?.name || 'Traveler'}!</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your hotel reservations, upcoming trips, promotional offers and updates.</p>
        </div>
      </div>

      {/* Active Subscription Plan Banner */}
      <div className={`rounded-2xl border p-4 flex items-center gap-4 ${meta.bgClass} ${meta.borderClass}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.colorClass} bg-white dark:bg-slate-900 shadow-sm border ${meta.borderClass}`}>
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-black text-sm ${meta.colorClass}`}>{meta.label} Plan</span>
            {!isExpired && expiryDate && (
              <span className="text-[10px] font-bold bg-white dark:bg-slate-900 border border-current/20 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">
                Active until {format(expiryDate, 'dd MMM yyyy')}
              </span>
            )}
            {isExpired && (
              <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                Expired
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {plan === 'premium' ? 'Full access to all YME Hotels features and priority support.' :
             plan === 'pro'     ? 'Up to 5 hotel listings with analytics and promotions.' :
                                  'Basic listing for 1 hotel. Upgrade for more features.'}
          </p>
        </div>
        {plan !== 'premium' && (
          <Link
            href="/#pricing"
            className="shrink-0 text-xs font-semibold bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color} shrink-0`}>
                <s.icon className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-slate-550 dark:text-slate-400 text-xs font-semibold">{s.label}</h3>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recommended for you card / search CTA (Colspan 2) */}
        <div className="lg:col-span-2 space-y-4">
          {savedHotels.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Your Saved Hotels
                </h3>
                <Link href="/" className="text-xs text-brand font-semibold hover:underline">Find more</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedHotels.map(hotel => (
                  <Link key={hotel.id} href={`/hotel/${hotel.slug}`} className="group flex flex-col border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-all bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="h-36 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors line-clamp-1">{hotel.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-emerald-500" /> {hotel.locationDetail}</p>
                      <div className="mt-auto pt-3 flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">LKR {Number(hotel.price).toLocaleString()}</span>
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" /> {hotel.rating}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 p-6 text-center flex flex-col justify-center min-h-[320px]">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">No Saved Hotels Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 max-w-sm mx-auto">Explore premium resorts across Sri Lanka and save your favorites here for quick access later.</p>
              <Link href="/" className="inline-block bg-brand hover:bg-brand-hover text-white px-8 py-2 rounded-full font-semibold text-xs transition-transform hover:scale-[1.02] shadow-md shadow-brand/10 w-fit mx-auto cursor-pointer">
                Search Verified Hotels
              </Link>
            </div>
          )}
        </div>

        {/* Live Alerts Side panel (Colspan 1) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col min-h-[320px]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand" />
                <span>Recent Updates</span>
              </h3>
              <Link href="/dashboard/notifications" className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
              {loadingNotifs ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-slate-50 dark:bg-slate-950 rounded-xl p-3 h-16" />
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                notifications.slice(0, 3).map((n) => (
                  <div
                    key={n._id}
                    className={`p-3.5 rounded-xl border text-xs relative ${n.read
                      ? 'bg-slate-50/50 dark:bg-slate-950/25 border-slate-100 dark:border-slate-800/80'
                      : 'bg-brand/5 dark:bg-brand/10 border-brand/15'
                      }`}
                  >
                    {!n.read && (
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand rounded-full" />
                    )}
                    <div className="pl-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-slate-900 dark:text-white truncate ${!n.read ? 'text-brand' : ''}`}>{n.title}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center flex-1">
                  <Sparkles className="w-5 h-5 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-slate-400 dark:text-slate-500 text-xs">All notifications caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
