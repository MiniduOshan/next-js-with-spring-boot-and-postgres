"use client";

import { Plus, Clock, Tag, X, ArrowLeft, Image as ImageIcon, Upload } from 'lucide-react';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

function Offers() {
  const { user, activeHotel } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDiscount, setFormDiscount] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [imageSourceMode, setImageSourceMode] = useState<'url' | 'file'>('url');
  const [formEnds, setFormEnds] = useState("Ongoing");
  const [formRoomTypes, setFormRoomTypes] = useState<string[]>([]);
  const [formPackageTypes, setFormPackageTypes] = useState<string[]>([]);
  const [formAppliesTo, setFormAppliesTo] = useState<'everything' | 'rooms' | 'packages'>('everything');

  const [rooms, setRooms] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Fetch offers
  const fetchOffersAndRooms = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = { "X-Owner-Email": user?.email || "" };
      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      const [offersRes, roomsRes, profileRes] = await Promise.all([
        fetch("/api/offers", { headers }),
        fetch("/api/rooms?slim=true", { headers }),
        fetch("/api/hotel-profile?slim=true", { headers })
      ]);

      if (offersRes.ok) {
        const data = await offersRes.json();
        setOffers(data);
      }

      if (roomsRes.ok) {
        const data = await roomsRes.json();
        setRooms(data);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setPackages(data.packages || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersAndRooms();
  }, [user?.email, activeHotel?._id]);

  const handleDelete = async () => {
    if (offerToDelete !== null) {
      try {
        const headers: Record<string, string> = {
          "X-Owner-Email": user?.email || ""
        };
        if (activeHotel) {
          headers["X-Hotel-Id"] = activeHotel._id;
        }
        const res = await fetch(`/api/offers/${offerToDelete}`, {
          method: "DELETE",
          headers
        });
        if (res.ok) {
          setOffers(offers.filter(o => o._id !== offerToDelete));
          toast.success("Offer deleted successfully");
        } else {
          toast.error("Failed to delete offer");
        }
      } catch (err) {
        console.error("Failed to delete offer:", err);
        toast.error("An error occurred while deleting");
      } finally {
        setOfferToDelete(null);
      }
    }
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormTitle(offer.title);
    setFormDiscount(offer.discount);
    setFormActive(offer.active);
    setFormImageUrl(offer.imageUrl || offer.image || "");
    setImageSourceMode('url');
    setFormEnds(offer.ends);
    setFormRoomTypes(offer.roomTypes || []);
    setFormPackageTypes(offer.packageTypes || []);
    setFormAppliesTo(offer.appliesTo || 'everything');
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    setFormTitle("");
    setFormDiscount("");
    setFormActive(true);
    setFormImageUrl("");
    setImageSourceMode('url');
    setFormEnds("Ongoing");
    setFormRoomTypes([]);
    setFormPackageTypes([]);
    setFormAppliesTo('everything');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoomTypeToggle = (roomName: string) => {
    setFormRoomTypes(prev =>
      prev.includes(roomName)
        ? prev.filter(rt => rt !== roomName)
        : [...prev, roomName]
    );
  };

  const handlePackageTypeToggle = (packageName: string) => {
    setFormPackageTypes(prev =>
      prev.includes(packageName)
        ? prev.filter(pt => pt !== packageName)
        : [...prev, packageName]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDiscount) return;

    try {
      const payload = {
        title: formTitle,
        discount: formDiscount,
        active: formActive,
        ends: formEnds,
        roomTypes: formAppliesTo === 'rooms' ? formRoomTypes : [],
        imageUrl: formImageUrl,
        image: "", // Explicitly clear legacy image field if it exists
        packageTypes: formAppliesTo === 'packages' ? formPackageTypes : [],
        appliesTo: formAppliesTo,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Owner-Email": user?.email || ""
      };
      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      if (editingOffer) {
        // Update
        const res = await fetch(`/api/offers/${editingOffer._id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setOffers(offers.map(o => o._id === editingOffer._id ? updated : o));
          toast.success("Offer updated successfully");
          setIsModalOpen(false);
        } else {
          toast.error("Failed to update offer");
        }
      } else {
        // Create
        const res = await fetch("/api/offers", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setOffers([...offers, created]);
          toast.success("Offer created successfully");
          setIsModalOpen(false);
        } else {
          toast.error("Failed to create offer");
        }
      }
    } catch (err) {
      console.error("Failed to save offer:", err);
      toast.error("An error occurred while saving");
    }
  };

  if (isModalOpen) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              {editingOffer ? "Edit Offer" : "Create New Offer"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your offer details below.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Offers
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="p-6 space-y-4">

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Offer Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Summer Vacation Deal"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Offer Image</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setImageSourceMode('url')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${imageSourceMode === 'url' ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>URL</button>
                <button type="button" onClick={() => setImageSourceMode('file')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${imageSourceMode === 'file' ? 'bg-brand text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>Upload</button>
              </div>

              {imageSourceMode === 'url' ? (
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              ) : (
                <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-3 py-4 cursor-pointer hover:border-brand transition-colors">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Click to upload offer image</span>
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              )}

              {formImageUrl && (
                <div className="relative mt-2 aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group">
                  <img src={formImageUrl} className="w-full h-full object-cover" alt="Offer preview" />
                  <button
                    type="button"
                    onClick={() => setFormImageUrl("")}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Discount Offer text</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% or 5,000 LKR"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ends In / Duration</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ongoing, In 3 days"
                  value={formEnds}
                  onChange={(e) => setFormEnds(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Applies To</label>
                <select
                  value={formAppliesTo}
                  onChange={(e) => setFormAppliesTo(e.target.value as any)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="everything">Everything (All Rooms & Packages)</option>
                  <option value="rooms">Specific Rooms</option>
                  <option value="packages">Specific Packages</option>
                </select>
              </div>

              {formAppliesTo === 'rooms' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Applicable Rooms</label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto pr-2">
                    {rooms.length === 0 ? (
                      <p className="text-sm text-slate-500">No rooms available</p>
                    ) : (
                      rooms.map(room => (
                        <label key={room._id} className="flex items-start gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formRoomTypes.includes(room.name)}
                            onChange={() => handleRoomTypeToggle(room.name)}
                            className="w-4 h-4 mt-0.5 text-brand rounded border-slate-300 dark:border-slate-600 focus:ring-brand"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-2">
                            {room.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {formAppliesTo === 'packages' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Applicable Packages</label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto pr-2">
                    {packages.length === 0 ? (
                      <p className="text-sm text-slate-500">No packages available</p>
                    ) : (
                      packages.map((pkg, idx) => (
                        <label key={idx} className="flex items-start gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formPackageTypes.includes(pkg.name)}
                            onChange={() => handlePackageTypeToggle(pkg.name)}
                            className="w-4 h-4 mt-0.5 text-brand rounded border-slate-300 dark:border-slate-600 focus:ring-brand"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-2">
                            {pkg.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="formActiveCheck"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="w-4 h-4 text-brand rounded border-slate-300 dark:border-slate-600 focus:ring-brand"
              />
              <label htmlFor="formActiveCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Active Promotion
              </label>
            </div>
          </div>


          <div className="p-5 bg-slate-50 rounded-b-2xl dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              {editingOffer ? "Save Offer" : "Create Offer"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Offers & Promotions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create flash sales to boost your bookings.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading your promotions...</div>
      ) : offers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
          <p className="text-slate-500 dark:text-slate-400">No offers found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map(o => (
            <div key={o._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
                {o.imageUrl || o.image ? (
                  <img src={o.imageUrl || o.image} alt={o.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${o.active ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                    {o.active ? "Active" : "Paused"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{o.title}</h3>
                <p className="text-lg font-black text-brand mb-4">{o.discount} <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-tight uppercase">Discount</span></p>

                <div className="mb-4">
                  {o.appliesTo === 'everything' && (
                    <span className="bg-brand/10 text-brand px-2 py-1 rounded text-xs font-semibold">Applies to Everything</span>
                  )}
                  {o.appliesTo === 'rooms' && o.roomTypes && o.roomTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 mr-1 mt-0.5">Rooms:</span>
                      {o.roomTypes.map((rt: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs">
                          {rt.length > 20 ? rt.substring(0, 20) + '...' : rt}
                        </span>
                      ))}
                    </div>
                  )}
                  {o.appliesTo === 'packages' && o.packageTypes && o.packageTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 mr-1 mt-0.5">Packages:</span>
                      {o.packageTypes.map((pt: string, idx: number) => (
                        <span key={idx} className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded text-xs">
                          {pt.length > 20 ? pt.substring(0, 20) + '...' : pt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" /> {o.ends}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(o)} className="text-brand font-medium hover:underline">Edit</button>
                    <button onClick={() => setOfferToDelete(o._id)} className="text-red-500 font-medium hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={offerToDelete !== null}
        onClose={() => setOfferToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Offer"
        message="Are you sure you want to delete this offer? This action cannot be undone."
      />
    </div>
  );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <Offers {...props} />
    </DashboardLayout>
  );
}
