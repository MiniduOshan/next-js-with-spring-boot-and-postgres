"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicClient } from "@/core/api/publicClient";

interface Hotel {
  id: string;
  propertyName: string;
  propertyType: string;
  city: string;
  imageUrl: string;
  price: number;
  stars: number;
  verified: boolean;
}

export default function SearchPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  useEffect(() => {
    async function loadHotels() {
      try {
        const data = await publicClient.getHotels();
        setHotels(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to load hotels:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHotels();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let result = hotels;
    if (searchQuery) {
      result = result.filter(h =>
        h.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (cityFilter !== "All") {
      result = result.filter(h => h.city.equalsIgnoreCase ? h.city.toLowerCase() === cityFilter.toLowerCase() : h.city.toLowerCase() === cityFilter.toLowerCase());
    }
    setFiltered(result);
  };

  const cities = ["All", ...Array.from(new Set(hotels.map(h => h.city)))];

  return (
    <div className="bg-[#0f172a] text-slate-100 min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-400">
            Hotels<span className="text-white">YME</span>
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white transition text-sm">Back Home</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-extrabold text-white">Find Your Perfect Stay</h1>
        
        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="mt-8 flex flex-col md:flex-row gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Where are you going?</label>
            <input
              type="text"
              placeholder="e.g. Colombo, Galle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Filter by City</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
            >
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-8 py-3 rounded-xl self-end mt-4 md:mt-0 transition">
            Search
          </button>
        </form>

        {/* Results */}
        <div className="mt-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-lg">No properties found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filtered.map((hotel) => (
                <div key={hotel.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition group">
                  <div className="h-48 bg-slate-800 relative">
                    {hotel.imageUrl && (
                      <img src={hotel.imageUrl} alt={hotel.propertyName} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    )}
                    {hotel.verified && (
                      <span className="absolute top-4 left-4 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider">{hotel.propertyType}</span>
                    <h3 className="text-xl font-bold text-white mt-2">{hotel.propertyName}</h3>
                    <p className="text-slate-400 text-sm mt-1">{hotel.city}</p>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-white font-extrabold text-lg">LKR {hotel.price.toLocaleString()}</span>
                      <Link href={`/hotel/${hotel.id}`} className="bg-slate-800 hover:bg-slate-700 text-teal-400 px-4 py-2 rounded-lg text-xs font-semibold transition">
                        View Stay
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
