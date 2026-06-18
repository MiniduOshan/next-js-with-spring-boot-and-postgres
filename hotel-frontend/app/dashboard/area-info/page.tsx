"use client";

import { useState, useEffect } from 'react';
import { MapPin, Utensils, Mountain, TrainFront, Plane, Plus, Trash2, Save, Building2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { toast } from 'sonner';

function AreaInfo() {
    const { user, activeHotel, refreshHotels } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [areaInfo, setAreaInfo] = useState({
        nearbyPlaces: [] as any[],
        restaurants: [] as any[],
        naturalBeauty: [] as any[],
        publicTransit: [] as any[],
        airports: [] as any[]
    });

    const [newItem, setNewItem] = useState({ category: 'nearbyPlaces', name: '', distance: '' });

    useEffect(() => {
        if (!activeHotel?._id) return;
        fetchAreaInfo();
    }, [activeHotel?._id]);

    const fetchAreaInfo = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/hotel-profile", {
                headers: {
                    "X-Owner-Email": user?.email || "",
                    "X-Hotel-Id": activeHotel?._id || ""
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAreaInfo(data.areaInfo || { nearbyPlaces: [], restaurants: [], naturalBeauty: [], publicTransit: [], airports: [] });
            }
        } catch (err) {
            console.error("Error fetching area info:", err);
        } finally {
            setLoading(false);
        }
    };

    const addItem = (category: string) => {
        if (!newItem.name.trim() || !newItem.distance.trim()) {
            toast.error("Please provide both name and distance");
            return;
        }
        setAreaInfo(prev => ({
            ...prev,
            [category]: [...(prev[category as keyof typeof areaInfo] || []), { name: newItem.name, distance: newItem.distance }]
        }));
        setNewItem({ category, name: '', distance: '' });
    };

    const removeItem = (category: string, index: number) => {
        setAreaInfo(prev => ({
            ...prev,
            [category]: prev[category as keyof typeof areaInfo].filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/hotel-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Owner-Email": user?.email || "",
                    "X-Hotel-Id": activeHotel?._id || ""
                },
                body: JSON.stringify({ areaInfo })
            });
            if (res.ok) {
                toast.success("Area information updated successfully");
                await refreshHotels();
            } else {
                toast.error("Failed to save changes");
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
                <Building2 className="w-12 h-12 text-amber-500" />
                <p className="font-bold">No hotel selected. Please select a property from the sidebar to manage its area info.</p>
            </div>
        );
    }

    const categories = [
        { id: 'nearbyPlaces', label: "What's nearby", icon: MapPin },
        { id: 'restaurants', label: "Restaurants & cafes", icon: Utensils },
        { id: 'naturalBeauty', label: "Natural Beauty", icon: Mountain },
        { id: 'publicTransit', label: "Public transit", icon: TrainFront },
        { id: 'airports', label: "Closest Airports", icon: Plane }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hotel Area Info</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage attractions and landmarks near {activeHotel.propertyName}.</p>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-70">
                    <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3 mb-4">
                            <cat.icon className="w-5 h-5 text-brand" />
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">{cat.label}</h3>
                        </div>
                        <div className="space-y-2 mb-4">
                            {(areaInfo[cat.id as keyof typeof areaInfo] || []).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 group">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.distance}</p>
                                    </div>
                                    <button onClick={() => removeItem(cat.id, idx)} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Name" className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900" value={newItem.category === cat.id ? newItem.name : ''} onChange={(e) => setNewItem({ ...newItem, category: cat.id, name: e.target.value })} />
                                <input type="text" placeholder="Distance" className="text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900" value={newItem.category === cat.id ? newItem.distance : ''} onChange={(e) => setNewItem({ ...newItem, category: cat.id, distance: e.target.value })} />
                            </div>
                            <button type="button" onClick={() => addItem(cat.id)} className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-xs font-bold transition-all"><Plus className="w-3.5 h-3.5" /> Add</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <AreaInfo {...props} />
    </DashboardLayout>
  );
}
