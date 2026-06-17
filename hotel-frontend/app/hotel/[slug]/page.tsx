"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";;
import { MapPin, Star, Share, Heart, CheckCircle, Wifi, Car, Coffee, Tv, Wind, Check, X, Calendar, Users, FileText, CheckCircle2, ChevronLeft, ChevronRight, Phone, MessageCircle, Navigation, Plus, Minus, ChevronDown, ChevronUp, Bath, Bed, Trees, Activity, Clock, Shield, Globe, Info, Waves, Utensils, Mountain, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ALL_HOTELS as MOCK_HOTELS, MOCK_ROOMS } from "@/lib/hotelData";
import { cn, generateHotelSlug } from "@/lib/utils";
import { useSavedHotels } from "@/lib/useSavedHotels";
import { useAuth } from "@/components/AuthContext";
import { CustomDateRangePicker } from "@/components/CustomDateRangePicker";

function RoomCard({ room, remaining, hotel, onBook }: { room: any, remaining: number, hotel?: any, onBook: () => void, key?: any }) {
  const image = room.imageUrl || (room.images && room.images[0]) || "https://images.unsplash.com/photo-1590490360182-c33d57733427";

  // Room-level charges take priority over hotel-level charges
  const taxRate = room.taxPercentage > 0 ? room.taxPercentage : (hotel?.taxPercentage || 0);
  const svcCharge = room.serviceCharge > 0 ? room.serviceCharge : (hotel?.serviceCharge || 0);
  const taxAmt = ((Number(room.price) || 0) * taxRate) / 100;
  const basePrice = Number(room.price) || 0;
  const additionalCharges = taxAmt + svcCharge;
  const totalRoomPrice = (Number(room.price) || 0) + additionalCharges;
  const bestPrice = room.bestPrice > 0 ? room.bestPrice : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col md:flex-row hover:shadow-md transition-all group">
      <div className="md:w-64 shrink-0 overflow-hidden relative h-48 md:h-auto">
        <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={room.name} />
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none">
          {room.amenities && room.amenities.slice(0, 3).map((amenity: string, idx: number) => (
            <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {amenity}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{room.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <Users className="w-3 h-3" /> x {room.capacity || 2}
              </span>
              {remaining <= 2 ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-md animate-pulse">
                  Only {remaining} left
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                  {remaining} rooms available
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-[13px] text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Free cancellation
          </div>
          {room.mealTypes && room.mealTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {room.mealTypes.map((meal: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-[13px] text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {meal}
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-slate-400 font-medium">Pay nothing until standard check-in</p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">LKR {basePrice.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={onBook}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 text-[13px]"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
}

const AMENITY_CATEGORIES = [
  { title: "Bathroom", icon: Bath, items: ["Toilet paper", "Towels", "Slippers", "Private bathroom", "Toilet", "Free toiletries", "Hairdryer", "Shower"] },
  { title: "Bedroom", icon: Bed, items: ["Linen", "Wardrobe or closet", "Extra long beds (> 2 metres)", "Alarm clock"] },
  { title: "View", icon: Mountain, items: ["City view", "Garden view", "Ocean view", "Mountain view", "Landmark view"] },
  { title: "Outdoors", icon: Trees, items: ["Outdoor furniture", "Beachfront", "Sun terrace", "Sun loungers", "Private beach area", "Balcony", "Garden", "Patio"] },
  { title: "Kitchen", icon: Utensils, items: ["Electric kettle", "Refrigerator", "Dining table", "Cleaning products"] },
  { title: "Room Amenities", icon: Wind, items: ["Socket near the bed", "Clothes rack", "Drying rack for clothing", "Hypoallergenic", "Soundproofing", "Fan", "Ironing facilities", "Iron"] },
  { title: "Activities", icon: Activity, items: ["Beach", "Water sport facilities on site", "Evening entertainment", "Snorkelling", "Diving", "Canoeing", "Windsurfing", "Fishing"] },
  { title: "Living Area", icon: Tv, items: ["Dining area", "Sofa", "Seating Area", "Desk"] },
  { title: "Media & Technology", icon: Tv, items: ["Flat-screen TV", "Satellite channels", "Telephone", "Radio"] },
  { title: "Food & Drink", icon: Coffee, items: ["Coffee house on site", "Fruits", "Wine/champagne", "Kid meals", "Special diet menus (on request)", "Snack bar", "Breakfast in the room", "Bar", "Restaurant", "Minibar", "Tea/Coffee maker"] },
  { title: "Internet", icon: Wifi, items: ["WiFi is available in all areas and is free of charge."] },
  { title: "Parking", icon: Car, items: ["Free private parking is possible on site (reservation is not needed).", "Accessible parking", "Street parking", "Secured parking"] },
  { title: "Front Desk Services", icon: Clock, items: ["Lockers", "Private check-in/out", "Concierge service", "ATM on site", "Luggage storage", "Tour desk", "Currency exchange", "24-hour front desk"] },
  { title: "Cleaning Services", icon: CheckCircle2, items: ["Daily housekeeping", "Trouser press", "Ironing service", "Dry cleaning", "Laundry"] },
  { title: "Safety & Security", icon: Shield, items: ["Fire extinguishers", "CCTV outside property", "Smoke alarms", "Security alarm", "24-hour security", "Safety deposit box"] },
  { title: "General", icon: Info, items: ["Shuttle service", "Airport shuttle (additional charge)", "Designated smoking area", "Air conditioning", "Tile/marble floor", "Laptop safe", "Car hire", "Fan", "Family rooms", "Non-smoking rooms", "Room service"] },
  { title: "Swimming Pool", icon: Waves, items: ["Open all year", "All ages welcome", "Pool towels", "Pool bar", "Sun loungers", "Infinity pool", "Outdoor pool"] },
  { title: "Spa", icon: Sparkles, items: ["Full body massage", "Spa/wellness packages", "Spa relaxation area", "Steam room", "Spa facilities", "Beauty Services", "Hot tub/Jacuzzi", "Massage", "Spa centre", "Sauna"] },
  { title: "Languages Spoken", icon: Globe, items: ["English", "Sinhala", "Tamil", "Chinese", "French", "German"] }
];

const DEFAULT_MOCK_MEALS = [
  { mealName: "Continental Breakfast", category: "Breakfast", price: 1500 },
  { mealName: "Sri Lankan Rice & Curry", category: "Main Course", price: 2200 },
  { mealName: "Grilled Seafood Platter", category: "Dinner", price: 4500 },
  { mealName: "Fresh Fruit Juice", category: "Beverages", price: 800 },
  { mealName: "Club Sandwich", category: "Snacks", price: 1800 },
];

function HotelDetails() {
  const params = useParams();
  const slug = params.slug as string;;
  const [hotel, setHotel] = useState<any>(null);
  const [hotelRooms, setHotelRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isSaved, saveHotel } = useSavedHotels();
  const hotelIsSaved = hotel ? isSaved(hotel.id) : false;

  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Adults, 0 Children');
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [showCalendar, setShowCalendar] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({});

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  useEffect(() => {
    setCheckStatus('idle');
    setFilteredRooms(hotelRooms);
  }, [checkIn, checkOut, guests, hotelRooms]);

  const [bookingStep, setBookingStep] = useState<'details' | 'success'>('details');

  const [cart, setCart] = useState<{ name: string, price: number, quantity: number, owner: string }[]>([]);

  const { user, awardPoints, redeemPoints } = useAuth();
  const [usePoints, setUsePoints] = useState(false);
  const [showMeals, setShowMeals] = useState(false);

  const displayAmenities = (hotel?.amenities && hotel.amenities.length > 0)
    ? [{ title: "Property Facilities", icon: CheckCircle2, items: hotel.amenities }, ...AMENITY_CATEGORIES.slice(0, 11)]
    : AMENITY_CATEGORIES;

  const mealsToShow = (hotel?.meals && hotel.meals.length > 0) ? hotel.meals : DEFAULT_MOCK_MEALS;

  // Read current loyalty settings from localStorage
  const getLoyaltyActivities = () => {
    try {
      const a = localStorage.getItem('yme_loyalty_activities');
      return a ? JSON.parse(a) : [];
    } catch { return []; }
  };
  const getPointValueLKR = () => {
    try { // This function is already defined in the context, so I'll use it.
      const s = localStorage.getItem('yme_loyalty_settings');
      return s ? (JSON.parse(s).pointValueLKR || 1) : 1;
    } catch { return 1; }
  };
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', title: '', content: '', rating: 5 });
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    const mock = MOCK_HOTELS.find(h => generateHotelSlug(h) === slug);
    if (mock) {
      setHotel(mock);
      setIsVerified(true);
      setHotelRooms(MOCK_ROOMS);
      setFilteredRooms(MOCK_ROOMS);
      setReviews([
        { id: 1, name: "Saman Kumara", country: "Sri Lanka", rating: 5, date: "Jun 01, 2026", title: "Exceptional Service", content: "The service was world class. Highly recommended!" },
        { id: 2, name: "Emma Watson", country: "UK", rating: 4, date: "May 25, 2026", title: "Beautiful Views", content: "Had a great time. The views are incredible." }
      ]);
      setIsLoading(false);
      return;
    }

    fetch(`/api/hotels/byslug/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setHotel(data);
          setIsVerified(data.verified);
          const hotelId = data._id;

          Promise.all([
            fetch(`/api/hotels/${hotelId}/rooms`).then(res => res.json()).catch(() => []),
            fetch(`/api/hotels/${hotelId}/reviews`).then(res => res.json()).catch(() => [])
          ]).then(([rooms, revs]) => {
            if (rooms && !rooms.error) {
              setHotelRooms(rooms);
              setFilteredRooms(rooms);
            }
            if (revs && !revs.error) {
              setReviews(revs.map((r: any) => ({
                id: r._id,
                name: r.guest,
                country: 'Guest',
                rating: r.score,
                date: r.date,
                title: 'Feedback',
                content: r.text
              })));
            }
            setIsLoading(false);
          });
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => setIsLoading(false));
  }, [slug]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Ref for guest selector dropdown
  const guestSelectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (guestSelectorRef.current && !guestSelectorRef.current.contains(event.target as Node)) {
        setShowGuestSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [guestSelectorRef]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2500);
  };

  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates first.");
      return;
    }
    // Update the guests string based on current adults and children
    setGuests(`${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`);

    setShowGuestSelector(false); // Close guest selector after checking availability

    setIsChecking(true);
    setCheckStatus('checking');
    try {
      const params = new URLSearchParams({
        hotelId: (hotel?._id || hotel?.id || '').toString(),
        checkIn,
        checkOut,
      });
      if (cart.length > 0) params.append('roomName', cart[0].name);

      const res = await fetch(`/api/bookings/check-availability?${params.toString()}`);
      const data = await res.json();

      setIsChecking(false);
      if (data.available) {
        setCheckStatus('available');
        if (data.details) {
          const map: Record<string, number> = {};
          data.details.forEach((d: any) => map[d.name] = d.remaining);
          setAvailabilityMap(map);

          // Filter rooms to only show those with remaining availability
          const available = hotelRooms.filter(r => (map[r.name] || 0) > 0);
          setFilteredRooms(available);
        }
        toast.success("Dates are available! You can proceed with booking.");
      } else {
        setCheckStatus('unavailable');
        setFilteredRooms([]);
        toast.error("Sorry, some dates in your selected range are already booked.");
      }
    } catch (err) {
      setIsChecking(false);
      setCheckStatus('idle');
      toast.error("Failed to check availability. Please try again.");
    }
  };

  const handleOpenBooking = (roomName: string, price: number) => {
    const matchedRoom = hotelRooms.find(r => r.name === roomName);
    const matchedPkg = hotel?.packages?.find((p: any) => p.name === roomName);
    const roomOwner = matchedRoom ? matchedRoom.owner : (matchedPkg ? (hotel?.owner || 'partner@yme.lk') : (hotel?.owner || 'partner@yme.lk'));

    // Get the maximum available quantity for this room type
    // Priority: 1. Server-calculated availability for selected dates, 2. Base room qty from DB
    const maxAvailable = (checkStatus === 'available' && availabilityMap[roomName] !== undefined)
      ? availabilityMap[roomName]
      : (matchedRoom ? (matchedRoom.qty || matchedRoom.quantity || 5) : 99);

    setCart(prev => {
      const existing = prev.find(item => item.name === roomName);
      if (existing) {
        if (existing.quantity >= maxAvailable) {
          toast.error(`Only ${maxAvailable} rooms of this type are available.`);
          return prev;
        }
        return prev.map(item => item.name === roomName ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { name: roomName, price, quantity: 1, owner: roomOwner }];
    });

    if (checkStatus !== 'available') {
      setShowCalendar(true);
    }

    if (window.innerWidth < 1024) {
      document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(item => item.name !== name));
  };

  const updateCartQuantity = (name: string, delta: number) => {
    const matchedRoom = hotelRooms.find(r => r.name === name);
    const maxAvailable = (checkStatus === 'available' && availabilityMap[name] !== undefined)
      ? availabilityMap[name]
      : (matchedRoom ? (matchedRoom.qty || matchedRoom.quantity || 5) : 99);

    setCart(prev => prev.map(item => {
      if (item.name === name) {
        const nextQty = item.quantity + delta;
        if (nextQty > maxAvailable) {
          toast.error(`Maximum ${maxAvailable} rooms available for this type.`);
          return item;
        }
        return { ...item, quantity: Math.max(1, nextQty) };
      }
      return item;
    }));
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates first.");
      return;
    }
    if (cart.length === 0) return;
    const toastId = toast.loading("Submitting booking request...");
    try {
      const basePrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const combinedRoomNames = cart.map(item => `${item.name} (x${item.quantity})`).join(", ");
      const mainOwner = cart[0]?.owner || hotel?.owner || "partner@yme.lk";

      const discount = usePoints && user?.points ? user.points * getPointValueLKR() : 0;

      // Per-item charges: room-level takes priority over hotel-level
      let svcCharge = 0;
      let taxAmt = 0;
      cart.forEach(item => {
        const roomData = hotelRooms.find(r => r.name === item.name);
        const itemSvc = (roomData?.serviceCharge > 0 ? roomData.serviceCharge : (hotel?.serviceCharge || 0)) * item.quantity;
        const itemTaxRate = roomData?.taxPercentage > 0 ? roomData.taxPercentage : (hotel?.taxPercentage || 0);
        const itemTax = (item.price * item.quantity * itemTaxRate) / 100;
        svcCharge += itemSvc;
        taxAmt += itemTax;
      });

      const finalPrice = Math.max(0, basePrice + svcCharge + taxAmt - discount);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formData.fullName,
          guestEmail: formData.email,
          hotelId: (hotel?._id || hotel?.id || '').toString(),
          items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
          checkIn: checkIn || new Date().toISOString(),
          checkOut: checkOut || new Date(Date.now() + 86400000).toISOString(),
          amount: `LKR ${finalPrice.toLocaleString()}`,
          serviceCharge: svcCharge,
          taxAmount: taxAmt,
          status: "Pending",
          owner: mainOwner
        })
      });
      if (res.ok) {
        if (usePoints && user?.points) {
          await redeemPoints(user.points, `Booking discount for ${combinedRoomNames}`);
        }
        await awardPoints("make_booking", `booking_${Date.now()}`, `Requested booking for ${combinedRoomNames}`);

        toast.success(`Booking requested successfully! 🎉`, { id: toastId });
        setBookingStep('success');
      } else {
        toast.error("Failed to place booking", { id: toastId });
      }
    } catch (err) {
      toast.error("Error confirming booking", { id: toastId });
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.content) {
      toast.error("Name and review content are required");
      return;
    }

    const toastId = toast.loading("Submitting review...");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest: newReview.name,
          room: hotel?.propertyName || "Property Review",
          score: newReview.rating,
          date: new Date().toLocaleDateString(),
          text: newReview.content,
          owner: hotel?.owner || "partner@yme.lk"
        })
      });

      if (res.ok) {
        const savedReview = await res.json();
        setReviews([
          {
            id: savedReview._id || Date.now(),
            name: savedReview.guest,
            country: 'Guest',
            rating: savedReview.score,
            date: savedReview.date,
            title: 'Feedback',
            content: savedReview.text
          },
          ...reviews
        ]);
        setNewReview({ name: '', title: '', content: '', rating: 5 });
        setShowReviewForm(false);
        await awardPoints("write_review", savedReview._id || `review_${Date.now()}`, `Posted review for ${hotel?.propertyName}`);
        toast.success("Review posted successfully!", { id: toastId });
      } else {
        toast.error("Failed to post review", { id: toastId });
      }
    } catch (err) {
      toast.error("Error posting review", { id: toastId });
    }
  };

  if (isLoading) {
    return <HotelDetailsSkeleton />;
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded leading-none uppercase">Hotel</span>
          <div className="flex items-center">
            {[...Array(Math.max(0, Math.floor(Number(hotel?.stars) || 0)))].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {hotel?.propertyName || hotel?.name || "Loading..."}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
              <Share className="w-4 h-4 text-emerald-600" /> Share
            </button>
            <button onClick={() => { if (hotel) saveHotel(hotel, slug!); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
              <Heart className={cn("w-4 h-4", hotelIsSaved ? "fill-rose-500 text-rose-500" : "text-emerald-600")} /> {hotelIsSaved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => document.getElementById('availability-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"
            >
              Book Now
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-4">
          <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold text-sm">
            <MapPin className="w-4 h-4 text-emerald-600" /> {hotel?.address || hotel?.locationDetail || hotel?.location}
          </p>
          <div className="flex items-center gap-2">
            <a href={`tel:${hotel?.phone || '0706955000'}`} className="flex items-center gap-1.5 bg-[#65a30d] hover:bg-[#4d7c0f] text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm">
              <Phone className="w-4 h-4" /> Call
            </a>
            <a href={`https://wa.me/${(hotel?.whatsapp || '94706955000').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-[#00a884] hover:bg-[#008f6f] text-white px-3 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <button onClick={() => {
              if (hotel?.directionsLink) {
                window.open(hotel.directionsLink, '_blank');
              } else {
                setShowMapModal(true);
              }
            }} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors shadow-sm">
              <Navigation className="w-4 h-4" /> Directions
            </button>
          </div>
        </div>
      </div>

      <div className="">
        <div className="lg:col-span-2 space-y-12">
          {/* Image Gallery */}
          {hotel?.images?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <div className="md:col-span-2 overflow-hidden bg-slate-100 group">
                <img src={hotel?.imageUrl || hotel?.image || hotel?.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Main" />
              </div>
              <div className="hidden md:grid grid-rows-2 gap-3">
                <div className="overflow-hidden bg-slate-100 group">
                  <img src={hotel?.images?.[1] || hotel?.imageUrl || hotel?.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 1" />
                </div>
                <div className="overflow-hidden bg-slate-100 group relative cursor-pointer">
                  <img src={hotel?.images?.[2] || hotel?.imageUrl || hotel?.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 2" />
                  {hotel?.images?.length > 3 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold">+{hotel.images.length - 3} Photos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (!hotel?._id && String(hotel?.id).length < 10) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <div className="md:col-span-2 overflow-hidden bg-slate-100 group">
                <img src={hotel?.image || hotel?.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Main" />
              </div>
              <div className="hidden md:grid grid-rows-2 gap-3">
                <div className="overflow-hidden bg-slate-100 group">
                  <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 1" />
                </div>
                <div className="overflow-hidden bg-slate-100 group relative cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Gallery 2" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold">+45 Photos</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <p className="text-slate-400 font-bold">No images available for this property yet.</p>
            </div>
          )}
          <section>
            <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-3xl font-medium space-y-4">
              <p>{hotel?.description || ((!hotel?._id && String(hotel?.id).length < 10) ? "Experience unparalleled luxury at our beachfront resort in the heart of Colombo. Enjoy breathtaking Indian Ocean views, world-class dining, and rejuvenating spa treatments." : "No description provided yet.")}</p>
              {(!hotel?._id && String(hotel?.id).length < 10) && (
                <p>All rooms are equipped with modern amenities including air conditioning, flat-screen TV, minibar, and a private balcony. Our signature infinity pool offers the perfect spot to watch the famous Sri Lankan sunset. The property also features three diverse restaurants and a state-of-the-art fitness center.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
              Most Popular Facilities
            </h2>

            <div className="flex flex-wrap gap-x-10 gap-y-6">
              {[
                { icon: Wind, label: "Outdoor swimming pool" },
                { icon: Wifi, label: "Free Wifi" },
                { icon: Tv, label: "Family rooms" },
                { icon: Car, label: "Free parking" },
                { icon: Coffee, label: "Restaurant" },
                { icon: Car, label: "Airport shuttle" },
                { icon: Wind, label: "Non-smoking rooms" },
                { icon: Tv, label: "Room service" },
                { icon: Coffee, label: "Tea/Coffee Maker in All Rooms" },
                { icon: Coffee, label: "Excellent Breakfast" },
              ].map((item, i) => {
                const Icon = item.icon;

                return (
                  <div key={i} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Availability</h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand rounded-xl px-4 py-2 transition-all text-left group shadow-sm"
              >
                <Calendar className="w-5 h-5 text-brand shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-1">Check-in</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {checkIn ? format(new Date(checkIn), 'MMM d, yyyy') : 'Select Date'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand rounded-xl px-4 py-2 transition-all text-left group shadow-sm"
              >
                <Calendar className="w-5 h-5 text-brand shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-1">Check-out</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {checkOut ? format(new Date(checkOut), 'MMM d, yyyy') : 'Select Date'}
                  </p>
                </div>
              </button>

              {/* Guests Selector */}
              <div className="relative w-full" ref={guestSelectorRef}>
                <button
                  type="button"
                  onClick={() => setShowGuestSelector(!showGuestSelector)}
                  className="w-full flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand rounded-xl px-4 py-2 transition-all text-left group shadow-sm"
                >
                  <Users className="w-5 h-5 text-brand shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none mb-1">Guests</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {adults} Adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}
                    </p>
                  </div>
                  {showGuestSelector ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {showGuestSelector && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Adults</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-bold text-slate-900 dark:text-white w-6 text-center">{adults}</span>
                        <button type="button" onClick={() => setAdults(adults + 1)} className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Children</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-bold text-slate-900 dark:text-white w-6 text-center">{children}</span>
                        <button type="button" onClick={() => setChildren(children + 1)} className="p-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGuestSelector(false)}
                      className="mt-4 w-full bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckAvailability}
                className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors w-full sm:w-auto"
              >
                Change Search
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
              Room Overview
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* TABLE */}
              <div className="col-span-1 lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                  <table className="w-full text-sm">
                    <thead className="bg-brand text-white whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          Room Type
                        </th>

                        <th className="px-4 py-3 text-center">
                          Guests
                        </th>

                        <th className="px-4 py-3 text-center">
                          Available
                        </th>

                        <th className="px-4 py-3 text-center">
                          Today's Price
                        </th>

                        <th className="px-4 py-3 text-left">
                          Your Choices
                        </th>

                        <th className="px-4 py-3 text-center">
                          Select Rooms
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRooms.map((room, idx) => {
                        const quantity =
                          cart.find(
                            item => item.name === room.name
                          )?.quantity || 0;

                        const maxAvailable =
                          checkStatus === "available" &&
                            availabilityMap[room.name] !== undefined
                            ? availabilityMap[room.name]
                            : room.qty || room.quantity || 5;

                        return (
                          <tr
                            key={room._id || room.name || idx}
                            className="border-b border-slate-200 align-top"
                          >
                            {/* ROOM TYPE */}
                            <td className="p-4">
                              <h3 className="font-bold text-blue-700 text-lg">
                                {room.name}
                              </h3>

                              <div className="mt-3 text-sm space-y-1">
                                <p>25 m²</p>
                                <p>1 Full Bed</p>
                                <p>Free WiFi</p>
                                <p>Air Conditioning</p>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="border px-2 py-1 rounded text-xs">
                                  Balcony
                                </span>

                                <span className="border px-2 py-1 rounded text-xs">
                                  Garden View
                                </span>

                                <span className="border px-2 py-1 rounded text-xs">
                                  Flat TV
                                </span>
                              </div>
                            </td>

                            {/* GUESTS */}
                            <td className="p-4 text-center">
                              <Users className="inline w-4 h-4 mr-1" />
                              x {room.capacity}
                            </td>

                            {/* AVAILABLE */}
                            <td className="p-4 text-center">
                              <span className={cn("text-[11px] font-bold px-2 py-1 rounded-md shadow-sm", maxAvailable <= 2 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50")}>
                                {maxAvailable} left
                              </span>
                            </td>

                            {/* PRICE */}
                            <td className="p-4">
                              <div className="text-xl font-bold">
                                LKR {room.price.toLocaleString()}
                              </div>

                              <div className="text-green-600 text-sm font-semibold">
                                40% OFF
                              </div>

                              <div className="text-xs text-slate-500">
                                + Taxes & Fees
                              </div>
                            </td>

                            {/* CHOICES */}
                            <td className="p-4">
                              <ul className="space-y-2 text-sm">
                                <li className="text-green-600">
                                  ✓ Free Cancellation
                                </li>

                                <li className="text-green-600">
                                  ✓ Breakfast Included
                                </li>

                                <li className="text-green-600">
                                  ✓ No Prepayment
                                </li>

                                <li className="text-green-600">
                                  ✓ No Credit Card Needed
                                </li>
                              </ul>
                            </td>

                            {/* SELECT ROOMS */}
                            <td className="p-4">
                              <select
                                value={quantity}
                                onChange={(e) => {
                                  const newQty = Number(e.target.value);

                                  setCart(prev => {
                                    if (newQty === 0) {
                                      return prev.filter(
                                        item =>
                                          item.name !== room.name
                                      );
                                    }

                                    const existing = prev.find(
                                      item =>
                                        item.name === room.name
                                    );

                                    if (existing) {
                                      return prev.map(item =>
                                        item.name === room.name
                                          ? {
                                            ...item,
                                            quantity: newQty
                                          }
                                          : item
                                      );
                                    }

                                    return [
                                      ...prev,
                                      {
                                        name: room.name,
                                        price: room.price,
                                        quantity: newQty,
                                        owner:
                                          room.owner ||
                                          hotel?.owner ||
                                          "partner@yme.lk"
                                      }
                                    ];
                                  });
                                }}
                                className="w-full border rounded-lg px-3 py-2"
                              >
                                {[...Array(maxAvailable + 1)].map(
                                  (_, i) => (
                                    <option
                                      key={i}
                                      value={i}
                                    >
                                      {i}
                                    </option>
                                  )
                                )}
                              </select>

                              <button
                                onClick={() =>
                                  handleOpenBooking(
                                    room.name,
                                    room.price
                                  )
                                }
                                className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
                              >
                                I'll Reserve
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOOK YOUR STAY PANEL */}
              <div className="col-span-1 lg:col-span-4 xl:col-span-3 order-1 lg:order-2" id="booking-widget">
                <div className="sticky top-24 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-5 sm:p-6 shadow-sm">

                  {bookingStep === 'success' ? (
                    <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Requested!</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        We have sent your request to the property owner. You will be notified once it's confirmed.
                      </p>

                      {user && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-8 flex items-center justify-center gap-2 border border-amber-100 dark:border-amber-800 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300 fill-mode-both">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-amber-800 dark:text-amber-400">You've earned {getPointValueLKR()} loyalty points!</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setBookingStep('details');
                          setCart([]);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm"
                      >
                        Make another booking
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold text-xl mb-1">
                        Book Your Stay
                      </h3>

                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 text-sm mb-3">
                          Your Selection
                        </h4>

                        <div className="space-y-3">
                          {cart.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-start gap-4 pb-2 border-b border-emerald-100 last:border-0"
                            >
                              <div className="flex-1">
                                <p className="font-bold text-xs text-emerald-900">
                                  {item.name}
                                </p>

                                <p className="text-[11px] text-emerald-600">
                                  LKR {item.price.toLocaleString()} per item
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1 border border-emerald-200 shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.name, -1)}
                                    className="p-1 hover:bg-emerald-100 rounded text-emerald-700 transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center text-emerald-900">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQuantity(item.name, 1)}
                                    className="p-1 hover:bg-emerald-100 rounded text-emerald-700 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.name)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                  title="Remove item"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-emerald-100">
                          {cart.length > 0 ? (
                            (() => {
                              const basePrice = cart.reduce(
                                (acc, item) => acc + item.price * item.quantity,
                                0
                              );

                              let totalSvc = 0;
                              let totalTax = 0;

                              cart.forEach(item => {
                                const roomData = hotelRooms.find(
                                  r => r.name === item.name
                                );

                                const itemSvc =
                                  (roomData?.serviceCharge > 0
                                    ? roomData.serviceCharge
                                    : hotel?.serviceCharge || 0) *
                                  item.quantity;

                                const itemTaxRate =
                                  roomData?.taxPercentage > 0
                                    ? roomData.taxPercentage
                                    : hotel?.taxPercentage || 0;

                                const itemTax =
                                  (item.price *
                                    item.quantity *
                                    itemTaxRate) / 100;

                                totalSvc += itemSvc;
                                totalTax += itemTax;
                              });

                              const discount =
                                usePoints && user?.points
                                  ? user.points * getPointValueLKR()
                                  : 0;

                              const total = Math.max(
                                0,
                                basePrice + totalSvc + totalTax - discount
                              );

                              return (
                                <>
                                  <div className="flex justify-between text-sm mb-2">
                                    <span>Subtotal</span>
                                    <span>LKR {basePrice.toLocaleString()}</span>
                                  </div>

                                  {totalSvc > 0 && (
                                    <div className="flex justify-between text-sm mb-2">
                                      <span>Service Charge</span>
                                      <span>LKR {totalSvc.toLocaleString()}</span>
                                    </div>
                                  )}

                                  {totalTax > 0 && (
                                    <div className="flex justify-between text-sm mb-2">
                                      <span>Tax & Charges</span>
                                      <span>LKR {totalTax.toLocaleString()}</span>
                                    </div>
                                  )}

                                  {discount > 0 && (
                                    <div className="flex justify-between text-sm mb-2 text-amber-600 font-semibold">
                                      <span>Loyalty Discount</span>
                                      <span>- LKR {discount.toLocaleString()}</span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center font-bold text-base md:text-lg pt-2 border-t border-emerald-100">
                                    <span className="whitespace-nowrap">Total </span>
                                    <span className="whitespace-nowrap">
                                      LKR {total.toLocaleString()}
                                    </span>
                                  </div>

                                  <div className="mt-4 pt-4 border-t border-emerald-100">
                                    <button
                                      onClick={() => setShowMeals(true)}
                                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                       bg-gradient-to-r from-amber-400 to-yellow-400 
                                       text-white font-semibold text-sm
                                       shadow-md hover:shadow-lg
                                       hover:scale-[1.02] active:scale-[0.98]
                                       transition-all duration-200"
                                    >
                                      <Plus className="w-4 h-4" />
                                      Add Meals
                                    </button>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                                    <div className="bg-amber-100 p-1 rounded-md">
                                      <Star className="w-3 h-3 text-amber-600 fill-amber-600" />
                                    </div>
                                    <span>You will earn {getPointValueLKR()} points with this stay</span>
                                  </div>
                                </>
                              );
                            })()
                          ) : (
                            <div className="text-center py-10 text-slate-500">
                              No room selected
                            </div>
                          )}
                        </div>

                        {/* Loyalty Points Section */}
                        {user && user.points !== undefined && user.points > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="usePoints"
                                checked={usePoints}
                                onChange={(e) => setUsePoints(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                              />
                              <label htmlFor="usePoints" className="text-sm font-bold text-blue-800 dark:text-blue-300 cursor-pointer">
                                Use My Points
                              </label>
                            </div>
                            <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                              {user.points} pts
                            </span>
                          </div>
                        )}
                        {(!user || user.points === undefined || user.points === 0) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Login or earn points to unlock discounts!</p>
                        )}

                        <button
                          onClick={handleConfirmBooking}
                          disabled={cart.length === 0 || !checkIn || !checkOut}
                          className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Confirm Booking
                        </button>

                        {usePoints && user?.points && (
                          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                            Points applied: {user.points} (Save LKR {(user.points * getPointValueLKR()).toLocaleString()})
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {hotel?.packages && hotel.packages.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
                Packages Overview
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="col-span-1 lg:col-span-12">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                    <table className="w-full text-sm">
                      <thead className="bg-brand text-white whitespace-nowrap">
                        <tr>
                          <th className="px-4 py-3 text-left min-w-[150px]">Package Name</th>
                          <th className="px-4 py-3 text-left">Description</th>
                          <th className="px-4 py-3 text-left min-w-[180px]">Features</th>
                          <th className="px-4 py-3 text-center min-w-[120px]">Price</th>
                          <th className="px-4 py-3 text-center">Select Package</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotel.packages.map((pkg: any, idx: number) => (
                          <tr key={idx} className="border-b border-slate-200 align-top">
                            <td className="p-4">
                              <h3 className="font-bold text-blue-700 text-lg">{pkg.name}</h3>
                            </td>
                            <td className="p-4">
                              <p className="text-slate-600 dark:text-slate-400">{pkg.description}</p>
                            </td>
                            <td className="p-4">
                              <ul className="space-y-1.5">
                                {pkg.features?.map((feature: string, j: number) => (
                                  <li key={j} className="flex items-center gap-2 text-emerald-600 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {feature}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="p-4 text-center">
                              <div className="text-xl font-bold">LKR {Number(pkg.price).toLocaleString()}</div>
                            </td>
                            <td className="p-4 text-center">
                              <button onClick={() => handleOpenBooking(pkg.name, pkg.price)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95">Select Package</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Detailed Facilities & Amenities Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">
              Facilities & Amenities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
              {displayAmenities.map((cat, i) => (
                <div key={i} className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-3">
                    <cat.icon className="w-5 h-5 text-slate-900 dark:text-white shrink-0" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                      {cat.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {cat.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {hotel?.rules && hotel.rules.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">House Rules</h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <ul className="space-y-3">
                  {hotel.rules.map((rule: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {hotel?.policies && hotel.policies.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Hotel Policies</h2>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <ul className="space-y-3">
                  {hotel.policies.map((policy: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                      {policy}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Reviews</h2>
                <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded">4.5</span>
              </div>
              {user && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Write a Review
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="font-bold text-slate-900 dark:text-white mb-6">Write Your Review</h3>
                <form onSubmit={handlePostReview} className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={newReview.name}
                      onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating *</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star className={cn("w-7 h-7", (hoveredRating || newReview.rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700")} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder="Share your experience..."
                    rows={4}
                    required
                    value={newReview.content}
                    onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  ></textarea>

                  <div className="flex gap-3">
                    <button type="submit" className="bg-[#a8cd76] hover:bg-[#96b869] text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-sm text-sm">
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold px-6 py-2.5 rounded-lg transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-6">
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0 sm:text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold mb-2">
                        {review.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="sm:text-center">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate sm:w-16">{review.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{review.country || 'Global'}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />)}
                        <span className="text-[10px] text-slate-400 font-medium ml-2">Reviewed on {review.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{review.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{review.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-medium">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </section>
        </div>


      </div >

      {/* Availability Calendar Modal */}
      {
        showCalendar && (
          <CustomDateRangePicker
            onClose={() => setShowCalendar(false)}
            onSelect={(ci, co) => {
              setCheckIn(ci);
              setCheckOut(co);
            }}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
          />
        )
      }

      {/* Meals Selection Modal */}
      {showMeals && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-brand" />
                  Add Meals to Your Stay
                </h3>
                <p className="text-xs text-slate-500 mt-1">Select from the available restaurant menu</p>
              </div>
              <button
                onClick={() => setShowMeals(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {mealsToShow.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mealsToShow.map((meal: any, idx: number) => {
                    const cartItem = cart.find(item => item.name === meal.mealName);
                    const qty = cartItem ? cartItem.quantity : 0;

                    return (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col justify-between group hover:border-brand/30 transition-all">
                        <div className="mb-4">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{meal.mealName}</h4>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded whitespace-nowrap">
                              LKR {meal.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{meal.category || 'Uncategorized'}</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                          {qty > 0 ? (
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm w-full justify-between">
                              <button
                                onClick={() => updateCartQuantity(meal.mealName, -1)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{qty}</span>
                              <button
                                onClick={() => updateCartQuantity(meal.mealName, 1)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenBooking(meal.mealName, meal.price)}
                              className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand hover:text-brand text-slate-600 dark:text-slate-300 font-bold py-2 rounded-xl text-xs transition-all shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Meal
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No meals listed for this property.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowMeals(false)}
                className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-brand/20 transition-all active:scale-95 text-sm"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {
        showMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[80vh] rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10">
              <button
                onClick={() => setShowMapModal(false)}
                className="absolute top-8 right-8 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white shadow-2xl hover:scale-110 active:scale-90 transition-all border border-slate-100 dark:border-slate-800"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute top-8 left-8 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm hidden sm:block">
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tighter mb-2">{hotel?.propertyName || hotel?.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" /> {hotel?.address || hotel?.locationDetail}
                </p>
              </div>

              <iframe
                title="Hotel Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel?.address || hotel?.locationDetail || hotel?.name || "")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="grayscale-[0.2] contrast-[1.1]"
              />
            </div>
          </div>
        )
      }
    </div >
  );
}

function HotelDetailsSkeleton() {
  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-8">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-4"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
          <div className="flex gap-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
        <div className="lg:col-span-2 space-y-12">
          <div className="h-[400px] md:h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}


import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <HotelDetails {...props} />
    </AppLayout>
  );
}
