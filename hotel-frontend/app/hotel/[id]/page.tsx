"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { publicClient } from "@/core/api/publicClient";

interface Room {
  id: string;
  name: string;
  capacity: number;
  price: number;
  qty: number;
  imageUrl: string;
  amenities: string[];
}

interface Hotel {
  id: string;
  propertyName: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  imageUrl: string;
  stars: number;
  verified: boolean;
}

export default function HotelDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    async function loadDetails() {
      try {
        const [hotelData, roomsData] = await Promise.all([
          publicClient.getHotelById(id),
          publicClient.getHotelRooms(id),
        ]);
        setHotel(hotelData);
        setRooms(roomsData);
      } catch (err) {
        console.error("Failed to load hotel info:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !selectedRoom) {
      setAvailabilityMessage("Please fill in check-in, check-out dates and select a room.");
      return;
    }

    try {
      const checkResult = await publicClient.checkAvailability({
        hotelId: id,
        roomName: selectedRoom,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
      });

      if (checkResult.available) {
        setAvailabilityMessage("Room is Available! Proceed to checkout in dashboard.");
      } else {
        setAvailabilityMessage("Selected room is not available for these dates.");
      }
    } catch (err) {
      setAvailabilityMessage("Could not check availability. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex items-center justify-center">
        <p className="animate-pulse">Loading property specifications...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <p>Hotel Profile not found.</p>
        <Link href="/" className="text-teal-400 underline">Back Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] text-slate-100 min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-teal-400">
            Hotels<span className="text-white">YME</span>
          </Link>
          <Link href="/search" className="text-slate-400 hover:text-white transition text-sm">Back to Search</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Section: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl overflow-hidden h-[450px] bg-slate-800 relative">
            {hotel.imageUrl && <img src={hotel.imageUrl} alt={hotel.propertyName} className="w-full h-full object-cover" />}
            {hotel.verified && (
              <span className="absolute top-6 left-6 bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full">
                Verified Hotel
              </span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">{hotel.propertyName}</h1>
            <p className="text-slate-400 mt-2">{hotel.address}, {hotel.city}</p>
            <div className="flex items-center gap-2 mt-4">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
            </div>
          </div>
          <hr className="border-slate-800" />
          <div>
            <h2 className="text-2xl font-bold text-white">Description</h2>
            <p className="text-slate-300 mt-4 leading-relaxed">{hotel.description || "No description provided."}</p>
          </div>

          {/* Rooms Grid */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Available Inventory Types</h2>
            <div className="space-y-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                    {room.imageUrl && <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{room.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">Capacity: {room.capacity} Guests</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {room.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md">{amenity}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <span className="text-xl font-extrabold text-white">LKR {room.price.toLocaleString()} <span className="text-slate-500 text-xs font-normal">/ night</span></span>
                    <span className="text-xs text-teal-400 font-semibold">{room.qty} rooms left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Availability Form */}
        <div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6">Check Availability</h3>
            <form onSubmit={handleCheckAvailability} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Check-In</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Check-Out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Room Type</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
                >
                  <option value="">Select a Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>{room.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold py-4 rounded-xl mt-6 transition">
                Check Dates
              </button>
            </form>

            {availabilityMessage && (
              <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-xl text-sm text-center font-medium text-teal-400">
                {availabilityMessage}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
