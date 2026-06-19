"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  DoorOpen,
  CalendarCheck,
  Tags,
  Star,
  Settings,
  BarChart3,
  Home,
  LogOut,
  Menu,
  X,
  LockKeyhole,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  Bell,
  Lock,
  CheckSquare,
  Compass,
  Package,
  Users,
  Mail,
  BookOpen,
  CreditCard,
  ArrowLeft,
  MessageSquare,
  Newspaper,
  UtensilsCrossed,
  MapPin
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '../AuthContext';
import AuthModal from '../AuthModal';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, activeRole, accessibleHotels, activeHotel, switchHotel } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<"signin" | "signup">("signin");
  const pathname = usePathname();
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    setCurrentHash(window.location.hash);
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    const interval = setInterval(() => {
      if (window.location.hash !== currentHash) {
        setCurrentHash(window.location.hash);
      }
    }, 100);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      clearInterval(interval);
    };
  }, [currentHash, pathname]);

  const location = { pathname, hash: currentHash };
  const router = useRouter();
  const navigate = (path) => router.push(path);;

  const adminNavGroups = [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Approvals', path: '/dashboard/approvals', icon: CheckSquare },
      ]
    },
    {
      category: 'Management',
      items: [
        { name: 'Users', path: '/dashboard/users', icon: Users },
        { name: 'Bookings', path: '/dashboard/admin-bookings', icon: BookOpen },
        { name: 'Site Content', path: '/dashboard/manage-site', icon: Compass },
        { name: 'News Updates', path: '/dashboard/news-updates', icon: Newspaper },
      ]
    },
    {
      category: 'System',
      items: [
        { name: 'Communications', path: '/dashboard/communications', icon: Mail },
        { name: 'Price Plans', path: '/dashboard/price-plans', icon: CreditCard },
        { name: 'Plan Usages', path: '/dashboard/partner-usages', icon: Users },
        { name: 'Loyalty System', path: '/dashboard/loyalty', icon: Star },
        { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  const travelerNavGroups = [
    {
      category: 'Main',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'My Bookings', path: '/dashboard/my-bookings', icon: CalendarCheck },
        { name: 'Trip Requests', path: '/dashboard/trip-requests', icon: Compass },
        { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
        { name: 'My Rewards', path: '/dashboard/rewards', icon: Star },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
      ]
    }
  ];

  const partnerNavGroups = [
    // හෝටලයක් තෝරා නොමැති විට හෝ පරිශීලකයා Owner නොවන විට Main මෙනුව පෙන්වීම
    ...((!activeHotel || activeRole !== 'owner') ? [{
      category: 'Main',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
        { name: 'My Rewards', path: '/dashboard/rewards', icon: Star },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings },
      ]
    }] : []),
    // හෝටලයක් තෝරා ඇති විට අදාළ ව්‍යාපාරික මෙනු පෙන්වීම
    ...(activeHotel && activeRole ? [{
      category: 'Business',
      items: [
        ...(activeRole === 'owner' ? [
          { name: 'My Hotel', path: '/dashboard/hotel', icon: Building2 },
          { name: 'Hotel Dashboard', path: '/dashboard', icon: BarChart3 },
          { name: 'Manage Members', path: '/dashboard/hotel#staff-management', icon: Users },
        ] : []),
        ...(activeRole !== 'cashier' ? [
          { name: 'Rooms', path: '/dashboard/rooms', icon: DoorOpen },
          { name: 'Packages', path: '/dashboard/packages', icon: Package },
          { name: 'Restaurant', path: '/dashboard/restaurant', icon: UtensilsCrossed },
          { name: 'Offers', path: '/dashboard/offers', icon: Tags },
          { name: 'Hotel Area Info', path: '/dashboard/area-info', icon: MapPin },
          { name: 'Guest Requests', path: '/dashboard/guest-requests', icon: MessageSquare },
        ] : []),
        { name: 'Bookings', path: '/dashboard/bookings', icon: CalendarCheck },
        ...(activeRole !== 'cashier' ? [
          { name: 'Reviews', path: '/dashboard/reviews', icon: Star },
        ] : []),
      ]
    }] : [])
  ];

  const navGroups = activeHotel ? partnerNavGroups : (user?.isAdmin ? adminNavGroups : ((user?.isPartner || user?.isStaff || activeRole) ? partnerNavGroups : travelerNavGroups));

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);

  const fetchNotifs = () => {
    if (!user?.email) return;
    fetch('/api/notifications', {
      headers: {
        'X-Recipient-Email': user.email
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          let filtered = data;
          if (user) {
            const isUserAdmin = user.isAdmin || user.email?.toLowerCase() === 'admin@yme.lk';
            if (isUserAdmin) {
              filtered = data.filter(n => {
                const titleLower = n.title.toLowerCase();
                const messageLower = n.message.toLowerCase();
                return (
                  titleLower.includes('registration') ||
                  titleLower.includes('register') ||
                  titleLower.includes('operator') ||
                  messageLower.includes('registered') ||
                  messageLower.includes('operator') ||
                  titleLower.includes('application')
                );
              });
            } else if (user.isPartner) {
              filtered = data.filter(n => n.type === 'booking_status' || n.type === 'review_reply' || n.type === 'offer');
            } else { // Normal user (traveler)
              filtered = data.filter(n => n.type === 'booking_status' || n.type === 'review_reply' || n.type === 'offer' || n.type === 'info');
            }
          }

          if (isFirstLoadRef.current) {
            const initialIds = new Set<string>();
            filtered.forEach(n => initialIds.add(n._id));
            knownNotifIdsRef.current = initialIds;
            isFirstLoadRef.current = false;
          } else {
            filtered.forEach(n => {
              if (!n.read && !knownNotifIdsRef.current.has(n._id)) {
                toast.success(n.title, {
                  description: n.message,
                  duration: 5000,
                  icon: <Bell className="w-4 h-4 text-brand animate-bounce" />
                });
                knownNotifIdsRef.current.add(n._id);
              } else if (!knownNotifIdsRef.current.has(n._id)) {
                knownNotifIdsRef.current.add(n._id);
              }
            });
          }
          setNotifications(filtered);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  // Points badge animation
  const prevPointsRef = useRef<number | undefined>(undefined);
  const [pointsFlashing, setPointsFlashing] = useState(false);
  const [pointsDelta, setPointsDelta] = useState<number | null>(null);

  useEffect(() => {
    const currentPoints = user?.points ?? 0;
    const prevPoints = prevPointsRef.current;
    if (prevPoints !== undefined && currentPoints !== prevPoints) {
      const delta = currentPoints - prevPoints;
      setPointsDelta(delta);
      setPointsFlashing(true);
      const t = setTimeout(() => { setPointsFlashing(false); setPointsDelta(null); }, 1200);
      return () => clearTimeout(t);
    }
    prevPointsRef.current = currentPoints;
  }, [user?.points]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  // Guard routing / layout when not authenticated or not a partner
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-5 transition-colors">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden text-center p-6 relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-yme-green to-brand" />

          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/20 text-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <LockKeyhole className="w-7 h-7" />
          </div>

          <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-white mb-2">
            Dashboard Access Required
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto">
            You must be logged in as an authorized **YME Hotels Owner / Partner** to access inventory, room listings, offers and system settings.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setAuthInitialView("signin");
                setIsAuthOpen(true);
              }}
              className="w-full py-2 bg-brand hover:bg-brand-hover text-white rounded-full text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In as Partner</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setAuthInitialView("signup");
                setIsAuthOpen(true);
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-full text-sm font-medium transition-all"
            >
              Create Partner Account
            </button>

            <Link
              href="/"
              className="block w-full py-2 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-all"
            >
              Back to main site
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialView={authInitialView}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col lg:flex-row transition-colors">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-900 text-slate-850 px-4 py-3 flex justify-between items-center z-50 fixed top-0 left-0 right-0 border-b border-slate-100 dark:border-slate-800/50 h-16">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
            Y
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">hotels.yme.lk</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-[60] w-64 h-screen bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-transform duration-300 ease-in-out shrink-0 flex flex-col pt-16 lg:pt-0 border-r border-slate-100 dark:border-slate-800/60",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-5 hidden lg:block border-b border-slate-100 dark:border-slate-800/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-lg leading-none shadow-sm">
              Y
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-900 dark:text-white leading-none tracking-tight">hotels.yme.lk</span>
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-semibold leading-none mt-1">hotels.yme.lk</span>
            </div>
          </Link>

          {activeHotel && (
            <div className="mt-6 space-y-4">
              {activeRole === 'owner' && (
                <button
                  onClick={() => {
                    switchHotel('');
                    navigate('/dashboard');
                  }}
                  className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-brand transition-colors uppercase tracking-widest outline-none bg-transparent border-none cursor-pointer p-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio
                </button>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-0.5">Active Hotel</label>
                <div className="relative">
                  <select
                    value={activeHotel?._id || ''}
                    onChange={(e) => switchHotel(e.target.value)}
                    className="w-full appearance-none bg-transparent border-none text-slate-900 dark:text-white text-base font-bold p-0 pr-6 focus:outline-none focus:ring-0 cursor-pointer"
                  >

                    {accessibleHotels.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.propertyName || 'My Hotel'}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded capitalize tracking-wide">
                    {activeRole} Role
                  </span>
                </div>
              </div>
            </div>
          )}

          {!activeHotel && (
            <p className="text-xs text-slate-400 mt-4 ml-1 font-medium">
              {user?.isAdmin ? 'Admin Dashboard' : 'Partner Dashboard'}
            </p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              {group.category && (
                <div className="px-3 mb-2 text-xs font-extrabold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {group.category}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const isActive = item.path.includes('#')
                    ? (location.pathname + location.hash) === item.path
                    : (location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))) && !location.hash;

                  const handleItemClick = () => {
                    setMobileMenuOpen(false);
                  };

                  if (item.name === 'Settings') {
                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm active:scale-[0.98] group",
                            isActive
                              ? "bg-brand text-white shadow-md shadow-brand/15 font-semibold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-450 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white")} />
                            {item.name}
                          </div>
                          {isSettingsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isSettingsExpanded && (
                          <div className="pl-4 space-y-1 mt-1">
                            <Link href="/dashboard/settings?tab=account" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                              <User className="w-3.5 h-3.5" /> Account Manager
                            </Link>
                            <Link href="/dashboard/settings?tab=notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                              <Bell className="w-3.5 h-3.5" /> Notifications
                            </Link>
                            <Link href="/dashboard/settings?tab=security" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                              <Lock className="w-3.5 h-3.5" /> Security
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={handleItemClick}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm active:scale-[0.98] group",
                        isActive
                          ? "bg-brand text-white shadow-md shadow-brand/15 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-white" : "text-slate-450 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white")} />
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'Notifications' && unreadCount > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 text-[9px] font-extrabold rounded-full shrink-0 min-w-[18px] text-center",
                          isActive ? "bg-white text-brand" : "bg-brand text-white"
                        )}>
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-medium text-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 w-full text-left cursor-pointer active:scale-[0.98] group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-450 dark:text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex justify-between items-center shrink-0">
          <h1 className="text-sm font-bold text-slate-900 dark:text-white hidden sm:block">
            {navGroups.flatMap(g => g.items).find(i => location.pathname === i.path || (i.path !== '/dashboard' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                id="header-bell-btn"
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand bg-slate-100 dark:bg-slate-800 rounded-xl transition-all cursor-pointer relative"
                title="View alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifDropdownOpen(false)} />
                  <div className="fixed lg:absolute top-20 lg:top-full left-4 lg:left-auto right-4 lg:right-0 lg:mt-3 w-auto lg:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3 origin-top lg:origin-top-right">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Recent Alerts</span>
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setIsNotifDropdownOpen(false)}
                        className="text-xs text-brand hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 4).map((n) => (
                          <div
                            key={n._id}
                            className={cn(
                              "p-2.5 rounded-xl border text-left text-xs transition-all",
                              n.read
                                ? "bg-slate-50/50 dark:bg-slate-950/25 border-slate-100 dark:border-slate-800"
                                : "bg-brand/5 dark:bg-brand/10 border-brand/10"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={cn("font-bold text-slate-900 dark:text-white truncate", !n.read && "text-brand")}>{n.title}</span>
                              {!n.read && <span className="w-2 h-2 bg-brand rounded-full shrink-0" />}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-450 text-xs">
                          No alerts. You are completely up to date!
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link href="/" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand flex items-center gap-2">
              <Home className="w-4 h-4" /> Back to main site
            </Link>
            {!user?.isAdmin && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border relative transition-colors duration-300 ${pointsFlashing
                  ? 'bg-amber-400 text-white border-amber-400 points-flash'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className={pointsFlashing ? 'points-pop' : ''}>{user.points || 0} pts</span>
                {pointsDelta !== null && (
                  <span
                    className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-extrabold whitespace-nowrap pointer-events-none"
                    style={{
                      color: pointsDelta > 0 ? '#16a34a' : '#dc2626',
                      animation: 'floatUp 1.1s ease-out forwards'
                    }}
                  >
                    {pointsDelta > 0 ? `+${pointsDelta}` : pointsDelta} pts
                  </span>
                )}
              </div>
            )}
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=00a67e`}
                className="w-full h-full object-cover"
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=00a67e`;
                }}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
