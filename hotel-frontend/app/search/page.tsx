"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Star, Filter, CheckCircle, Heart, Building2, Plus, Minus, LayoutGrid, List as ListIcon, Moon, Calendar, Users, X, Sparkles, Send, BellRing } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { cn, generateHotelSlug } from '@/lib/utils';
import { format, addDays, startOfToday } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { getFilterGroups, FilterGroup } from '@/lib/adminData';
import { Hotel } from '@/lib/hotelData';
import { useSavedHotels } from '@/lib/useSavedHotels';
import dynamic from 'next/dynamic';
const HotelMap = dynamic(() => import('@/components/Map'), { ssr: false });
import { Map as MapIcon } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

const matchDynamicPriceRange = (hotelPrice: number, rangeStr: string): boolean => {
  const cleanStr = rangeStr.replace(/,/g, '');
  const numbers = cleanStr.match(/\d+/g)?.map(Number);

  if (!numbers || numbers.length === 0) return false;

  if (cleanStr.includes('+')) {
    return hotelPrice >= numbers[0];
  }

  if (numbers.length >= 2) {
    return hotelPrice >= numbers[0] && hotelPrice <= numbers[1];
  }

  if (numbers.length === 1) {
    return hotelPrice <= numbers[0];
  }

  return false;
};

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const destParam = searchParams.get('dest') || '';
  const categoryParam = searchParams.get('category') || '';

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bidding State
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidBudget, setBidBudget] = useState('');
  const [bidReqs, setBidReqs] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [showBidInfo, setShowBidInfo] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSeenBidInfo') !== 'true';
    }
    return false;
  });

  const dismissBidInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowBidInfo(false);
    localStorage.setItem('hasSeenBidInfo', 'true');
  };

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/hotels')
      .then(res => res.json())
      .then(data => {
        const mapped: Hotel[] = data.map((h: any) => ({
          id: h.id || h._id,
          name: h.propertyName || "",
          location: h.city || "",
          locationDetail: `${h.address || ""}, ${h.city || ""}`,
          rating: Number(h.rating) || 0,
          ratingText: Number(h.rating) > 0 ? "Rated" : "Unrated",
          reviewsCount: Math.floor(Math.random() * 100),
          price: Number(h.price) || 0,
          image: h.imageUrl || "",
          type: h.propertyType || "Hotels",
          stars: Number(h.stars) || 0,
          amenities: Array.isArray(h.amenities) ? h.amenities : [],
          description: h.description || "",
          verified: !!h.verified,
          owner: h.owner || ""
        }));

        setHotels(mapped);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const { isSaved, saveHotel } = useSavedHotels();
  const [destination, setDestination] = useState(destParam || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: startOfToday(), to: addDays(startOfToday(), 2) });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<'dates' | 'guests' | null>(null);

  // Filter States
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('Recommended');

  // Dynamic filter list
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [selectedCustomFilters, setSelectedCustomFilters] = useState<Record<string, string[]>>({});
  const [filterLists, setFilterLists] = useState<{
    locations: string[];
    propertyTypes: string[];
    amenities: string[];
  }>({ locations: [], propertyTypes: [], amenities: [] });

  useEffect(() => {
    const groups = getFilterGroups();
    setFilterGroups(groups);

    // Merge DB locations into filter list
    const dbLocs = hotels.map(h => h.location).filter(Boolean);
    const mockLocs = groups.find(g => g.id === 'locations')?.items || [];
    const allLocs = Array.from(new Set([...mockLocs, ...dbLocs]));

    const types = groups.find(g => g.id === 'propertyTypes')?.items || [];
    const ams = groups.find(g => g.id === 'amenities')?.items || [];

    setFilterLists({
      locations: allLocs,
      propertyTypes: types,
      amenities: ams
    });
  }, [hotels]);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (destParam) {
      setDestination(destParam);
    }
  }, [destParam]);

  useEffect(() => {
    if (categoryParam) {
      if (categoryParam === 'villas') {
        setSelectedPropertyTypes(['Villas']);
      } else if (categoryParam === 'beach') {
        setSelectedAmenities(['Beachfront']);
      } else if (categoryParam === 'luxury') {
        setSelectedStars([5]);
      } else if (categoryParam === 'budget') {
        setSelectedPriceRanges(['LKR 10,000 - LKR 20,000', 'LKR 20,000 - LKR 50,000']);
      } else if (categoryParam === 'mountain') {
        const dests = ['Ella', 'Kandy'];
        setSelectedLocations(dests);
      }
    }
  }, [categoryParam]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.name,
          location: destination || "Any Location",
          budget: bidBudget,
          requirements: bidReqs
        })
      });
      if (res.ok) {
        toast.success("Trip request submitted successfully!", { id: toastId });
        setShowBidModal(false);
        router.push('/dashboard/trip-requests');
      } else {
        toast.error("Failed to submit request", { id: toastId });
      }
    } catch (err) {
      toast.error("Error submitting request", { id: toastId });
    } finally {
      setIsBidding(false);
    }
  };

  // Filter Logic
  const filteredHotels = hotels.filter(hotel => {
    // 1. Destination Match
    if (destination.trim()) {
      const q = destination.toLowerCase().trim();
      const matchesQ = (hotel.name?.toLowerCase() || "").includes(q) ||
        (hotel.location?.toLowerCase() || "").includes(q) ||
        (hotel.locationDetail?.toLowerCase() || "").includes(q);
      if (!matchesQ) return false;
    }

    // 2. Location Select Checklist
    if (selectedLocations.length > 0) {
      const hotelLoc = hotel.location?.toLowerCase().trim();
      const anyMatch = selectedLocations.some(sel => sel.toLowerCase().trim() === hotelLoc);
      if (!anyMatch) return false;
    }

    // 3. Price checklist
    if (selectedPriceRanges.length > 0) {
      const matchesPrice = selectedPriceRanges.some(range => {
        if (range === 'LKR 0 - LKR 10,000') return hotel.price >= 0 && hotel.price <= 10000;
        if (range === 'LKR 10,000 - LKR 20,000') return hotel.price > 10000 && hotel.price <= 20000;
        if (range === 'LKR 20,000 - LKR 50,000') return hotel.price > 20000 && hotel.price <= 50000;
        if (range === 'LKR 50,000+') return hotel.price > 50000;
        return matchDynamicPriceRange(hotel.price, range);
      });
      if (!matchesPrice) return false;
    }

    // 4. Star Rating Checklist
    if (selectedStars.length > 0) {
      if (!selectedStars.includes(hotel.stars)) return false;
    }

    // 5. Property Type Checklist
    if (selectedPropertyTypes.length > 0) {
      const hotelType = hotel.type?.toLowerCase().trim();
      const anyType = selectedPropertyTypes.some(t => t.toLowerCase().trim() === hotelType);
      if (!anyType) return false;
    }

    // 6. Amenities Checklist
    if (selectedAmenities.length > 0) {
      const hasAll = selectedAmenities.every(a => hotel.amenities.includes(a));
      if (!hasAll) return false;
    }

    // 7. Custom Dynamic Filters Checklist
    const customGroups = filterGroups.filter(g => !['locations', 'priceRanges', 'propertyTypes', 'amenities'].includes(g.id));
    for (const group of customGroups) {
      const selectedForGroup = selectedCustomFilters[group.id] || [];
      if (selectedForGroup.length > 0) {
        const matchesAny = selectedForGroup.some(item => {
          const itemLower = item.toLowerCase();
          return hotel.name.toLowerCase().includes(itemLower) ||
            hotel.description.toLowerCase().includes(itemLower) ||
            hotel.locationDetail.toLowerCase().includes(itemLower) ||
            hotel.type.toLowerCase().includes(itemLower) ||
            hotel.amenities.some(a => a.toLowerCase().includes(itemLower));
        });
        if (!matchesAny) return false;
      }
    }

    return true;
  });

  // Sorting Logic
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortBy === 'Price: Low to High') {
      return a.price - b.price;
    }
    if (sortBy === 'Price: High to Low') {
      return b.price - a.price;
    }
    if (sortBy === 'Star Rating: Highest First') {
      return b.stars - a.stars;
    }
    return b.rating - a.rating;
  });

  const handleLocationToggle = (loc: string) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const handlePriceToggle = (range: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const handleStarToggle = (star: number) => {
    setSelectedStars(prev =>
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleCustomFilterToggle = (groupId: string, item: string) => {
    setSelectedCustomFilters(prev => {
      const current = prev[groupId] || [];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [groupId]: updated };
    });
  };

  const handleClearAll = () => {
    setSelectedLocations([]);
    setSelectedPriceRanges([]);
    setSelectedStars([]);
    setSelectedPropertyTypes([]);
    setSelectedAmenities([]);
    setSelectedCustomFilters({});
    setDestination('');
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Visual Search Bar - Large rounded container from Image */}
      <div className="mb-12 flex flex-col items-center">
        <div className="w-full max-w-6xl relative">
          <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-full shadow-sm border border-slate-200 dark:border-slate-800 p-2 sm:p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 transition-all">
            {/* Field 1: Destination */}
            <div className="flex-[2] px-4 sm:pl-2 sm:pr-6 py-3 flex items-center gap-2 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700">
              <Search className="w-5 h-5 text-emerald-600" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where are you going?"
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Field 2: Dates */}
            <div className="flex-[2] px-4 sm:px-6 py-3 flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-700 relative">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <input
                type="text"
                value={dateRange?.from ? `${format(dateRange.from, 'LLL dd')} - ${dateRange.to ? format(dateRange.to, 'LLL dd') : ''}` : 'Select dates'}
                readOnly
                onClick={() => setOpenDropdown(openDropdown === 'dates' ? null : 'dates')}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 cursor-pointer"
              />
              {openDropdown === 'dates' && (
                <div className="absolute top-full left-0 sm:left-auto mt-2 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-xl z-50 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white overflow-x-auto max-w-[calc(100vw-2rem)]">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={{ before: startOfToday() }}
                  />
                </div>
              )}
            </div>

            {/* Field 3: Guests */}
            <div className="flex-[2] px-4 py-3 flex items-center gap-2 relative border-b sm:border-b-0 border-slate-100 dark:border-slate-700">
              <Users className="w-5 h-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={`${adults} Adults · ${children} Children · ${rooms} Room`}
                readOnly
                onClick={() => setOpenDropdown(openDropdown === 'guests' ? null : 'guests')}
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
              />
              {openDropdown === 'guests' && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl z-50 border border-slate-100 dark:border-slate-800 w-full sm:w-72 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Adults</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">-</button>
                      <span className="font-bold">{adults}</span>
                      <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Children</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">-</button>
                      <span className="font-bold">{children}</span>
                      <button onClick={() => setChildren(children + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">Rooms</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">-</button>
                      <span className="font-bold">{rooms}</span>
                      <button onClick={() => setRooms(rooms + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:pl-2 sm:pr-1">
              <button
                onClick={() => setShowBidModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl sm:rounded-full font-bold text-sm transition-all shadow-md active:scale-95 whitespace-nowrap text-center"
              >
                Make a Bid
              </button>
              <button
                onClick={() => {
                  toast.success('Searching...');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-2xl sm:rounded-full font-bold text-sm transition-all shadow-md active:scale-95 whitespace-nowrap text-center"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>



      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {destination ? destination : 'All of Sri Lanka'}: <span className="text-emerald-600">{sortedHotels.length}</span> properties found
        </h2>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('map')}
              className={cn("p-2 rounded-lg flex items-center justify-center transition-all gap-1.5", viewMode === 'map' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 shadow-sm font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium')}
            >
              <MapIcon className="w-5 h-5" />
              <span className="text-sm pr-1">Map</span>
            </button>
            <div className="w-px bg-slate-200 dark:bg-slate-700 my-2 mx-1" />
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg flex items-center justify-center transition-all", viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300')}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg flex items-center justify-center transition-all", viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300')}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer shadow-sm transition-all"
          >
            <option>Sort by: Recommended</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Star Rating: Highest First</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Mobile Filter Toggle */}
        <button
          className="lg:hidden flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-full text-sm font-semibold shadow-xs select-none outline-none focus:outline-none focus:ring-0 active:scale-95 transition-all w-fit cursor-pointer mb-2"
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>

        {/* Sidebar Filters */}
        <aside className={cn("w-full lg:w-72 shrink-0 space-y-6", filtersOpen ? "block" : "hidden lg:block")}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex items-center justify-between gap-2 mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm select-none uppercase tracking-tight">Filters</h3>
              <button
                onClick={handleClearAll}
                className="text-xs text-brand font-bold hover:underline border-none outline-none focus:outline-none select-none cursor-pointer p-0 bg-transparent"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {filterGroups.map((group, index) => {
                const isLocation = group.id === 'locations';
                const isPrice = group.id === 'priceRanges';
                const isType = group.id === 'propertyTypes';
                const isAmenity = group.id === 'amenities';
                const isCustom = !isLocation && !isPrice && !isType && !isAmenity;

                let itemsToRender = group.items;
                if (isLocation) itemsToRender = filterLists.locations;

                if (itemsToRender.length === 0) return null;

                return (
                  <div key={group.id} className={index > 0 ? "border-t border-slate-100 dark:border-slate-800 pt-6" : ""}>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 select-none flex items-center gap-2">
                      {isLocation && <MapPin className="w-4 h-4 text-emerald-600" />}
                      {group.name}
                    </h4>
                    <div className={cn("space-y-2", isLocation ? "max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full" : "")}>
                      {itemsToRender.map(item => {
                        let isChecked = false;
                        let toggleFn = () => { };

                        if (isLocation) {
                          isChecked = selectedLocations.some(s => s.toLowerCase() === item.toLowerCase());
                          toggleFn = () => handleLocationToggle(item);
                        } else if (isPrice) {
                          isChecked = selectedPriceRanges.includes(item);
                          toggleFn = () => handlePriceToggle(item);
                        } else if (isType) {
                          isChecked = selectedPropertyTypes.some(t => t.toLowerCase() === item.toLowerCase());
                          toggleFn = () => handleTypeToggle(item);
                        } else if (isAmenity) {
                          isChecked = selectedAmenities.includes(item);
                          toggleFn = () => handleAmenityToggle(item);
                        } else if (isCustom) {
                          isChecked = (selectedCustomFilters[group.id] || []).includes(item);
                          toggleFn = () => handleCustomFilterToggle(group.id, item);
                        }

                        const count = isLocation ? hotels.filter(h => h.location?.toLowerCase().trim() === item.toLowerCase().trim()).length : null;

                        return (
                          <label key={item} className="flex items-center justify-between cursor-pointer group select-none">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={toggleFn}
                                className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                              />
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:hover:text-white transition-colors">{item}</span>
                            </div>
                            {isLocation && count !== null && (
                              <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded transition-all">
                                {count}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Star Rating Filter */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3 select-none flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-600 fill-emerald-600/10" />
                  Star Rating
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(star => {
                    const isChecked = selectedStars.includes(star);
                    const count = hotels.filter(h => h.stars === star).length;

                    return (
                      <label key={star} className="flex items-center justify-between cursor-pointer group select-none">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleStarToggle(star)}
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-slate-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                          />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                            {star} {star === 1 ? 'Star' : 'Stars'}
                            <span className="flex items-center ml-1">
                              {Array.from({ length: star }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </span>
                          </span>
                        </div>
                        {count > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded transition-all">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">

          {isLoading ? (
            <div className={cn("pb-20 px-1", viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6" : "space-y-6")}>
              {[1, 2, 3, 4, 5].map(i => <HotelSkeletonCard key={i} viewMode={viewMode as any} />)}
            </div>
          ) : sortedHotels.length > 0 ? (
            viewMode === 'map' ? (
              <div className="pb-20 px-1">
                <HotelMap hotels={sortedHotels} />
              </div>
            ) : (
              <div className={cn("pb-20 px-1", viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6" : "space-y-6")}>
                {sortedHotels.map((hotel, index) => (
                  <HotelListingCard key={hotel.id || index} hotel={hotel} viewMode={viewMode as any} isSaved={isSaved(hotel.id)} onSave={() => saveHotel(hotel, generateHotelSlug(hotel))} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center shadow-lg">
              <Building2 className="w-20 h-20 text-slate-100 dark:text-slate-800 mb-6" />
              <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">No properties found</p>
              <p className="text-slate-400 dark:text-slate-500 mt-2 max-w-sm font-medium">Reset your filters or try a broader location search.</p>
              <button
                onClick={handleClearAll}
                className="mt-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-4 rounded-full transition-all shadow-xl active:scale-95"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          )}
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
              <button onClick={() => setShowBidModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBidSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kandy, Ella"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Budget / Offer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LKR 15,000 per night"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={bidBudget}
                  onChange={(e) => setBidBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Additional Requirements</label>
                <textarea
                  required
                  placeholder="e.g. Need family room for 2 adults & 2 kids, close to city center"
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  value={bidReqs}
                  onChange={(e) => setBidReqs(e.target.value)}
                ></textarea>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isBidding}
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

function HotelListingCard({ hotel, viewMode = 'list', isSaved, onSave }: { hotel: Hotel; viewMode?: 'list' | 'grid'; isSaved?: boolean; onSave?: () => void; key?: any }) {
  const isSpecial = hotel.isSpecial;

  return (
    <Link href={`/hotel/${generateHotelSlug(hotel)}`} className={cn("block group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex outline-none focus:outline-none", viewMode === 'grid' ? "flex-col h-full" : "flex-col sm:flex-row")}>
      <div className={cn("relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800", viewMode === 'grid' ? "w-full h-40" : "w-full sm:w-64 sm:self-stretch")}>
        <img
          src={hotel.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave?.(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all z-10 shadow-sm"
        >
          <Heart className={cn("w-4 h-4", isSaved ? "fill-rose-500 text-rose-500" : "")} />
        </button>
        {isSpecial && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
            Limited Time Offer
          </div>
        )}
      </div>

      <div className={cn("flex-1 flex flex-col justify-between", viewMode === 'grid' ? "p-4" : "p-4 sm:p-5")}>
        <div>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {hotel.type}
                </span>
                <div className="flex items-center">
                  {Array.from({ length: Math.max(0, Math.floor(Number(hotel.stars) || 0)) }).map((_, s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <h3 className={cn("font-bold text-emerald-700 dark:text-emerald-500 group-hover:text-emerald-800 transition-colors mb-0.5", viewMode === 'grid' ? "text-lg" : "text-lg")}>
                {hotel.name}
              </h3>
              <p className={cn("text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400", viewMode === 'grid' ? "mb-2" : "mb-2")}>
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {hotel.locationDetail} <span className="text-emerald-600 underline cursor-pointer ml-1 hidden sm:inline">Show on map</span>
              </p>
            </div>

            <div className="text-right shrink-0 flex items-start gap-2">
              <div className={cn("flex flex-col items-end mr-2", viewMode === 'grid' ? "hidden" : "hidden sm:flex")}>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{Number(hotel.rating) >= 9 ? 'Exceptional' : 'Superb'}</span>
                <span className="text-[10px] text-slate-500">{hotel.reviewsCount || 2100} reviews</span>
              </div>
              <div className="bg-emerald-600 text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center shadow-sm shrink-0">
                <span className="text-xs">{(Number(hotel.rating) || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className={cn("text-xs text-slate-600 dark:text-slate-400", viewMode === 'grid' ? "line-clamp-2 mb-2" : "line-clamp-1 sm:line-clamp-2 mb-2")}>
            {hotel.description}
          </div>

          <div className={cn("flex flex-wrap gap-1.5", viewMode === 'grid' ? "mb-2" : "mb-2")}>
            {hotel.amenities.slice(0, viewMode === 'grid' ? 2 : 3).map((amenity) => (
              <span key={amenity} className="text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md">{amenity}</span>
            ))}
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" /> Free cancellation
            </span>
          </div>
        </div>

        <div className={cn("flex items-end justify-between", viewMode === 'grid' ? "mt-auto pt-2 border-t border-slate-100 dark:border-slate-800" : "mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50")}>
          <div>
            <p className="text-[10px] text-rose-500 font-bold mb-0.5">Only 2 rooms left!</p>
            <div className={cn("flex gap-1.5", viewMode === 'grid' ? "flex-col items-start gap-0" : "items-baseline")}>
              <span className="text-[10px] text-slate-400 line-through">LKR {(Number(hotel.price) * 1.2).toLocaleString()}</span>
              <span className="text-base sm:text-sm font-bold text-slate-900 dark:text-white">LKR {(Number(hotel.price) || 0).toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">1 night, 2 adults</p>
          </div>

          <button className={cn("bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex flex-col items-center shadow-sm", viewMode === 'grid' ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm")}>
            <span>See availability</span>
            <span className={cn("text-[10px] font-normal", viewMode === 'grid' ? "hidden" : "hidden sm:inline")}>Book Now</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

function HotelSkeletonCard({ viewMode = 'list' }: { viewMode?: 'list' | 'grid'; key?: any }) {
  return (
    <div className={cn("block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex animate-pulse", viewMode === 'grid' ? "flex-col h-full" : "flex-col sm:flex-row")}>
      <div className={cn("relative shrink-0 bg-slate-200 dark:bg-slate-800", viewMode === 'grid' ? "w-full h-40" : "w-full sm:w-64 sm:self-stretch")}>
      </div>
      <div className={cn("flex-1 flex flex-col justify-between", viewMode === 'grid' ? "p-4" : "p-4 sm:p-5")}>
        <div>
          <div className="flex justify-between items-start gap-4 mb-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>

          <div className="space-y-2 mb-4">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          </div>
        </div>
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-1"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

import AppLayout from "@/components/layout/AppLayout";
import { Suspense } from 'react';

export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      }>
        <SearchResults {...props} />
      </Suspense>
    </AppLayout>
  );
}

