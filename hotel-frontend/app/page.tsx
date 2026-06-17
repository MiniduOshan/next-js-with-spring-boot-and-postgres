"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";;
import { Search, MapPin, Calendar as CalendarIcon, Users, Star, CheckCircle, ShieldCheck, Zap, Heart, ArrowRight, Building2, TrendingUp, ChevronLeft, ChevronRight, Plus, Minus, X, Mail, Crown, Gift, CheckCircle2, Tag, Ticket, Sparkles, Send, BellRing, AlertCircle, Bed } from 'lucide-react';
import { cn, generateHotelSlug } from "@/lib/utils";
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { toast } from 'sonner';
import { getCategories } from "@/lib/adminData";
import { ALL_HOTELS } from "@/lib/hotelData";
import { getSystemPackages } from "@/lib/packagesData";
import OfferDetailsModal from "@/components/OfferDetailsModal";
import { useAuth } from "@/components/AuthContext";

function Home() {
  return (
    <div className="pb-20">
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        <FeaturedHotels />
        <FeaturedOffers />
        <WhyChooseUs />
        <PricingSection />
        <PopularDestinations />
        <PartnerBanner />
      </div>
    </div>
  );
}

function HeroSection() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date>(startOfToday());
  const [checkOut, setCheckOut] = useState<Date>(addDays(startOfToday(), 2));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<'checkIn' | 'checkOut' | 'guests' | 'rooms' | null>(null);
  
  // Bidding State
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidBudget, setBidBudget] = useState('');
  const [bidReqs, setBidReqs] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [showBidInfo, setShowBidInfo] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('hasSeenBidInfo') !== 'true' : false));
  const { user } = useAuth();
  const router = useRouter();

  const searchRef = useRef<HTMLDivElement>(null);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const dismissBidInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowBidInfo(false);
    localStorage.setItem('hasSeenBidInfo', 'true');
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a bid request.");
      return;
    }
    if (!bidBudget || !bidReqs) {
      toast.error("Please fill in your budget and requirements.");
      return;
    }
    setIsBidding(true);
    const toastId = toast.loading("Submitting trip request...");
    try {
      const res = await fetch("/api/bid-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, userName: user.name, location: destination || "Any Location", budget: bidBudget, requirements: bidReqs })
      });
      if (res.ok) {
        toast.success("Trip request submitted successfully!", { id: toastId });
        setShowBidModal(false);
        router.push('/dashboard/trip-requests');
      } else { toast.error("Failed to submit request", { id: toastId }); }
    } catch (err) { toast.error("Error submitting request", { id: toastId }); }
    finally { setIsBidding(false); }
  };

  const trendingHotels = [
    "Jetwing Blue",
    "Shangri-La Colombo",
    "Cinnamon Grand",
    "Heritance Kandalama",
    "98 Acres Resort",
  ];

  const getSearchResults = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Predefined popular suggestions when search is empty
      return [
        { type: 'location' as const, name: 'Colombo', description: 'Colombo District, Sri Lanka', fillValue: 'Colombo' },
        { type: 'location' as const, name: 'Ella', description: 'Ella, Badulla District, Sri Lanka', fillValue: 'Ella' },
        { type: 'hotel' as const, name: 'Marino Beach Colombo', description: 'Colombo, Colombo District, Sri Lanka', fillValue: 'Marino Beach Colombo' },
        { type: 'hotel' as const, name: 'Heritance Kandalama', description: 'Kandalama, Dambulla, Sri Lanka', fillValue: 'Heritance Kandalama' },
        { type: 'hotel' as const, name: '98 Acres Resort & Spa', description: 'Ella, Badulla District, Sri Lanka', fillValue: '98 Acres Resort & Spa' },
      ];
    }

    const results: { type: 'location' | 'hotel'; name: string; description: string; fillValue: string }[] = [];

    // 1. Match cities/districts
    const cities = Array.from(new Set(ALL_HOTELS.map(h => h.location).filter(Boolean)));
    cities.forEach(city => {
      if (city.toLowerCase().includes(q)) {
        results.push({
          type: 'location',
          name: city,
          description: `${city} District, Sri Lanka`,
          fillValue: city
        });
        results.push({
          type: 'location',
          name: `${city} District`,
          description: 'Sri Lanka',
          fillValue: `${city} District`
        });
      }
    });

    // 2. Match hotels
    ALL_HOTELS.forEach(hotel => {
      if (
        hotel.name.toLowerCase().includes(q) ||
        hotel.location.toLowerCase().includes(q) ||
        hotel.locationDetail.toLowerCase().includes(q)
      ) {
        if (!results.some(r => r.type === 'hotel' && r.name === hotel.name)) {
          results.push({
            type: 'hotel',
            name: hotel.name,
            description: `${hotel.locationDetail}, Sri Lanka`,
            fillValue: hotel.name
          });
        }
      }
    });

    return results.slice(0, 6);
  };

  const searchResults = getSearchResults(destination);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);


  return (
    <div className="relative min-h-[600px] sm:min-h-[700px] w-full flex flex-col items-center justify-center pt-24 pb-16">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auhref=format&fit=crop&w=2070&q=80"
          alt="City Skyline"
          className="w-full h-full object-cover"
        />
        {/* Increased opacity of the overlay layer for higher contrast and better word readability */}
        <div className="absolute inset-0 bg-white/55 dark:bg-slate-950/70 backdrop-blur-[3px]"></div>
        {/* Seamless bottom fade: blends the image completely with the body background color */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white dark:via-transparent dark:to-slate-950"></div>
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="bg-[#4b5563] text-white px-4 py-1.5 rounded-full text-xs font-medium mb-6 inline-flex items-center gap-2 shadow-sm">
          Trusted Sri Lankan Hotel Booking Platform
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-2 xl:whitespace-nowrap">
          Find, Book & Stay at the Best Hotels
        </h1>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4 xl:whitespace-nowrap">
          in Sri Lanka <span className="text-brand">YME Hotels</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium mb-8 max-w-2xl text-center">
          Discover verified hotels, resorts, villas and guest houses across Sri Lanka.
        </p>

        {/* Search Bar - Moved Up (No absolute positioning) */}
        <div ref={searchRef} className="w-full max-w-5xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-full shadow-xl border border-slate-200 dark:border-slate-700 p-2 sm:p-2 relative z-20">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">

            {/* Search Hotel */}
            <div className="relative flex-1">
              <div className="flex items-center px-3 py-2 sm:py-2.5 gap-2 w-full hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-text rounded-full transition-colors border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 relative pr-8">

                <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />

                <div className="flex flex-col flex-1 text-left">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Search
                  </span>

                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowSearchDropdown(true);
                      setOpenDropdown(null);
                    }}
                    onFocus={() => {
                      setShowSearchDropdown(true);
                      setOpenDropdown(null);
                    }}
                    placeholder="Search for a hotel..."
                    className="bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium placeholder-slate-400 w-full text-sm pr-4"
                  />
                </div>
                {destination && (
                  <button
                    type="button"
                    onClick={() => {
                      setDestination('');
                      setShowSearchDropdown(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    searchResults.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setDestination(item.fillValue);
                          setShowSearchDropdown(false);
                        }}
                        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left border-b border-slate-100 dark:border-slate-800/50 last:border-0 transition-colors"
                      >
                        {item.type === 'location' ? (
                          <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                        ) : (
                          <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
                        )}

                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No locations or hotels found matching "{destination}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Check In */}
            <div className="flex-1 flex items-center px-3 py-2 sm:py-2.5 gap-2 w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-full transition-colors border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 relative shrink-0" onClick={() => {
              setOpenDropdown(openDropdown === 'checkIn' ? null : 'checkIn');
              setShowSearchDropdown(false);
            }}>
              <CalendarIcon className="w-5 h-5 text-brand" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Check In</span>
                <span className="text-slate-900 dark:text-white font-medium text-sm">{format(checkIn, 'MMM dd')}</span>
              </div>
              {openDropdown === 'checkIn' && (
                <div className="absolute top-full left-0 mt-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 origin-top-left animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <DayPicker
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => {
                      if (date) {
                        setCheckIn(date);
                        if (isBefore(checkOut, date)) setCheckOut(addDays(date, 1));
                        setOpenDropdown('checkOut');
                      }
                    }}
                    disabled={{ before: startOfToday() }}
                    className="text-sm font-medium border-none"
                  />
                </div>
              )}
            </div>

            {/* Check Out */}
            <div className="flex-1 flex items-center px-3 py-2 sm:py-2.5 gap-2 w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-full transition-colors border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 relative shrink-0" onClick={() => {
              setOpenDropdown(openDropdown === 'checkOut' ? null : 'checkOut');
              setShowSearchDropdown(false);
            }}>
              <CalendarIcon className="w-5 h-5 text-brand" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Check Out</span>
                <span className="text-slate-900 dark:text-white font-medium text-sm">{format(checkOut, 'MMM dd')}</span>
              </div>
              {openDropdown === 'checkOut' && (
                <div className="absolute top-full left-0 md:left-auto md:-translate-x-1/2 mt-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 origin-top animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <DayPicker
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => {
                      if (date) {
                        setCheckOut(date);
                        setOpenDropdown(null);
                      }
                    }}
                    disabled={{ before: addDays(checkIn, 1) }}
                    className="text-sm font-medium border-none"
                  />
                </div>
              )}
            </div>

            {/* Guests & Rooms */}
            <div className="flex-1 flex items-center px-3 py-2 sm:py-2.5 gap-2 w-full sm:w-auto hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer rounded-full transition-colors relative shrink-0" onClick={() => {
              setOpenDropdown(openDropdown === 'guests' ? null : 'guests');
              setShowSearchDropdown(false);
            }}>
              <Users className="w-5 h-5 text-brand" />
              <div className="flex flex-col text-left shrink-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Guests & Rooms</span>
                <span className="text-slate-900 dark:text-white font-medium text-sm whitespace-nowrap">{guests} Guests, {rooms} Rooms</span>
              </div>
              {openDropdown === 'guests' && (
                <div className="absolute top-full right-0 mt-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 w-72 origin-top-right animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-900 dark:text-white">Adults</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Ages 13 or above</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-brand hover:text-brand transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="w-4 text-center font-semibold">{guests}</span>
                        <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-brand hover:text-brand transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <hr className="border-slate-100 dark:border-slate-800" />
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-slate-900 dark:text-white">Rooms</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Required rooms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-brand hover:text-brand transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="w-4 text-center font-semibold">{rooms}</span>
                        <button onClick={() => setRooms(Math.min(5, rooms + 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:border-brand hover:text-brand transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-2 w-full sm:w-auto mt-2 sm:mt-0 relative z-10 pointer-events-auto shrink-0 flex-none">

              <Link href={`/search?dest=${encodeURIComponent(destination)}&checkIn=${format(checkIn, 'yyyy-MM-dd')}&checkOut=${format(checkOut, 'yyyy-MM-dd')}&guests=${guests}&rooms=${rooms}`} className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-6 py-2.5 sm:py-2 rounded-full font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-xl">
          <TrendingCategories />
          <BidInfoAnimation showAddBidButton={true} onBidClick={() => setShowBidModal(true)} />
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request a Trip</h2>
                <p className="text-xs text-slate-500 mt-1">Receive custom offers from hotels in {destination || 'Sri Lanka'}</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleBidSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Destination</label>
                <input
                  type="text" required placeholder="e.g. Kandy, Ella"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={destination} onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Budget / Offer</label>
                <input
                  type="text" required placeholder="e.g. LKR 15,000 per night"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={bidBudget} onChange={(e) => setBidBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Additional Requirements</label>
                <textarea
                  required placeholder="e.g. Need family room for 2 adults & 2 kids, close to city center" rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  value={bidReqs} onChange={(e) => setBidReqs(e.target.value)}
                ></textarea>
              </div>
              <div className="pt-4">
                <button
                  type="submit" disabled={isBidding}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  {isBidding ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TrendingCategories() {
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    const list = getCategories().filter(c => c.id !== 'villas');
    setCategories(list.slice(0, 3).map(c => ({ name: c.name, slug: c.id })));
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center text-sm font-semibold text-brand mr-2">
          <TrendingUp className="w-5 h-5 mr-1.5" /> Trending:
        </div>
        {categories.map(c => (
          <Link key={c.slug} href={`/search?category=${c.slug}`} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:border-brand px-3 py-1 rounded-full text-xs font-medium text-brand transition-all shadow-sm flex items-center gap-1">
            <Star className="w-4 h-4" /> {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, badge }: { title: string, subtitle: string, badge?: string }) {
  return (
    <div className="mb-10 text-center">
      {badge && <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">{badge}</div>}
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
}

function FeaturedHotels() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch('/api/hotels');
        if (res.ok) {
          const data = await res.json();
          // Only take the first 4 latest hotels
          setHotels(data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch featured hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading || hotels.length === 0) return null;

  return (
    <section>
      <SectionHeader badge="Curated Selection" title="Verified and trusted properties" subtitle="Explore our handpicked selection of top-rated hotels curated for excellence." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {hotels.map(h => {
          // Map database fields to UI component requirements
          const hotelData = {
            ...h,
            id: h._id,
            name: h.propertyName || h.name,
            location: h.city || h.location,
            image: h.imageUrl || h.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427",
            price: h.price || 0,
            rating: h.rating || h.stars || 0,
            revs: h.revs || 0
          };

          return (
            <Link href={`/hotel/${generateHotelSlug(hotelData)}`} key={hotelData.id} className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left flex flex-col transition-all">
              <div className="relative h-48 overflow-hidden">
                <img src={hotelData.image} alt={hotelData.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-brand" /> Hotel
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("w-3.5 h-3.5", s <= Math.floor(hotelData.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200")} />)}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1.5">{hotelData.rating} ({hotelData.revs} reviews)</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-brand" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors line-clamp-1">{hotelData.name}</h3>
                <p className="text-sm border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand" /> {hotelData.location}
                </p>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Starting from</p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white">LKR {hotelData.price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 text-center">
        <Link href="/search" className="inline-flex items-center gap-2 text-brand font-medium hover:text-brand-hover">
          View All Hotels <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function BidInfoAnimation({ 
  onDismiss, 
  showAddBidButton = false, 
  onBidClick 
}: { 
  onDismiss?: (e: React.MouseEvent) => void; 
  showAddBidButton?: boolean; 
  onBidClick?: () => void; 
}) {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => { setActiveStep((prev) => (prev + 1) % 3); }, 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={cn(
      "relative overflow-hidden group animate-in slide-in-from-top-4 fade-in duration-500 max-w-xl w-full text-left",
      showAddBidButton 
        ? "bg-transparent border-none p-0" 
        : "border rounded-2xl p-4 mb-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
    )}>
      {onDismiss && (
        <div className="absolute top-0 right-0 p-2">
          <button onClick={onDismiss} type="button" className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 mb-6 justify-center">
        <h3 className="font-bold text-emerald-800 dark:text-emerald-300">How Bidding Works</h3>
      </div>
      <div className="flex justify-between items-center mb-6 px-2">
        <div className={cn("flex flex-col items-center transition-all duration-500", activeStep === 0 ? "scale-110 opacity-100" : "scale-90 opacity-50")}>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors duration-500", activeStep === 0 ? "bg-emerald-600 text-white" : "bg-white dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400")}>
            <Send className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Request</span>
        </div>
        <div className="flex-1 h-0.5 mx-2 bg-slate-200 dark:bg-slate-700 relative rounded-full overflow-hidden">
          <div className={cn("absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000", activeStep >= 1 ? "w-full" : "w-0")} />
        </div>
        <div className={cn("flex flex-col items-center transition-all duration-500", activeStep === 1 ? "scale-110 opacity-100" : "scale-90 opacity-50")}>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors duration-500", activeStep === 1 ? "bg-emerald-600 text-white" : "bg-white dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400")}>
            <BellRing className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Offers</span>
        </div>
        <div className="flex-1 h-0.5 mx-2 bg-slate-200 dark:bg-slate-700 relative rounded-full overflow-hidden">
          <div className={cn("absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000", activeStep >= 2 ? "w-full" : "w-0")} />
        </div>
        <div className={cn("flex flex-col items-center transition-all duration-500", activeStep === 2 ? "scale-110 opacity-100" : "scale-90 opacity-50")}>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors duration-500", activeStep === 2 ? "bg-emerald-600 text-white" : "bg-white dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400")}>
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Book</span>
        </div>
      </div>
      <div className="text-center h-12 flex flex-col justify-center overflow-hidden mb-2">
        {activeStep === 0 && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">1. Tell us your needs</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Set your budget and what you're looking for.</p>
          </div>
        )}
        {activeStep === 1 && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">2. Hotels compete</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Our partners will send you their best custom offers.</p>
          </div>
        )}
        {activeStep === 2 && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">3. You choose the best</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">Pick the offer you like most and enjoy your stay!</p>
          </div>
        )}
      </div>

      {showAddBidButton && onBidClick && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onBidClick}
            type="button"
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Add a Bid
          </button>
        </div>
      )}
    </div>
  );
}

function WhyChooseUs() {
  const [selectedFeature, setSelectedFeature] = useState<{
    title: string;
    desc: string;
    icon: React.ReactNode;
    points: string[];
    detailTitle: string;
    detailText: string;
  } | null>(null);

  const features = [
    {
      title: "Verified Hotels",
      desc: "Every hotel is manually verified to ensure authenticity, giving you peace of mind.",
      icon: <ShieldCheck className="w-6 h-6" />,
      points: ["100% manual physical inspections", "Genuine photos & specifications verified", "Zero ghost listings or fake accounts"],
      detailTitle: "Our Verified Hotels Commitment",
      detailText: "Every hotel listed on our platform undergoes a meticulous manual verification process by our on-ground team in Sri Lanka. We physically visit, inspect active amenities, verify actual room dimensions, and cross-reference licenses. This ensures that the photos, location tags, and listed facilities are 100% authentic, protecting you against online booking scams and bait-and-switch rooms."
    },
    {
      title: "Best Price Guarantee",
      desc: "We ensure you get the best competitive rates available with no hidden fees.",
      icon: <Star className="w-6 h-6" />,
      points: ["Direct hotel wholesale rates", "No third-party booking commission fees", "Instant prize/rebate matching"],
      detailTitle: "Best Price Guarantee Policy",
      detailText: "We forge direct relationships with local resort owners and luxury hotels across Sri Lanka. By completely bypassing high-commission global travel agencies, we capture raw wholesale rates and pass every rupee of savings directly to your wallet. If you discover a cheaper reputable rate for the identical dates, we will instantly match it."
    },
    {
      title: "Instant Booking",
      desc: "Fast and hassle-free. Schedule your stays in real-time instantly.",
      icon: <CalendarIcon className="w-6 h-6" />,
      points: ["Real-time database availability sync", "Immediate secure receipt confirmation", "SMS & Email booking receipt alerts"],
      detailTitle: "Instant Booking Engine",
      detailText: "Our platform's booking engine is linked directly to the front-desk software of our partner hotels. This real-time calendar synchronization ensures zero-delay processing and eliminates frustrating overbooking errors. Your reservation is immediately locked, a digital invoice is processed, and your vacation is secured in less than a second."
    },
    {
      title: "Secure Verification",
      desc: "Your booking requests are verified and confirmed by authorized staff.",
      icon: <ShieldCheck className="w-6 h-6" />,
      points: ["Direct partner hotel verification", "Secure TLS data transmission", "No online credit card required"],
      detailTitle: "Secure Hold & Verification",
      detailText: "Your booking requests are routed securely to authorized hotel operator staff. No sensitive payment information or credit card numbers are collected online. You receive real-time updates and notification status alerts, and you settle your bill directly at the hotel desk upon arrival."
    },
    {
      title: "Verified Reviews",
      desc: "Read genuine feedback from guests who have stayed at the properties.",
      icon: <Heart className="w-6 h-6" />,
      points: ["Only checked-out guest feedback allowed", "Automatic review manipulation filters", "Authentic balanced rating scores"],
      detailTitle: "Checked-Out Guest Reviews Portal",
      detailText: "Our customer rating algorithm relies strictly on checkout validation. Only real travelers who have booked, paid, and successfully checked out of a listed property are granted access to write reviews and rate the amenities. This completely halts competitor down-rating attacks, bot reviews, and sponsored feedback campaigns."
    },
    {
      title: "Local Sri Lankan Support",
      desc: "Our local team is ready to assist you anytime with your bookings.",
      icon: <Users className="w-6 h-6" />,
      points: ["24/7 Sinhala/Tamil/English telephone hotline", "On-the-ground support representative dispatch", "Direct local hotel desk troubleshooting"],
      detailTitle: "On-the-Ground Sri Lankan Customer Excellence",
      detailText: "We are an authentic local agency operating directly out of Colombo. Our customer care hotlines run 24 hours a day, 365 days a year with representatives fluent in Sinhala, Tamil, and English. Whether you need transport coordination, directions during rural drives, or late check-in mediation, we solve problems on the spot."
    },
  ];

  return (
    <section>
      <SectionHeader badge="What We Offer" title="Your Ultimate Toolkit for Local Success" subtitle="Powerful features designed to instantly connect you with Sri Lanka's best hotels." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative pt-12 text-left flex flex-col justify-between">
            <div>
              <div className="absolute -top-6 left-8 w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{f.desc}</p>
              <ul className="space-y-2 mb-6">
                {f.points.map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0"></div> {p}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setSelectedFeature(f)}
              className="text-brand text-sm font-medium hover:text-brand-hover inline-flex items-center gap-1 cursor-pointer w-fit self-start active:scale-95 transition-transform"
            >
              Learn more <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Feature Drill-down Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-sm">
                  {selectedFeature.icon}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  {selectedFeature.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                id="close-feature-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="font-bold text-brand text-sm uppercase tracking-wider">{selectedFeature.detailTitle}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {selectedFeature.detailText}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                <h5 className="font-bold text-slate-800 dark:text-gray-200 text-xs uppercase tracking-wider">Key Highlights Included</h5>
                <ul className="space-y-2.5">
                  {selectedFeature.points.map((p, k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-slate-650 dark:text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0"></div>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedFeature(null)}
                className="bg-brand hover:bg-brand-hover text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors cursor-pointer shadow-md shadow-brand/10"
              >
                Got it, thanks!
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}



function PricingSection() {
  const packages = getSystemPackages();

  const planIcons: Record<string, React.ReactNode> = {
    free: <Gift className="w-6 h-6" />,
    pro: <Zap className="w-6 h-6" />,
    premium: <Crown className="w-6 h-6" />,
  };

  const planStyles: Record<string, {
    gradient: string;
    iconBg: string;
    cardBorder: string;
    ctaBg: string;
    ctaText: string;
    badgeBg: string;
  }> = {
    free: {
      gradient: 'from-slate-400 to-slate-600',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      cardBorder: 'border-slate-200 dark:border-slate-800',
      ctaBg: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
      ctaText: 'text-slate-700 dark:text-slate-200',
      badgeBg: 'bg-slate-100 text-slate-600',
    },
    pro: {
      gradient: 'from-brand to-emerald-500',
      iconBg: 'bg-brand/10 text-brand',
      cardBorder: 'border-brand/30 dark:border-brand/40',
      ctaBg: 'bg-brand hover:bg-brand-hover text-white',
      ctaText: 'text-white',
      badgeBg: 'bg-brand/10 text-brand',
    },
    premium: {
      gradient: 'from-violet-600 to-purple-700',
      iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300',
      cardBorder: 'border-violet-300 dark:border-violet-700 ring-2 ring-violet-200 dark:ring-violet-800',
      ctaBg: 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30',
      ctaText: 'text-white',
      badgeBg: 'bg-violet-100 text-violet-700',
    },
  };

  const activePackages = packages.filter(p => p.status === 'Active');

  return (
    <section id="pricing">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold rounded-full mb-4 uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" /> Subscription Plans
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Simple, Transparent Pricing</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Choose the plan that fits your business. Every new account gets <span className="font-semibold text-violet-600 dark:text-violet-400">1 year of Premium free</span> on sign up.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {activePackages.map((pkg, idx) => {
          const styles = planStyles[pkg.id] || planStyles.free;
          const isHighlighted = pkg.highlighted;

          return (
            <div
              key={pkg.id}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl border flex flex-col h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isHighlighted
                ? styles.cardBorder + ' shadow-xl'
                : styles.cardBorder + ' shadow-sm'
                }`}
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${styles.gradient}`} />

              {/* Highlighted badge ribbon */}
              {isHighlighted && pkg.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-violet-600 to-purple-700 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                    ★ {pkg.badge}
                  </span>
                </div>
              )}

              {!isHighlighted && pkg.badge && (
                <div className="absolute top-4 right-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles.badgeBg}`}>
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${styles.iconBg}`}>
                    {planIcons[pkg.id]}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{pkg.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pkg.maxHotels === Infinity ? 'Unlimited' : `Up to ${pkg.maxHotels}`} hotel{pkg.maxHotels !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {pkg.price === 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">Free</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-slate-400 self-start mt-2">LKR</span>
                      <span className="text-4xl font-black text-slate-900 dark:text-white">{pkg.price.toLocaleString()}</span>
                      <span className="text-slate-400 text-sm">{pkg.billing}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
                  {pkg.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {pkg.features.map((feat, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.id === 'premium' ? 'text-violet-500' :
                        pkg.id === 'pro' ? 'text-brand' : 'text-slate-400'
                        }`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/dashboard"
                  className={`w-full py-3 rounded-xl font-bold text-sm text-center transition-all duration-200 active:scale-[0.98] inline-block ${styles.ctaBg}`}
                >
                  {pkg.price === 0 ? 'Get Started Free' : `Get ${pkg.name}`}
                </Link>

                {pkg.id !== 'free' && (
                  <p className="text-center text-[11px] text-slate-400 mt-3">
                    🎁 New users start with 1-year <strong className="text-violet-600 dark:text-violet-400">Premium free</strong>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PopularDestinations() {
  const dests = [
    { name: "Colombo", count: 320, image: "https://t4.ftcdn.net/jpg/02/26/76/09/360_F_226760954_HnzqHSCZSfd6ml7i3NfcagAxzIlU6uiD.jpg" },
    { name: "Kandy", count: 210, image: "https://www.andbeyond.com/wp-content/uploads/sites/5/kandy-3.jpg" },
    { name: "Galle", count: 180, image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600&auhref=format&fit=crop" },
    { name: "Ella", count: 145, image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auhref=format&fit=crop" },
    { name: "Nuwara Eliya", count: 230, image: "https://media-cdn.tripadvisor.com/media/photo-s/1b/6e/13/c8/nuwara-eliya-city-in.jpg" },
    { name: "Mirissa", count: 110, image: "https://images.unsplash.com/photo-1526761122248-c31c93f8b2b9?q=80&w=600&auhref=format&fit=crop" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Explore Top Destinations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Find hotels in popular cities across the island</p>
        </div>
        <Link href="/search" className="text-brand font-medium text-sm flex items-center gap-1 hover:text-brand-hover">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {dests.map(d => (
          <Link href="/search" key={d.name} className="group relative h-40 rounded-xl overflow-hidden shadow-sm hover:shadow-md">
            <img src={d.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={d.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
              <h4 className="text-white font-bold text-lg drop-shadow-sm">{d.name}</h4>
              <p className="text-brand-light text-xs font-medium">{d.count} properties</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PartnerBanner() {
  return (
    <div className="bg-[#0a1128] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center border border-slate-800">
      <div className="absolute top-0 right-0 w-[500px] h-full opacity-30 select-none pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full text-brand mix-blend-screen mix-blend-color-dodge">
          <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,97.6,-2.4C98.4,13.3,94.1,29.4,85.5,43.2C76.9,56.9,64.1,68.4,49.8,75.9C35.5,83.4,19.7,87,3.1,81.9C-13.5,76.8,-29.3,63,-42.6,50.7C-55.9,38.3,-66.8,27.3,-74.6,13.6C-82.3,-0.2,-86.8,-16.9,-82.6,-31.4C-78.4,-45.8,-65.4,-58,-51.2,-64.9C-36.9,-71.8,-21.4,-73.4,-5.2,-63.9C10.9,-54.3,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="relative z-10 w-full md:w-1/2 text-left md:pr-10 mb-8 md:mb-0">
        <div className="inline-block bg-white/10 dark:bg-slate-900/10 backdrop-blur text-white text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-6">
          Join the Network
        </div>
        <h2 className="text-lg md:text-3xl font-bold text-white mb-6 leading-tight">
          Grow your hotel business with <span className="text-brand">yme.lk</span>
        </h2>
        <p className="text-slate-300 mb-8 text-lg">
          Manage rooms, bookings, pricing and promotions from one powerful dashboard. Join thousands of properties reaching new customers daily.
        </p>
        <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-medium text-slate-300">
          <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand" /> Verified Badge</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand" /> Analytics Dashboard</div>
          <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand" /> Smart Booking</div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 dark:bg-slate-900/20 text-white border border-white/20 px-8 py-3 rounded-full font-semibold transition-colors">
            Learn More
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full md:w-1/2 rounded-2xl overflow-hidden shadow-2xl border border-white/10 hidden md:block">
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auhref=format&fit=crop" className="w-full h-auto object-cover" alt="Hotel Dashboard Preview" />
      </div>
    </div>
  );
}

function FeaturedOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [offersRes, hotelsRes] = await Promise.all([
          fetch('/api/public-offers'),
          fetch('/api/hotels')
        ]);
        if (offersRes.ok && hotelsRes.ok) {
          const offersData = await offersRes.json();
          const hotelsData = await hotelsRes.json();
          setOffers(offersData.slice(0, 4));
          setHotels(hotelsData);
        }
      } catch (err) {
        console.error("Failed to fetch featured offers", err);
      }
    }
    fetchData();
  }, []);

  if (offers.length === 0) return null;

  return (
    <section>
      <SectionHeader badge="Hot Deals" title="Special Offers & Discounts" subtitle="Grab the best deals from our top-rated partners before they expire." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {offers.map((offer) => {
          let hotel = hotels.find(h => h._id === offer.hotelId);
          if (!hotel) hotel = hotels.find(h => h.owner === offer.owner);

          const hotelName = hotel?.propertyName || "Verified Hotel";
          const offerImage = offer.imageUrl || offer.image || hotel?.imageUrl || hotel?.image || "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80";

          return (
            <div
              key={offer._id}
              onClick={() => {
                setSelectedOffer(offer);
                setSelectedHotel(hotel);
              }}
              className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden text-left flex flex-col transition-all cursor-pointer"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={offerImage} alt={hotelName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3 bg-brand text-white font-bold px-2 py-1 rounded-lg text-xs shadow-md">
                  {offer.discount} OFF
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="font-bold text-sm leading-tight drop-shadow-md line-clamp-1">{hotelName}</h3>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 group-hover:text-brand transition-colors line-clamp-2">{offer.title}</h4>
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3.5 h-3.5" /> {offer.ends}</span>
                  <span className="text-brand font-semibold">View Deal</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Link href="/offers" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-6 py-2.5 rounded-full font-semibold transition-colors shadow-sm">
          <Ticket className="w-4 h-4 text-brand" /> View All Offers <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {selectedOffer && (
        <OfferDetailsModal
          offer={selectedOffer}
          hotel={selectedHotel}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </section>
  );
}


import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <Home {...props} />
    </AppLayout>
  );
}
