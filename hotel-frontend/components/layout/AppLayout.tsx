"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Search, Bell, Menu, User, MapPin, ChevronDown, LogOut, BarChart3, CalendarRange, X, Plus, Star, Newspaper } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '../AuthContext';
import AuthModal from '../AuthModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col transition-colors dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const location = { pathname };;
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState<"signin" | "signup">("signin");
  const [authInitialIsPartner, setAuthInitialIsPartner] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Points badge animation state
  const prevPointsRef = useRef<number | undefined>(undefined);
  const [pointsFlashing, setPointsFlashing] = useState(false);
  const [pointsDelta, setPointsDelta] = useState<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Animate points badge whenever user.points increases or decreases
  useEffect(() => {
    const currentPoints = user?.points ?? 0;
    const prevPoints = prevPointsRef.current;

    if (prevPoints !== undefined && currentPoints !== prevPoints) {
      const delta = currentPoints - prevPoints;
      setPointsDelta(delta);
      setPointsFlashing(true);
      const clearTimer = setTimeout(() => {
        setPointsFlashing(false);
        setPointsDelta(null);
      }, 1200);
      return () => clearTimeout(clearTimer);
    }
    prevPointsRef.current = currentPoints;
  }, [user?.points]);

  useEffect(() => {
    const handleOpenAuthModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAuthInitialView(customEvent.detail?.view || "signin");
      setAuthInitialIsPartner(false);
      setIsAuthOpen(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuthModal);
  }, []);

  const handleSignInClick = () => {
    setAuthInitialView("signin");
    setAuthInitialIsPartner(false);
    setIsAuthOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthInitialView("signup");
    setAuthInitialIsPartner(false);
    setIsAuthOpen(true);
  };

  const handleAddHotelClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthInitialView("signup");
      setAuthInitialIsPartner(true);
      setIsAuthOpen(true);
    } else if (!user.isPartner && !user.isStaff) {
      e.preventDefault();
      alert("Your account is registered as a traveler. Please register as a Hotel Partner to add listings.");
    }
  };


  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group select-none outline-none focus:outline-none focus:ring-0 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl overflow-hidden bg-brand/5 dark:bg-brand/10 flex items-center justify-center border border-slate-200/30 dark:border-slate-800/30 transition-transform duration-300 group-hover:scale-105 shadow-xs shrink-0">
              <img
                src="/yme.jpeg"
                alt="yme.lk"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "https://api.dicebear.com/7.x/initials/svg?seed=YME&backgroundColor=00a67e";
                }}
              />
            </div>
            <span className="font-bold text-lg sm:text-[22px] tracking-tight text-slate-900 dark:text-white transition-colors duration-250 group-hover:text-brand max-w-[120px] xs:max-w-none">
              hotels.yme.lk
            </span>
          </Link>

          {/* Right-aligned Navigation and Actions Group */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-5 ml-auto">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center bg-slate-100/90 dark:bg-slate-900/90 shadow-xs rounded-full p-1.5 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
              {[
                { label: 'Home', path: '/' },
                { label: 'Search', path: '/search', icon: Search },
                { label: 'Categories', path: '/categories' },
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' }
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none select-none ${isActive
                      ? 'bg-white  text-brand shadow-sm  scale-100'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                      }`}
                  >
                    {item.icon && <item.icon className="w-3.5 h-3.5" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <ThemeToggle />
            <div className="hidden sm:block w-[1px] h-6 bg-slate-200 dark:bg-slate-800"></div>

            {/* Add Hotel/Business listing button */}
            <Link
              href="/dashboard"
              onClick={handleAddHotelClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-brand text-brand hover:bg-brand hover:text-white transition-colors rounded-full text-sm font-medium shadow-sm"
            >
              <Building2 className="w-4 h-4" />
              <span>Add Hotel</span>
            </Link>

            {user ? (
              /* User authenticated dropdown menu */
              <div className="flex items-center gap-2">
                {!user.isAdmin && (
                  <div
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border relative transition-colors duration-300 ${pointsFlashing
                      ? 'bg-amber-400 text-white border-amber-400 points-flash'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className={pointsFlashing ? 'points-pop' : ''}>
                      {user.points || 0} pts
                    </span>
                    {/* Floating delta indicator */}
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
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="navbar-profile-dropdown"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pr-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition-all outline-none focus:outline-none border border-slate-200/50 dark:border-slate-800"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 shrink-0">
                      <img
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=00a67e`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=00a67e`;
                        }}
                      />
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 origin-top-right animate-in fade-in zoom-in-95">
                        <div className="px-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/10 dark:border-emerald-900/10">
                            {user.isAdmin ? "Administrator" : user.isPartner ? "Hotel Partner" : user.isStaff ? "Hotel Staff" : "Client Traveler"}
                          </span>
                        </div>

                        <div className="py-1 px-1">
                          {user.isAdmin ? (
                            <Link
                              href="/dashboard/admin-approvals"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                              <BarChart3 className="w-4 h-4 text-brand" />
                              <span>Admin Dashboard</span>
                            </Link>
                          ) : user.isPartner || user.isStaff ? (
                            <Link
                              href="/dashboard"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                              <BarChart3 className="w-4 h-4 text-brand" />
                              <span>{user.isStaff ? "Staff Dashboard" : "Partner Dashboard"}</span>
                            </Link>
                          ) : (
                            <Link
                              href="/dashboard"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            >
                              <BarChart3 className="w-4 h-4 text-brand" />
                              <span>My Dashboard</span>
                            </Link>
                          )}

                          <Link
                            href="/dashboard/settings"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>Profile & Account</span>
                          </Link>
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1 px-1">
                          <button
                            onClick={() => {
                              logout();
                              setShowDropdown(false);
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Prompt login buttons */
              <div className="flex items-center gap-2 font-medium">
                <button
                  id="navbar-signin-btn"
                  onClick={handleSignInClick}
                  className="bg-brand text-white hover:bg-brand-hover transition-all px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm cursor-pointer active:scale-[0.98] hover:scale-[1.01] inline-flex items-center justify-center whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer drop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-20 left-0 right-0 h-[calc(100vh-5rem)] bg-white dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 shadow-2xl z-40 overflow-y-auto py-6 px-4 flex flex-col justify-between animate-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">Navigation Menu</span>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                Home
              </Link>
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                <Search className="w-4 h-4 text-brand" /> Search Hotels
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-900 pt-6 space-y-3">
              <Link
                href="/dashboard"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleAddHotelClick(e);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-brand text-white rounded-full text-sm font-semibold hover:bg-brand-hover transition-all shadow-md shadow-brand/10"
              >
                <Building2 className="w-4 h-4" />
                <span>Add Your Hotel</span>
              </Link>
              <p className="text-center text-xs text-slate-450 dark:text-slate-550">
                Authorized partner registration has bank-grade verification.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Responsive unified Authentication Modal overlay */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialView={authInitialView}
        initialIsPartner={authInitialIsPartner}
      />

    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0a1128] text-slate-300 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4 text-white">
            <div className="w-9 h-9 rounded-lg bg-yme-green flex items-center justify-center text-white font-bold text-lg">
              Y
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none tracking-tight">YME <span className="text-yme-green">Hotels</span></span>
              <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold leading-none mt-1">hotel.yme.lk</span>
            </div>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            Sri Lanka's trusted hotel booking platform. Discover verified hotels, resorts, villas and guest houses across Sri Lanka.
          </p>
          <div className="flex gap-2">
            {[
              {
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ),
                href: "https://www.facebook.com/yme.lk",
                label: "Facebook"
              },
              {
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                ),
                href: "https://www.instagram.com/yme.lk",
                label: "Instagram"
              },
              {
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                ),
                href: "https://twitter.com/yme_lk",
                label: "Twitter"
              },
              {
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                ),
                href: "https://www.linkedin.com/company/yme-solutions",
                label: "LinkedIn"
              }
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 bg-slate-800 hover:bg-brand hover:text-white rounded flex items-center justify-center transition-colors text-slate-350 hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Discovery</h3>
          <ul className="space-y-2">
            <li><Link href="/search" className="hover:text-white flex items-center gap-2"><Search className="w-3 h-3" /> Search Hotels</Link></li>
            <li><Link href="/categories" className="hover:text-white flex items-center gap-2"><Menu className="w-3 h-3" /> Browse Categories</Link></li>
            <li><Link href="/search" className="hover:text-white flex items-center gap-2"><MapPin className="w-3 h-3" /> Trending Places</Link></li>
            <li><Link href="/news" className="hover:text-white flex items-center gap-2"><Newspaper className="w-3 h-3" /> News</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">For Business</h3>
          <ul className="space-y-2">
            <li><Link href="/dashboard" className="hover:text-white flex items-center gap-2"><Building2 className="w-3 h-3" /> For Hotel Owners</Link></li>
            <li><Link href="/dashboard" className="hover:text-white flex items-center gap-2"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> Business Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-brand mt-0.5" />
              <span>YME solutions Pvt Ltd,<br />Nugegoda, Sri Lanka</span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>070 695 5000</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} yme.lk. All rights reserved.</p>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Link href="/about" className="hover:text-white">About Us</Link>
          <Link href="/news" className="hover:text-white">News Updates</Link>
          <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-white">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
