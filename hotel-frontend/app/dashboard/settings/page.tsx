"use client";

import { Save, Bell, Lock, User, Upload, Trash2 } from 'lucide-react';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

function Settings() {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'account' | 'notifications' | 'security') || 'account';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and security.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden text-sm">
        <div className="grid md:grid-cols-4 min-h-[500px]">
          {/* Content */}
          <div className="md:col-span-4 p-5 sm:p-6">
            {activeTab === 'account' && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Personal Information</h3>

                <div className="space-y-4 max-w-lg">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 select-none">
                      <img
                        src={user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=00a67e`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=00a67e`;
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden text-xs"
                        accept="image/*"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> Change Picture
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Recommended: Square image, at least 400x400px.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="font-medium text-slate-700 dark:text-slate-300">Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        onChange={(e) => updateProfile({ name: e.target.value })}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Email Address (Login ID)</label>
                    <input type="email" defaultValue={user?.email} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed text-xs" disabled />
                    <p className="text-xs text-slate-500 dark:text-slate-400">To change your email address, please contact support.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Designation</label>
                    <input type="text" defaultValue="General Manager" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Contact Number</label>
                    <input type="text" defaultValue="+94 77 123 4567" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-8">
                  <h4 className="font-bold text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-sm text-slate-500 mb-4">Deleting your account will permanently remove your hotel profile and all associated data.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user?.email) {
                        toast.error("User email not found");
                        return;
                      }
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium shadow-sm hover:bg-red-100 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Hotel Account
                  </button>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Notification Preferences</h3>
                <div className="space-y-3 max-w-lg">
                  <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand text-xs" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">New Bookings</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Get notified when a guest makes a new booking</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand text-xs" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Cancellations</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Get notified when a booking is cancelled</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 text-brand rounded focus:ring-brand accent-brand text-xs" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">New Reviews</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Get notified when a guest leaves a review</div>
                    </div>
                  </label>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Security Settings</h3>
                <div className="space-y-4 max-w-lg">
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-900 dark:text-white">Change Password</h4>
                    <div className="space-y-2">
                      <label className="font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium text-slate-700 dark:text-slate-300">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-xs" />
                    </div>
                    <button className="bg-slate-900 text-white px-3 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">Update Password</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Delete Account?</h3>
            <p className="text-slate-500 mb-6 font-medium">Are you sure you want to completely remove your hotel account and all associated data? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/hotel-account", {
                      method: "DELETE",
                      headers: { "X-Owner-Email": user?.email || "" }
                    });
                    if (res.ok) {
                      toast.success("Account deleted successfully!");
                      deleteAccount(user!.id);
                      setTimeout(() => {
                        window.location.href = "/";
                      }, 1000);
                    } else {
                      toast.error("Failed to delete account");
                    }
                  } catch (err) {
                    toast.error("An error occurred while deleting account");
                  }
                }}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <Settings {...props} />
    </DashboardLayout>
  );
}
