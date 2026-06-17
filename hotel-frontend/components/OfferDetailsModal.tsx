"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, CheckCircle2, User, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface OfferDetailsModalProps {
  offer: any;
  hotel: any;
  onClose: () => void;
}

export default function OfferDetailsModal({ offer, hotel, onClose }: OfferDetailsModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Reset status when dates change
  useEffect(() => {
    setCheckStatus('idle');
  }, [checkIn, checkOut]);

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates first.");
      return;
    }
    setCheckStatus('checking');
    try {
      const hotelId = hotel?._id || offer.hotelId;
      const params = new URLSearchParams({
        hotelId: hotelId || '',
        checkIn,
        checkOut,
      });

      const res = await fetch(`/api/bookings/check-availability?${params.toString()}`);
      const data = await res.json();

      if (data.available) {
        setCheckStatus('available');
        toast.success("Dates are available! You can now claim the offer.");
      } else {
        setCheckStatus('unavailable');
        toast.error("Sorry, these dates are already booked.");
      }
    } catch (err) {
      setCheckStatus('idle');
      toast.error("Failed to check availability. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates first.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Sending offer claim request...");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          guestEmail: email,
          roomName: `Claiming Offer: ${offer.title}`,
          checkIn,
          checkOut,
          amount: "Pending Discount",
          serviceCharge: 0,
          taxAmount: 0,
          status: "Pending",
          owner: hotel?.owner || offer.owner || "partner@yme.lk"
        })
      });

      if (res.ok) {
        toast.success("Offer claimed successfully! The hotel will contact you shortly to confirm the discounted price.", { id: toastId });
        onClose();
      } else {
        toast.error("Failed to claim offer. Please try again.", { id: toastId });
      }
    } catch (err) {
      toast.error("An error occurred.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const hotelName = hotel?.propertyName || "Verified Hotel";
  const displayImage = offer.imageUrl || offer.image || hotel?.imageUrl || hotel?.image || "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Offer Details */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 overflow-y-auto">
          <div className="h-48 relative shrink-0">
            <img src={displayImage} alt={hotelName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <button
              onClick={onClose}
              className="md:hidden absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="bg-brand text-white text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg mb-2 inline-block">
                {offer.discount} OFF
              </span>
              <h2 className="text-xl font-bold text-white line-clamp-2 leading-tight">{offer.title}</h2>
              <p className="text-white/80 text-sm">{hotelName}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Offer Details</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Ends:</strong> {offer.ends}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong className="text-slate-900 dark:text-white">Applies To:</strong> {offer.appliesTo || 'All Bookings'}</span>
              </div>
            </div>

            {offer.roomTypes && offer.roomTypes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Valid Room Types</h3>
                <div className="flex flex-wrap gap-2">
                  {offer.roomTypes.map((rt: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand" /> {rt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {offer.packageTypes && offer.packageTypes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Valid Packages</h3>
                <div className="flex flex-wrap gap-2">
                  {offer.packageTypes.map((pt: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" /> {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {hotel?.rules && hotel.rules.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">House Rules</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <ul className="space-y-2">
                    {hotel.rules.map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-y-auto relative">
          <button
            onClick={onClose}
            className="hidden md:flex absolute top-4 right-4 w-8 h-8 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Claim this Offer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Submit your details below and the hotel will contact you with the confirmed discounted price.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!user ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Applying as <span className="font-bold text-slate-900 dark:text-white">{user.name}</span> ({user.email})
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Check-in</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">Check-out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={submitting || !checkIn || !checkOut}
                  className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Sending Request..." : "Apply & Claim Offer"}
                </button>

                <button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checkStatus === 'checking' || !checkIn || !checkOut}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-2 rounded-xl text-xs transition-all hover:bg-slate-200 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {checkStatus === 'checking' ? "Checking..." : "Optional: Check Live Availability"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
