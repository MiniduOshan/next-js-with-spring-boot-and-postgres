"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

export default function PackagesManagement() {
  const { user, activeHotel } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [newPackage, setNewPackage] = useState({ name: "", description: "", price: "", feature: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = { "X-Owner-Email": user?.email || "" };
      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }
      const res = await fetch("/api/hotel-profile", { headers });
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error("Error loading hotel profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.email, activeHotel?._id]);

  const handleSave = async (updatedPackages: any[]) => {
    setIsSaving(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Owner-Email": user?.email || ""
      };
      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      const res = await fetch("/api/hotel-profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({ packages: updatedPackages }),
      });
      if (res.ok) {
        toast.success("Packages updated successfully");
        setPackages(updatedPackages);
      } else {
        toast.error("Failed to update packages");
      }
    } catch (err) {
      console.error("Error updating packages:", err);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPackage = () => {
    if (newPackage.name && newPackage.price) {
      const pkg = {
        name: newPackage.name,
        description: newPackage.description,
        price: Number(newPackage.price),
        features: newPackage.feature.split(',').map(f => f.trim()).filter(f => f)
      };
      const updated = [...packages, pkg];
      setNewPackage({ name: "", description: "", price: "", feature: "" });
      handleSave(updated);
    } else {
      toast.error("Please provide at least a name and price");
    }
  };

  const handleDeletePackage = (idx: number) => {
    const updated = packages.filter((_, i) => i !== idx);
    handleSave(updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-sm font-bold text-slate-900 dark:text-white">Package Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Create and manage special packages and offers for your guests.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand" />
          Add New Package
        </h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              value={newPackage.name} 
              onChange={e => setNewPackage({...newPackage, name: e.target.value})} 
              placeholder="Package Name (e.g. Honeymoon)" 
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white" 
            />
            <input 
              type="number" 
              value={newPackage.price} 
              onChange={e => setNewPackage({...newPackage, price: e.target.value})} 
              placeholder="Price (LKR)" 
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white" 
            />
          </div>
          <input 
            type="text" 
            value={newPackage.description} 
            onChange={e => setNewPackage({...newPackage, description: e.target.value})} 
            placeholder="Description" 
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white" 
          />
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newPackage.feature} 
              onChange={e => setNewPackage({...newPackage, feature: e.target.value})} 
              placeholder="Features (comma separated, e.g. Breakfast included, Spa session)" 
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white" 
            />
            <button 
              type="button" 
              disabled={isSaving}
              onClick={handleAddPackage} 
              className="bg-brand text-white px-3 py-1.5 rounded-xl font-medium hover:bg-brand-hover shrink-0 flex items-center gap-2 disabled:opacity-70"
            >
              <Plus className="w-4 h-4" /> Add Package
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active Packages</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No packages available. Create one above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {packages.map((pkg, idx) => (
              <div key={idx} className="p-4 relative group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <button 
                  type="button" 
                  onClick={() => handleDeletePackage(idx)} 
                  className="absolute top-6 right-6 text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="pr-12">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-3">
                    {pkg.name} 
                    <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded text-sm font-bold">LKR {pkg.price.toLocaleString()}</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 mb-4">{pkg.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {pkg.features.map((f: string, i: number) => (
                      <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
