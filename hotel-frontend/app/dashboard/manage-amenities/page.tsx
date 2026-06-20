"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, Save, Star, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

// Keep the same categories as the public page for reference
const AMENITY_CATEGORIES = [
  { title: "Bathroom", items: ["Toilet paper", "Towels", "Slippers", "Private bathroom", "Toilet", "Free toiletries", "Hairdryer", "Shower"] },
  { title: "Bedroom", items: ["Linen", "Wardrobe or closet", "Extra long beds (> 2 metres)", "Alarm clock"] },
  { title: "View", items: ["City view", "Garden view", "Ocean view", "Mountain view", "Pool view"] },
  { title: "Outdoors", items: ["Outdoor furniture", "Beachfront", "Sun terrace", "Sun loungers", "Private beach area", "Balcony", "Terrace", "Garden"] },
  { title: "Kitchen", items: ["Electric kettle", "Refrigerator", "Dining table", "Cleaning products"] },
  { title: "Room Amenities", items: ["Socket near the bed", "Clothes rack"] },
  { title: "Living Area", items: ["Seating Area", "Desk"] },
  { title: "Media & Technology", items: ["Flat-screen TV", "Satellite channels", "Telephone", "TV"] },
  { title: "Food & Drink", items: ["Kid meals", "Special diet menus (on request)", "Breakfast in the room", "Bar", "Restaurant", "Minibar", "Tea/Coffee maker"] },
  { title: "Internet", items: ["WiFi is available in all areas and is free of charge."] },
  { title: "Parking", items: ["Free private parking is possible on site (reservation is not needed).", "Valet parking", "Secured parking"] }
];

function ManageAmenities() {
    const { user, activeHotel, refreshHotels } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // We store the user's selected amenities in a structure matching AMENITY_CATEGORIES
    const [selectedAmenities, setSelectedAmenities] = useState<Record<string, string[]>>({});
    const [newCategory, setNewCategory] = useState("");
    const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!activeHotel?._id && !activeHotel?.id) return;
        fetchAmenities();
    }, [activeHotel]);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const hotelId = activeHotel?._id || activeHotel?.id;
            const res = await fetch(`/api/hotel-profile`, {
                headers: {
                    "X-Owner-Email": user?.email || "",
                    "X-Hotel-Id": hotelId || ""
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.detailedAmenities && data.detailedAmenities !== "{}") {
                    try {
                        setSelectedAmenities(JSON.parse(data.detailedAmenities));
                    } catch (e) {
                        setSelectedAmenities({});
                    }
                } else {
                    setSelectedAmenities({});
                }
            }
        } catch (err) {
            console.error("Error fetching amenities:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (categoryTitle: string, item: string) => {
        setSelectedAmenities(prev => {
            const currentCatItems = prev[categoryTitle] || [];
            if (currentCatItems.includes(item)) {
                return {
                    ...prev,
                    [categoryTitle]: currentCatItems.filter(i => i !== item)
                };
            } else {
                return {
                    ...prev,
                    [categoryTitle]: [...currentCatItems, item]
                };
            }
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const hotelId = activeHotel?._id || activeHotel?.id;
            const res = await fetch("/api/hotel-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Owner-Email": user?.email || "",
                    "X-Hotel-Id": hotelId || ""
                },
                body: JSON.stringify({
                    id: hotelId,
                    detailedAmenities: JSON.stringify(selectedAmenities)
                })
            });
            if (res.ok) {
                toast.success("Detailed Amenities saved successfully");
                await refreshHotels();
            } else {
                toast.error("Failed to save amenities");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    if (!activeHotel) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 rounded-2xl p-8 text-center flex flex-col items-center gap-4">
                <AlertCircle className="w-12 h-12 text-amber-500" />
                <p className="font-bold">No hotel selected. Please select a property from the sidebar to manage its amenities.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading amenities...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/hotel" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Hotel
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Detailed Facilities & Amenities</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select the amenities and facilities your property offers, or add custom ones.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from(new Set([...AMENITY_CATEGORIES.map(c => c.title), ...Object.keys(selectedAmenities)])).map((catTitle, i) => {
                    const defaultCat = AMENITY_CATEGORIES.find(c => c.title === catTitle);
                    const defaultItems = defaultCat ? defaultCat.items : [];
                    const selectedItems = selectedAmenities[catTitle] || [];
                    const allItemsForCat = Array.from(new Set([...defaultItems, ...selectedItems]));

                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">
                                    {catTitle}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {allItemsForCat.map((item, j) => {
                                    const isSelected = selectedItems.includes(item);
                                    return (
                                        <label key={j} onClick={() => toggleAmenity(catTitle, item)} className="flex items-start gap-3 cursor-pointer group">
                                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-emerald-500'}`}>
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </div>
                                            <span className={`text-sm select-none ${isSelected ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {item}
                                            </span>
                                        </label>
                                    );
                                })}
                                <div className="col-span-1 sm:col-span-2 pt-2 flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Add custom item..." 
                                        value={newItemInputs[catTitle] || ""}
                                        onChange={(e) => setNewItemInputs(prev => ({ ...prev, [catTitle]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = newItemInputs[catTitle];
                                                if (val && val.trim()) {
                                                    if (!selectedItems.includes(val.trim())) toggleAmenity(catTitle, val.trim());
                                                    setNewItemInputs(prev => ({ ...prev, [catTitle]: "" }));
                                                }
                                            }
                                        }}
                                        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            const val = newItemInputs[catTitle];
                                            if (val && val.trim()) {
                                                if (!selectedItems.includes(val.trim())) toggleAmenity(catTitle, val.trim());
                                                setNewItemInputs(prev => ({ ...prev, [catTitle]: "" }));
                                            }
                                        }}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Add Custom Category Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Create Custom Category</h3>
                        <p className="text-xs text-slate-500 mt-1">Add a new amenity group.</p>
                    </div>
                    <div className="flex gap-2 w-full max-w-xs">
                        <input 
                            type="text" 
                            placeholder="Category Name" 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newCategory.trim() && !selectedAmenities[newCategory.trim()]) {
                                        setSelectedAmenities(prev => ({ ...prev, [newCategory.trim()]: [] }));
                                        setNewCategory("");
                                    }
                                }
                            }}
                            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        />
                        <button 
                            type="button"
                            onClick={() => {
                                if (newCategory.trim() && !selectedAmenities[newCategory.trim()]) {
                                    setSelectedAmenities(prev => ({ ...prev, [newCategory.trim()]: [] }));
                                    setNewCategory("");
                                }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <ManageAmenities {...props} />
    </DashboardLayout>
  );
}
