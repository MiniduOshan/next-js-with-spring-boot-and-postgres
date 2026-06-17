"use client";

import { useEffect, useState } from "react";
import { partnerClient } from "@/core/api/partnerClient";

interface HotelProfile {
  propertyName: string;
  propertyType: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  imageUrl: string;
  verified: boolean;
  stars: number;
}

export default function PartnerProperty() {
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // Form values
  const [propertyName, setPropertyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await partnerClient.getHotelProfile();
        setProfile(data);
        if (data) {
          setPropertyName(data.propertyName || "");
          setDescription(data.description || "");
          setAddress(data.address || "");
          setCity(data.city || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setImageUrl(data.imageUrl || "");
        }
      } catch (err) {
        console.error("Failed to load partner profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await partnerClient.updateHotelProfile({
        propertyName,
        description,
        address,
        city,
        phone,
        email,
        imageUrl,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  if (loading) {
    return <p className="text-slate-400 animate-pulse">Loading property details...</p>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hotel Property Manager</h1>
          <p className="text-slate-400 text-sm mt-1">Configure listing specifics and description copy.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition">
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Property Name</label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Contact Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Reservations Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Banner Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition">
              Save Specifications
            </button>
            <button type="button" onClick={() => setEditing(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl border border-slate-700 transition">
              Cancel
            </button>
          </div>
        </form>
      ) : profile ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="h-64 bg-slate-800 relative">
            {profile.imageUrl && <img src={profile.imageUrl} alt={profile.propertyName} className="w-full h-full object-cover" />}
            {profile.verified && (
              <span className="absolute top-4 left-4 bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full">
                Active &amp; Verified
              </span>
            )}
          </div>
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white">{profile.propertyName || "Unnamed Listing"}</h2>
              <p className="text-slate-400 text-sm mt-1">{profile.city || "No City set"}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Property Description</h4>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">{profile.description || "No description configured."}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Address</h4>
                <p className="text-white text-sm mt-1">{profile.address || "Not set"}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</h4>
                <p className="text-white text-sm mt-1">{profile.phone || "Not set"}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</h4>
                <p className="text-white text-sm mt-1">{profile.email || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
          <p className="text-slate-400">Could not initialize hotel property listing.</p>
        </div>
      )}
    </div>
  );
}
