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

interface Offer {
  id: string;
  title: string;
  discount: string;
  ends: string;
}

export default function Home() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [hotelsData, offersData] = await Promise.all([
          publicClient.getHotels(),
          publicClient.getPublicOffers(),
        ]);
        setHotels(hotelsData);
        setOffers(offersData);
      } catch (err) {
        console.error("Failed to load home content:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-[#0f172a] text-slate-100 min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-400 tracking-wide">
            Hotels<span className="text-white">YME</span>
          </Link>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <Link href="/search" className="hover:text-teal-400 transition">Search Stays</Link>
            <Link href="/dashboard" className="hover:text-teal-400 transition">Member Dashboard</Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/dashboard" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition">
              Launch Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 bg-gradient-to-b from-slate-900 to-[#0f172a]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-teal-400 font-semibold uppercase tracking-wider text-xs px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            Premium Hospitality Solutions
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mt-6 leading-tight tracking-tight text-white">
            Discover Verified Stays &amp; Real-Time Offers
          </h1>
          <p className="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">
            HotelsYME connects travelers directly with premier properties across Sri Lanka, powered by our next-gen Spring Boot and PostgreSQL backend.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/search" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold px-6 py-3 rounded-xl text-md transition">
              Explore Properties
            </Link>
            <Link href="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl text-md border border-slate-700 transition">
              Manage Hotel Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Slider / Grid */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Active Seasonal Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 relative overflow-hidden">
                <span className="absolute top-4 right-4 bg-teal-500 text-slate-950 text-xs font-extrabold px-2.5 py-1 rounded-full">
                  {offer.discount} OFF
                </span>
                <h3 className="text-lg font-semibold text-white mt-2">{offer.title}</h3>
                <p className="text-slate-400 text-xs mt-4">Ends: {offer.ends}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Properties Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Featured Destinations</h2>
            <p className="text-slate-400 text-sm mt-1">Hand-picked luxury stays with verified rating details.</p>
          </div>
          <Link href="/search" className="text-teal-400 text-sm font-semibold hover:underline">View All &rarr;</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
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
                  <h3 className="text-xl font-bold text-white mt-2 group-hover:text-teal-400 transition">{hotel.propertyName}</h3>
                  <p className="text-slate-400 text-sm mt-1">{hotel.city}</p>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-white font-extrabold text-lg">LKR {hotel.price.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ night</span></span>
                    <Link href={`/hotel/${hotel.id}`} className="bg-slate-800 hover:bg-slate-700 text-teal-400 px-4 py-2 rounded-lg text-xs font-semibold transition">
                      View Stay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} HotelsYME Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}