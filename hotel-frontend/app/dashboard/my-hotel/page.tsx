"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { Building2, Save, MapPin, Phone, Mail, Image as ImageIcon, Upload, Trash2, Edit, Check, Users, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

const AVAILABLE_HOTEL_AMENITIES = ["Free WiFi", "Swimming Pool", "Parking", "Restaurant", "Bar", "Spa", "Gym", "Room Service", "Airport Shuttle", "Beach Access"];

function MyHotel() {
  const { user, activeRole, activeHotel, refreshHotels } = useAuth();
  const pathname = usePathname();
    const location = { pathname, hash: typeof window !== 'undefined' ? window.location.hash : '' };;
  const isStaffMode = location.hash === '#staff-management';
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile Fields State
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [directionsLink, setDirectionsLink] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageSourceMode, setImageSourceMode] = useState<'url' | 'file'>('url');
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);

  const [rules, setRules] = useState<string[]>([]);
  const [policies, setPolicies] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [newPolicy, setNewPolicy] = useState("");
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [editingRuleValue, setEditingRuleValue] = useState("");
  const [editingPolicyIndex, setEditingPolicyIndex] = useState<number | null>(null);
  const [editingPolicyValue, setEditingPolicyValue] = useState("");

  const [staff, setStaff] = useState<any[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("manager");
  const [showNewStaffPassword, setShowNewStaffPassword] = useState(false);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showPrivileges, setShowPrivileges] = useState(false);

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    manager: [
      "Manage Hotel Profile",
      "Manage Rooms",
      "Manage Bookings",
      "Manage Members",
      "Manage Pricing",
      "View Reports",
      "Manage Taxes & Charges"
    ],
    cashier: [
      "View Bookings",
      "Check In Guests",
      "Check Out Guests",
      "Process Payments",
      "Generate Invoices"
    ]
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  useEffect(() => {
    if (activeHotel && !isCreatingNew) {
      setPropertyName(activeHotel.propertyName || "");
      setPropertyType(activeHotel.propertyType || "Hotel");
      setDescription(activeHotel.description || "");
      setAddress(activeHotel.address || "");
      setCity(activeHotel.city || "");
      setProvince(activeHotel.province || "");
      setPhone(activeHotel.phone || "");
      setWhatsapp(activeHotel.whatsapp || "");
      setDirectionsLink(activeHotel.directionsLink || "");
      setEmail(activeHotel.email || "");
      setImages(activeHotel.images?.length > 0 ? activeHotel.images : (activeHotel.imageUrl ? [activeHotel.imageUrl] : []));
      setAmenities(activeHotel.amenities || []);
      setRules(activeHotel.rules || []);
      setPolicies(activeHotel.policies || []);
      setStaff(activeHotel.staff || []);
      setServiceCharge(activeHotel.serviceCharge || 0);
      setTaxPercentage(activeHotel.taxPercentage || 0);
    } else if (isCreatingNew) {
      setPropertyName("");
      setPropertyType("Hotel");
      setDescription("");
      setAddress("");
      setCity("");
      setProvince("");
      setPhone("");
      setWhatsapp("");
      setDirectionsLink("");
      setEmail("");
      setImages([]);
      setAmenities([]);
      setRules([]);
      setPolicies([]);
      setStaff([]);
      setServiceCharge(0);
      setTaxPercentage(0);
    }
  }, [activeHotel, isCreatingNew, isEditing]);

  const hasChanges = () => {
    if (isCreatingNew) return propertyName.trim() !== "";
    if (!activeHotel) return false;

    const initialImages = activeHotel.images?.length > 0 ? activeHotel.images : (activeHotel.imageUrl ? [activeHotel.imageUrl] : []);

    return (
      propertyName !== (activeHotel.propertyName || "") ||
      propertyType !== (activeHotel.propertyType || "Hotel") ||
      description !== (activeHotel.description || "") ||
      address !== (activeHotel.address || "") ||
      city !== (activeHotel.city || "") ||
      province !== (activeHotel.province || "") ||
      phone !== (activeHotel.phone || "") ||
      whatsapp !== (activeHotel.whatsapp || "") ||
      directionsLink !== (activeHotel.directionsLink || "") ||
      email !== (activeHotel.email || "") ||
      JSON.stringify(images) !== JSON.stringify(initialImages) ||
      JSON.stringify(amenities) !== JSON.stringify(activeHotel.amenities || []) ||
      JSON.stringify(rules) !== JSON.stringify(activeHotel.rules || []) ||
      JSON.stringify(policies) !== JSON.stringify(activeHotel.policies || []) ||
      serviceCharge !== (activeHotel.serviceCharge || 0) ||
      taxPercentage !== (activeHotel.taxPercentage || 0)
    );
  };

  useEffect(() => {
    // හෝටලයක් තෝරා නොමැති නම් ස්වයංක්‍රීයව 'Create Mode' එකට මාරු වීම
    if (!activeHotel && user?.isPartner) {
      setIsCreatingNew(true);
    }
  }, [activeHotel, user?.isPartner]);

  useEffect(() => {
    // Refresh staff list when hotel changes to ensure latest data is shown
    const fetchStaff = async () => {
      if (!activeHotel?._id || isCreatingNew) return;
      try {
        const res = await fetch(`/api/hotel-profile/${activeHotel._id}/staff`, {
          headers: { "X-Owner-Email": user?.email || "" }
        });
        if (res.ok) {
          const data = await res.json();
          setStaff(data.staff || []);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };
    fetchStaff();
  }, [activeHotel?._id, isCreatingNew, user?.email]);

  useEffect(() => {
    // Handle view switching when hash changes
    if (isStaffMode) {
      // නව හෝටලයක් සාදන මෝඩ් එකේ සිටී නම් එය අක්‍රිය කරන්න
      if (isCreatingNew) {
        setIsCreatingNew(false);
      }
    }
  }, [isStaffMode, isCreatingNew]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages([...images, reader.result]);
          toast.info("Image added. Click 'Save Changes' to apply.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (currentImageUrl.trim()) {
      setImages([...images, currentImageUrl.trim()]);
      setCurrentImageUrl("");
      toast.info("Image added. Click 'Save Changes' to apply.");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.info("Image removed. Click 'Save Changes' to apply.");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        propertyName,
        propertyType,
        description,
        address,
        city,
        province,
        phone,
        whatsapp,
        directionsLink,
        email,
        images,
        imageUrl: images.length > 0 ? images[0] : "",
        amenities,
        rules,
        policies,
        serviceCharge,
        taxPercentage,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Owner-Email": user?.email || ""
      };

      if (!isCreatingNew && activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }

      const res = await fetch("/api/hotel-profile", {
        method: isCreatingNew ? "POST" : "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(isCreatingNew ? "New hotel created successfully" : "Profile updated successfully");
        setIsCreatingNew(false);
        setIsEditing(false);
        refreshHotels();
      } else {
        toast.error("Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("An error occurred while saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffEmail.trim()) return;
    if (newStaffPassword.length < 6) {
      toast.error("Staff password must be at least 6 characters long.");
      return;
    }

    const lowerEmail = newStaffEmail.trim().toLowerCase();

    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    const existingUserIndex = users.findIndex((u: any) => u.email.toLowerCase() === lowerEmail);

    try {
      const res = await fetch(`/api/hotel-profile/${activeHotel._id}/staff`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Owner-Email": user?.email || ""
        },
        body: JSON.stringify({ action: "add", email: lowerEmail, role: newStaffRole, password: newStaffPassword })
      });
      const data = await res.json();
      if (res.ok) {
        // Keep this browser's demo auth cache in sync, but server auth is the source of truth for staff.
        if (existingUserIndex === -1) {
          const newUser = {
            id: Math.random().toString(36).substring(2, 9),
            name: lowerEmail.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase()),
            email: lowerEmail,
            password: newStaffPassword,
            isPartner: false,
            isStaff: true,
            staffRole: newStaffRole,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lowerEmail)}&backgroundColor=00a67e`,
            joinedDate: new Date().toLocaleDateString(),
            points: 0
          };
          users.push(newUser);
        } else {
          users[existingUserIndex] = { ...users[existingUserIndex], isStaff: true, staffRole: newStaffRole };
        }
        localStorage.setItem("yme_registered_users", JSON.stringify(users));

        // Update local staff list immediately
        if (data.staff) setStaff(data.staff);

        toast.success("Staff added successfully");
        setNewStaffEmail("");
        setNewStaffPassword("");
        refreshHotels();
      } else {
        toast.error(data.error || "Failed to add staff");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleRemoveStaff = async (email: string) => {
    try {
      const res = await fetch(`/api/hotel-profile/${activeHotel._id}/staff`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Owner-Email": user?.email || ""
        },
        body: JSON.stringify({ action: "remove", email })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.staff) setStaff(data.staff);
        toast.success("Staff removed successfully");
        refreshHotels();
      } else {
        toast.error(data.error || "Failed to remove staff");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading hotel profile...</div>;
  }

  // Render only staff management when in #staff-management mode
  if (isStaffMode) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Members</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Invite and manage staff members who can manage {activeHotel?.propertyName}.</p>
        </div>

        <div id="staff-management" className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand" /> Add New Staff Member
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  placeholder="Staff email address"
                />
                <div className="relative">
                  <input
                    type={showNewStaffPassword ? "text" : "password"}
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    placeholder="Staff password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewStaffPassword(!showNewStaffPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showNewStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                >
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddStaff}
                  className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-hover transition-all shadow-md shadow-brand/10"
                >
                  Add Staff
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="button"
                onClick={() => setShowPrivileges(!showPrivileges)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                  Set Privileges
                </span>

                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showPrivileges ? "rotate-180" : ""
                    }`}
                />
              </button>

              {showPrivileges && (
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ROLE_PERMISSIONS[newStaffRole]?.map((permission) => {
                      const active = selectedPermissions.includes(permission);

                      return (
                        <button
                          key={permission}
                          type="button"
                          onClick={() => togglePermission(permission)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${active
                            ? "bg-brand text-white border-brand"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          <Check
                            className={`w-3 h-3 ${active ? "opacity-100" : "opacity-30"
                              }`}
                          />
                          {permission}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>


            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Current Members ({staff.length})</h3>
              {staff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-sm">
                          {s.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.email}</p>
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wider">{s.role}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStaff(s.email)}
                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                  <Users className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No members found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{isCreatingNew ? 'Create New Hotel' : 'Hotel Profile'}</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your property details and public information.</p>
        </div>
        <div className="flex items-center gap-3">
          {!activeHotel && user?.isPartner && (
            <button
              type="button"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl font-medium transition-colors text-sm"
            >
              {isCreatingNew ? 'Cancel Creation' : 'Create New Hotel'}
            </button>
          )}
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-1.5 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            )}
            {!isEditing && !isCreatingNew ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-brand hover:bg-brand-hover text-white px-4 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm shadow-sm"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving || (!isCreatingNew && !hasChanges())}
                className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-4 py-1.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer text-sm shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand" />
              Basic Information
            </h3>

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Property Name</label>
                  <input
                    type="text"
                    disabled={!isEditing && !isCreatingNew}
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Property Type</label>
                  <select
                    disabled={!isEditing && !isCreatingNew}
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Villa">Villa</option>
                    <option value="Boutique">Boutique</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={4}
                  disabled={!isEditing && !isCreatingNew}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand" />
              Location & Contact
            </h3>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                <input
                  type="text"
                  disabled={!isEditing && !isCreatingNew}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    disabled={!isEditing && !isCreatingNew}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Province</label>
                  <input
                    type="text"
                    disabled={!isEditing && !isCreatingNew}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="tel"
                    disabled={!isEditing && !isCreatingNew}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                  <input
                    type="tel"
                    disabled={!isEditing && !isCreatingNew}
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+94..."
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Maps Link</label>
                  <input
                    type="url"
                    disabled={!isEditing && !isCreatingNew}
                    value={directionsLink}
                    onChange={(e) => setDirectionsLink(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    disabled={!isEditing && !isCreatingNew}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand" />
              Taxes & Charges
            </h3>

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Service Charge (Fixed Amount in LKR)</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!isEditing && !isCreatingNew}
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tax Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={!isEditing && !isCreatingNew}
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Property Facilities & Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...AVAILABLE_HOTEL_AMENITIES, ...amenities])).map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  disabled={!isEditing && !isCreatingNew}
                  onClick={() => {
                    if (amenities.includes(amenity)) {
                      setAmenities(amenities.filter(a => a !== amenity));
                    } else {
                      setAmenities([...amenities, amenity]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${amenities.includes(amenity) ? 'bg-brand/10 border-brand text-brand' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  {amenity}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                disabled={!isEditing && !isCreatingNew}
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
                      setAmenities([...amenities, customAmenity.trim()]);
                      setCustomAmenity('');
                    }
                  }
                }}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm max-w-xs"
                placeholder="Add custom facility..."
              />
              <button
                type="button"
                disabled={!isEditing && !isCreatingNew}
                onClick={() => {
                  if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
                    setAmenities([...amenities, customAmenity.trim()]);
                    setCustomAmenity('');
                  }
                }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-slate-200 shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Rules & Policies */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6">Rules & Policies</h3>

            <div className="space-y-4">
              {/* Rules */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">House Rules</label>
                <div className="flex gap-2">
                  <input type="text" disabled={!isEditing && !isCreatingNew} value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newRule.trim()) { setRules([...rules, newRule.trim()]); setNewRule(''); } } }} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="e.g. Check-in after 2:00 PM" />
                  <button type="button" disabled={!isEditing && !isCreatingNew} onClick={() => { if (newRule.trim()) { setRules([...rules, newRule.trim()]); setNewRule(''); } }} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-slate-200 shrink-0">Add</button>
                </div>
                {rules.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {rules.map((rule, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                        {editingRuleIndex === idx ? (
                          <div className="flex flex-1 gap-2 items-center">
                            <input
                              type="text"
                              value={editingRuleValue}
                              onChange={(e) => setEditingRuleValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const updated = [...rules];
                                  updated[idx] = editingRuleValue;
                                  setRules(updated);
                                  setEditingRuleIndex(null);
                                }
                              }}
                              className="flex-1 border border-brand bg-white dark:bg-slate-900 rounded px-2 py-1 outline-none text-slate-900 dark:text-white text-sm"
                            />
                            <button type="button" onClick={() => {
                              const updated = [...rules];
                              updated[idx] = editingRuleValue;
                              setRules(updated);
                              setEditingRuleIndex(null);
                            }} className="text-emerald-500 hover:text-emerald-600 p-1"><Check className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex flex-1 justify-between items-center">
                            <span>{rule}</span>
                            {(isEditing || isCreatingNew) && <div className="flex items-center gap-2">
                              <button type="button" onClick={() => { setEditingRuleIndex(idx); setEditingRuleValue(rule); }} className="text-slate-400 hover:text-brand p-1"><Edit className="w-4 h-4" /></button>
                              <button type="button" onClick={() => setRules(rules.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Policies */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Policies</label>
                <div className="flex gap-2">
                  <input type="text" disabled={!isEditing && !isCreatingNew} value={newPolicy} onChange={(e) => setNewPolicy(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newPolicy.trim()) { setPolicies([...policies, newPolicy.trim()]); setNewPolicy(''); } } }} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="e.g. Free cancellation 48 hours prior" />
                  <button type="button" disabled={!isEditing && !isCreatingNew} onClick={() => { if (newPolicy.trim()) { setPolicies([...policies, newPolicy.trim()]); setNewPolicy(''); } }} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-slate-200 shrink-0">Add</button>
                </div>
                {policies.length > 0 && (
                  <ul className="space-y-2 mt-2">
                    {policies.map((policy, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                        {editingPolicyIndex === idx ? (
                          <div className="flex flex-1 gap-2 items-center">
                            <input
                              type="text"
                              value={editingPolicyValue}
                              onChange={(e) => setEditingPolicyValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const updated = [...policies];
                                  updated[idx] = editingPolicyValue;
                                  setPolicies(updated);
                                  setEditingPolicyIndex(null);
                                }
                              }}
                              className="flex-1 border border-brand bg-white dark:bg-slate-900 rounded px-2 py-1 outline-none text-slate-900 dark:text-white text-sm"
                            />
                            <button type="button" onClick={() => {
                              const updated = [...policies];
                              updated[idx] = editingPolicyValue;
                              setPolicies(updated);
                              setEditingPolicyIndex(null);
                            }} className="text-emerald-500 hover:text-emerald-600 p-1"><Check className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex flex-1 justify-between items-center">
                            <span>{policy}</span>
                            {(isEditing || isCreatingNew) && <div className="flex items-center gap-2">
                              <button type="button" onClick={() => { setEditingPolicyIndex(idx); setEditingPolicyValue(policy); }} className="text-slate-400 hover:text-brand p-1"><Edit className="w-4 h-4" /></button>
                              <button type="button" onClick={() => setPolicies(policies.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Room Management Shortcut */}
          <div className="bg-gradient-to-br from-brand/10 to-emerald-500/10 dark:from-brand/20 dark:to-emerald-500/20 rounded-2xl p-4 shadow-sm border border-brand/20">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand" />
              Room Management
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Need to add more rooms or update pricing? Head over to the dedicated Room Management section.
            </p>
            <Link href="/dashboard/rooms" className="inline-flex items-center justify-center w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-brand font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
              Manage Rooms
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand" />
              Property Images
            </h3>

            <div className="space-y-3">
              <div>
                {(isEditing || isCreatingNew) && <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setImageSourceMode('url')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${imageSourceMode === 'url' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>URL</button>
                  <button type="button" onClick={() => setImageSourceMode('file')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${imageSourceMode === 'file' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>Upload</button>
                </div>}
                {imageSourceMode === 'url' ? (
                  <div className="flex gap-2">
                    <input type="text" disabled={!isEditing && !isCreatingNew} value={currentImageUrl} onChange={(e) => setCurrentImageUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }} className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="https://..." />
                    <button type="button" disabled={!isEditing && !isCreatingNew} onClick={handleAddImageUrl} className="bg-brand text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-brand-hover shrink-0">Add</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl px-3 py-4 cursor-pointer hover:border-brand">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Choose file to add</span>
                    <input type="file" onChange={handleFileChange} className="hidden text-xs" accept="image/*" />
                  </label>
                )}
              </div>

              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx + 1}`} referrerPolicy="no-referrer" />
                      {(isEditing || isCreatingNew) && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>}
                      {idx === 0 && <span className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded uppercase shadow-sm">Main</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 p-4 text-center text-xs">
                  No images provided
                </div>
              )}
            </div>
          </div>

          <div className="bg-brand-light text-brand rounded-2xl p-4 border border-brand/20">
            <h4 className="font-semibold mb-2">Need Help?</h4>
            <p className="text-sm opacity-90 mb-4">Contact our support team if you need assistance updating your property details.</p>
            <button type="button" className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-sm font-medium shadow-sm w-full hover:bg-slate-50 dark:hover:bg-slate-800/50">Contact Support</button>
          </div>
        </div>
      </div>
    </form>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <MyHotel {...props} />
    </DashboardLayout>
  );
}
