"use client";

import { useState, useEffect } from 'react';
import { X, Users, Building2, MapPin, Phone, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface HotelDetailsModalProps {
  hotel: any;
  userEmail: string;
  onClose: () => void;
  onStaffUpdated: () => void;
}

export function HotelDetailsModal({ hotel, userEmail, onClose, onStaffUpdated }: HotelDetailsModalProps) {
  const [staff, setStaff] = useState<any[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("manager");

  useEffect(() => {
    // Load staff specifically for this hotel
    const fetchStaff = async () => {
      try {
        const res = await fetch(`/api/hotel-profile/${hotel._id}/staff`, {
          headers: { "X-Owner-Email": userEmail }
        });
        if (res.ok) {
          const data = await res.json();
          setStaff(data.staff || []);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };
    
    if (hotel?._id) {
      fetchStaff();
    }
  }, [hotel?._id, userEmail]);

  const handleAddStaff = async () => {
    if (!newStaffEmail.trim()) return;
    if (newStaffPassword.length < 6) {
      toast.error("Staff password must be at least 6 characters long.");
      return;
    }
    const lowerEmail = newStaffEmail.trim().toLowerCase();
    try {
      const res = await fetch(`/api/hotel-profile/${hotel._id}/staff`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Owner-Email": userEmail },
        body: JSON.stringify({ action: "add", email: lowerEmail, role: newStaffRole, password: newStaffPassword })
      });
      if (res.ok) {
        const storedUsersJson = localStorage.getItem("yme_registered_users");
        const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
        const existingUserIndex = users.findIndex((u: any) => u.email.toLowerCase() === lowerEmail);

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

        const data = await res.json();
        setStaff(data.staff);
        setNewStaffEmail("");
        setNewStaffPassword("");
        toast.success("Staff member added");
        onStaffUpdated();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add staff");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleRemoveStaff = async (emailToRemove: string) => {
    try {
      const res = await fetch(`/api/hotel-profile/${hotel._id}/staff`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Owner-Email": userEmail },
        body: JSON.stringify({ action: "remove", email: emailToRemove })
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff);
        toast.success("Staff member removed");
        onStaffUpdated();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove staff");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand" />
            {hotel.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-200/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hotel Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.images && hotel.images[0] && (
              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-32 object-cover rounded-xl" />
            )}
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {hotel.city}</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {hotel.phone}</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {hotel.email}</p>
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${hotel.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {hotel.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Management */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-brand" /> Staff Management
            </h4>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="email" 
                    value={newStaffEmail} 
                    onChange={(e) => setNewStaffEmail(e.target.value)} 
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" 
                    placeholder="Staff email address" 
                  />
                  <input 
                    type="password"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    placeholder="Staff password"
                  />
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                  </select>
                  <button 
                    type="button" 
                    onClick={handleAddStaff} 
                    className="bg-brand text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-hover shrink-0"
                  >
                    Add Staff
                  </button>
                </div>
              {staff.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {staff.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.email}</p>
                        <p className="text-xs text-brand font-medium capitalize">{s.role}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveStaff(s.email)} 
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Remove Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500">No staff members added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
