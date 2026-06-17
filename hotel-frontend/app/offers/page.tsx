"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";;
import { Tag, MapPin, Calendar, ArrowRight, Building2, Ticket } from 'lucide-react';
import { generateHotelSlug } from "@/lib/utils";
import { toast } from 'sonner';
import OfferDetailsModal from "@/components/OfferDetailsModal";

interface Offer {
  _id: string;
  title: string;
  discount: string;
  ends: string;
  roomTypes: string[];
  packageTypes: string[];
  appliesTo: string;
  owner: string;
  hotelId: string;
  imageUrl?: string;
  image?: string;
}

interface Hotel {
  _id: string;
  propertyName: string;
  city: string;
  imageUrl: string;
  owner: string;
  slug?: string;
}

function PublicOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfferData, setSelectedOfferData] = useState<{ offer: Offer, hotel: Hotel | null } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [offersRes, hotelsRes] = await Promise.all([
          fetch('/api/public-offers'),
          fetch('/api/hotels')
        ]);

        if (offersRes.ok && hotelsRes.ok) {
          const offersData = await offersRes.json();
          const hotelsData = await hotelsRes.json();
          setOffers(offersData);
          setHotels(hotelsData);
        } else {
          toast.error("Failed to load offers");
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getHotelForOffer = (offer: Offer) => {
    if (offer.hotelId) {
      return hotels.find(h => h._id === offer.hotelId);
    }
    return hotels.find(h => h.owner === offer.owner);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand/10 text-brand rounded-2xl mb-6 shadow-sm">
            <Ticket className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            Exclusive <span className="text-brand">Offers & Deals</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Discover massive discounts and special packages from verified hotels across Sri Lanka.
          </p>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Tag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No active offers right now</h3>
            <p className="text-slate-500">Check back later for exciting new deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => {
              const hotel = getHotelForOffer(offer);
              const hotelName = hotel?.propertyName || "Verified Partner Hotel";
              const hotelSlug = hotel ? generateHotelSlug({ id: hotel._id, name: hotel.propertyName, location: hotel.city }) : '';
              const offerImage = offer.imageUrl || offer.image || hotel?.imageUrl || hotel?.image || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80";

              return (
                <div key={offer._id} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                  {/* Image Header */}
                  <div className="h-48 relative overflow-hidden">
                    <img src={offerImage} alt={hotelName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 bg-brand text-white font-black px-3 py-1.5 rounded-xl shadow-lg transform rotate-3 scale-110">
                      {offer.discount} OFF
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <div className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {hotel?.city || "Sri Lanka"}
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 drop-shadow-md">
                        {hotelName}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand transition-colors">
                      {offer.title}
                    </h4>

                    <div className="space-y-3 mb-6 flex-1">
                      {offer.appliesTo && (
                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Tag className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Applies to:</span> {offer.appliesTo}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                        <span><span className="font-semibold text-slate-700 dark:text-slate-300">Ends:</span> {offer.ends}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => setSelectedOfferData({ offer, hotel: hotel || null })}
                      className="w-full py-3 bg-slate-100 hover:bg-brand hover:text-white dark:bg-slate-800 dark:hover:bg-brand text-slate-900 dark:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      View & Claim Offer <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {selectedOfferData && (
        <OfferDetailsModal
          offer={selectedOfferData.offer}
          hotel={selectedOfferData.hotel}
          onClose={() => setSelectedOfferData(null)}
        />
      )}
    </div>
  );
}


import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <PublicOffers {...props} />
    </AppLayout>
  );
}
