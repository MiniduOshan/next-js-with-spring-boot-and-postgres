"use client";

import { Plus, Edit, Trash2, CheckCircle2, X, Image as ImageIcon, Upload, ArrowLeft } from 'lucide-react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { parseISO } from 'date-fns';
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

const AVAILABLE_AMENITIES = ["AC", "WiFi", "Hot Water", "Balcony", "Sea View", "Pool Access", "Breakfast Included", "TV", "Mini Bar", "Room Service"];

function RoomsManagement() {
  const { user, activeHotel, activeRole } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formQty, setFormQty] = useState<number | "">("");
  const [formCapacity, setFormCapacity] = useState<number>(2);
  const [formUnavailableDates, setFormUnavailableDates] = useState<Date[]>([]);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formAmenities, setFormAmenities] = useState<string[]>([]);
  const [formMealTypes, setFormMealTypes] = useState<string[]>([]);
  const [customMeal, setCustomMeal] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [imageSourceMode, setImageSourceMode] = useState<'url' | 'file'>('url');
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [formServiceCharge, setFormServiceCharge] = useState<number>(0);
  const [formTaxPercentage, setFormTaxPercentage] = useState<number>(0);
  const [formBestPrice, setFormBestPrice] = useState<number | ("")>("");

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {
        "X-Owner-Email": user?.email || ""
      };
      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      const res = await fetch("/api/rooms", { headers });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchRooms();
  }, [user?.email, activeHotel?._id]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormName("");
    setFormPrice("");
    setFormQty("");
    setFormCapacity(2);
    setFormUnavailableDates([]);
    setFormImages([]);
    setFormAmenities([]);
    setCustomMeal("");
    setFormMealTypes([]);
    setCustomAmenity("");
    setCurrentImageUrl("");
    setImageSourceMode("url");
    setFormServiceCharge(0);
    setFormTaxPercentage(0);
    setFormBestPrice("");
    setShowModal(true);
  };

  const handleOpenEdit = (room: any) => {
    setEditingRoom(room);
    setFormName(room.name);
    setFormPrice(room.price);
    setFormQty(room.qty);
    setFormCapacity(room.capacity || 2);
    setFormUnavailableDates(
      room.unavailableDates
        ? room.unavailableDates.map((d: string) => parseISO(d))
        : []
    );
    setFormImages(room.images?.length > 0 ? room.images : (room.imageUrl ? [room.imageUrl] : []));
    setFormAmenities(room.amenities || []);
    setFormMealTypes(room.mealTypes || []);
    setCustomMeal("");
    setCustomAmenity("");
    setCurrentImageUrl("");
    setImageSourceMode("url");
    setFormServiceCharge(room.serviceCharge || 0);
    setFormTaxPercentage(room.taxPercentage || 0);
    setFormBestPrice(room.bestPrice || "");
    setShowModal(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImages([...formImages, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (currentImageUrl.trim()) {
      setFormImages([...formImages, currentImageUrl.trim()]);
      setCurrentImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (roomToDelete !== null) {
      try {
        const headers: Record<string, string> = {
          "X-Owner-Email": user?.email || ""
        };
        if (activeHotel) headers["X-Hotel-Id"] = activeHotel._id;

        const res = await fetch(`/api/rooms/${roomToDelete}`, {
          method: "DELETE",
          headers
        });
        if (res.ok) {
          setRooms(rooms.filter(r => r._id !== roomToDelete));
          toast.success("Room deleted successfully");
        } else {
          toast.error("Failed to delete room");
        }
      } catch (err) {
        console.error("Error deleting room:", err);
        toast.error("An error occurred while deleting");
      } finally {
        setRoomToDelete(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName || formPrice === "" || formQty === "") return;

    try {
      const payload = {
        name: formName,
        price: Number(formPrice),
        qty: Number(formQty),
        capacity: Number(formCapacity),
        unavailableDates: formUnavailableDates.map(d => d.toISOString()),
        images: formImages,
        imageUrl: formImages.length > 0 ? formImages[0] : "",
        amenities: formAmenities,
        serviceCharge: formServiceCharge,
        mealTypes: formMealTypes,
        taxPercentage: formTaxPercentage,
        bestPrice: formBestPrice === "" ? 0 : Number(formBestPrice),
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Owner-Email": user?.email || ""
      };
      if (activeHotel) headers["X-Hotel-Id"] = activeHotel._id;

      if (editingRoom) {
        const res = await fetch(`/api/rooms/${editingRoom._id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setRooms(rooms.map(r => r._id === editingRoom._id ? updated : r));
          toast.success("Room updated successfully");
          setShowModal(false);
        } else {
          toast.error("Failed to update room");
        }
      } else {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setRooms([...rooms, created]);
          toast.success("Room created successfully");
          setShowModal(false);
        } else {
          toast.error("Failed to create room");
        }
      }
    } catch (err) {
      console.error("Error saving room:", err);
      toast.error("An error occurred while saving");
    }
  };

  // Computed total for the live preview
  const liveTotal = formPrice !== ""
    ? Number(formPrice) + formServiceCharge + (Number(formPrice) * formTaxPercentage) / 100
    : 0;

  if (showModal) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              {editingRoom ? "Edit Room Details" : "Add New Room"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Fill in the details below to configure your room.</p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Rooms
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="p-6 space-y-4">

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="e.g. Deluxe Suite"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Room Images</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setImageSourceMode('url')} className={`px-3 py-2 rounded-lg text-sm font-medium ${imageSourceMode === 'url' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>URL</button>
                  <button type="button" onClick={() => setImageSourceMode('file')} className={`px-3 py-2 rounded-lg text-sm font-medium ${imageSourceMode === 'file' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>Upload</button>
                </div>
                {imageSourceMode === 'url' ? (
                  <div className="flex gap-2">
                    <input type="text" value={currentImageUrl} onChange={(e) => setCurrentImageUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }} className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="https://..." />
                    <button type="button" onClick={handleAddImageUrl} className="bg-brand text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-brand-hover shrink-0">Add</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-3 py-4 cursor-pointer hover:border-brand">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Choose file to add</span>
                    <input type="file" onChange={handleFileChange} className="hidden text-xs" accept="image/*" />
                  </label>
                )}
              </div>

              {formImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {idx === 0 && <span className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded uppercase">Main</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Charges Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">Pricing &amp; Charges</label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Base Price (LKR) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Best / Original Price (LKR) <span className="text-slate-400 font-normal">(optional, shown struck-out)</span></label>
                  <input
                    type="number"
                    min="0"
                    value={formBestPrice}
                    onChange={(e) => setFormBestPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="e.g. 35000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Service Charge (Fixed LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={formServiceCharge}
                    onChange={(e) => setFormServiceCharge(Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Tax Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formTaxPercentage}
                    onChange={(e) => setFormTaxPercentage(Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Live Total Preview */}
              {formPrice !== "" && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">Guest will see (per room per night):</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400">
                      <span>Base Price</span>
                      <span>LKR {Number(formPrice).toLocaleString()}</span>
                    </div>
                    {formServiceCharge > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400">
                        <span>Service Charge</span>
                        <span>+ LKR {formServiceCharge.toLocaleString()}</span>
                      </div>
                    )}
                    {formTaxPercentage > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400">
                        <span>Tax ({formTaxPercentage}%)</span>
                        <span>+ LKR {((Number(formPrice) * formTaxPercentage) / 100).toLocaleString()}</span>
                      </div>
                    )}
                    {formBestPrice !== "" && Number(formBestPrice) > 0 && (
                      <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                        <span>Original Price (shown struck-out)</span>
                        <span className="line-through">LKR {Number(formBestPrice).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-emerald-900 dark:text-emerald-200 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                      <span>Total Price Shown to Guest</span>
                      <span>LKR {liveTotal.toLocaleString()}</span>
                    </div>
                    {formMealTypes.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-emerald-200 dark:border-emerald-800 mt-2">
                        {formMealTypes.map((meal, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                            {meal}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity Available</label>
                <input
                  type="number"
                  required
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Guests (Capacity)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value === "" ? 1 : Number(e.target.value))}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="2"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Unavailable Dates</label>
              <p className="text-xs text-slate-500 mb-3">Select dates when this room is fully booked or unavailable.</p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                <DayPicker
                  mode="multiple"
                  selected={formUnavailableDates}
                  onSelect={(dates) => setFormUnavailableDates(dates as Date[] || [])}
                  className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 text-sm"
                />
              </div>
              {formUnavailableDates.length > 0 && (
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">{formUnavailableDates.length}</span> dates blocked.
                </div>
              )}
            </div>



            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room Amenities</label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...AVAILABLE_AMENITIES, ...formAmenities])).map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => {
                      if (formAmenities.includes(amenity)) {
                        setFormAmenities(formAmenities.filter(a => a !== amenity));
                      } else {
                        setFormAmenities([...formAmenities, amenity]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formAmenities.includes(amenity) ? 'bg-brand/10 border-brand text-brand' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customAmenity.trim() && !formAmenities.includes(customAmenity.trim())) {
                        setFormAmenities([...formAmenities, customAmenity.trim()]);
                        setCustomAmenity('');
                      }
                    }
                  }}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm max-w-xs"
                  placeholder="Add custom amenity..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAmenity.trim() && !formAmenities.includes(customAmenity.trim())) {
                      setFormAmenities([...formAmenities, customAmenity.trim()]);
                      setCustomAmenity('');
                    }
                  }}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-hover transition-colors"
            >
              {editingRoom ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Room Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your hotel's rooms, pricing, and availability.</p>
        </div>
        {activeRole !== 'cashier' && (
          <button
            onClick={handleOpenAdd}
            className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading catalog...</div>
      ) : rooms.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
          <p className="text-slate-500">No rooms configured. Add some rooms to make your inventory public!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 text-sm">
              <tr>
                <th className="px-4 py-4 font-medium">Image</th>
                <th className="px-4 py-4 font-medium">Room Type</th>
                <th className="px-4 py-4 font-medium">Capacity</th>
                <th className="px-4 py-4 font-medium">Base Price</th>
                <th className="px-4 py-4 font-medium">Charges</th>
                <th className="px-4 py-4 font-medium">Total Price</th>
                <th className="px-4 py-4 font-medium">Qty</th>
                <th className="px-4 py-4 font-medium">Availability</th>
                <th className="px-4 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {rooms.map(r => {
                const tax = ((r.price || 0) * (r.taxPercentage || 0)) / 100;
                const svc = r.serviceCharge || 0;
                const total = (r.price || 0) + svc + tax;
                return (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4">
                      {r.imageUrl ? <img src={r.imageUrl} alt={r.name} className="w-16 h-12 rounded-lg object-cover" /> : <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-400" /></div>}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="px-4 py-4">
                      <div className="text-slate-900 dark:text-white font-medium">Up to {r.capacity} Guests</div>
                      {r.mealTypes && r.mealTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {r.mealTypes.map((meal: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                              {meal}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">LKR {(r.price || 0).toLocaleString()}</div>
                      {r.bestPrice > 0 && <div className="text-xs text-slate-400 line-through">LKR {r.bestPrice.toLocaleString()}</div>}
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {(svc > 0 || r.taxPercentage > 0) ? (
                        <div className="space-y-0.5">
                          {svc > 0 && <div>Svc: +LKR {svc.toLocaleString()}</div>}
                          {r.taxPercentage > 0 && <div>Tax: {r.taxPercentage}%</div>}
                        </div>
                      ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">LKR {total.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">{r.qty} available</td>
                    <td className="px-4 py-4">
                      {r.unavailableDates && r.unavailableDates.length > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-max text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                          {r.unavailableDates.length} blocked dates
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-max text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Fully Available
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {activeRole !== 'cashier' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenEdit(r)} className="p-2 text-slate-400 hover:text-brand hover:bg-brand-light rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setRoomToDelete(r._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmationModal
        isOpen={roomToDelete !== null}
        onClose={() => setRoomToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Room Type"
        message="Are you sure you want to delete this room type? This action cannot be undone."
      />
    </div>
  );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <RoomsManagement {...props} />
    </DashboardLayout>
  );
}
