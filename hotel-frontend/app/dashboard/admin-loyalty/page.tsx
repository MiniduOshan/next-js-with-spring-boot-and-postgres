"use client";

import React, { useState, useEffect } from 'react';
import { Save, Star, Plus, Trash2, Edit3, Check, X, ToggleLeft, ToggleRight, Zap, List, Trophy, Gift, Search } from 'lucide-react';
import { toast } from 'sonner';

export interface LoyaltyActivity {
  _id?: string;
  activity_code: string;
  activity_name: string;
  description: string;
  points: number;
  activity_type: string;
  is_repeatable: boolean;
  daily_limit: number;
  status: string;
}

function AdminLoyalty() {
  const [activeTab, setActiveTab] = useState<'activities' | 'logs' | 'leaderboard' | 'manual'>('activities');
  
  const [activities, setActivities] = useState<LoyaltyActivity[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    activity_code: '',
    activity_name: '',
    description: '',
    points: 10,
    is_repeatable: true,
    daily_limit: 0
  });

  const [manualForm, setManualForm] = useState({
    user_email: '',
    points: 50,
    remarks: 'Special Reward'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'activities') {
        const res = await fetch("/api/loyalty/activities");
        if (res.ok) setActivities(await res.json());
      } else if (activeTab === 'logs') {
        const res = await fetch("/api/loyalty/logs");
        if (res.ok) setLogs(await res.json());
      } else if (activeTab === 'leaderboard') {
        const res = await fetch("/api/loyalty/leaderboard");
        if (res.ok) setLeaderboard(await res.json());
      }
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ activity_code: '', activity_name: '', description: '', points: 10, is_repeatable: true, daily_limit: 0 });
    setShowForm(true);
  };

  const openEditForm = (activity: LoyaltyActivity) => {
    setEditingId(activity._id!);
    setForm({
      activity_code: activity.activity_code,
      activity_name: activity.activity_name,
      description: activity.description,
      points: activity.points,
      is_repeatable: activity.is_repeatable,
      daily_limit: activity.daily_limit
    });
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!form.activity_code.trim() || !form.activity_name.trim()) {
      toast.error('Code and Name are required'); return;
    }
    
    const toastId = toast.loading("Saving...");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/loyalty/activities/${editingId}` : "/api/loyalty/activities";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: 'active' })
      });
      
      if (res.ok) {
        toast.success("Saved successfully!", { id: toastId });
        setShowForm(false);
        fetchData();
      } else {
        toast.error("Failed to save activity", { id: toastId });
      }
    } catch (err) {
      toast.error("Error saving activity", { id: toastId });
    }
  };

  const toggleActivity = async (activity: LoyaltyActivity) => {
    try {
      const newStatus = activity.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/loyalty/activities/${activity._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const deleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      const res = await fetch(`/api/loyalty/activities/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchData();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const submitManualAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.user_email) return toast.error("User email is required");
    
    const toastId = toast.loading("Awarding points...");
    try {
      // Create a manual activity if not exists
      const actRes = await fetch("/api/loyalty/activities");
      const acts = await actRes.json();
      let manualAct = acts.find((a: any) => a.activity_code === 'manual_award');
      
      if (!manualAct) {
        const createRes = await fetch("/api/loyalty/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_code: 'manual_award',
            activity_name: 'Manual Point Award',
            points: 0,
            is_repeatable: true,
            status: 'active'
          })
        });
        manualAct = await createRes.json();
      }

      // We override the points in the request backend logic if we change the API or we can just send the required amount.
      // Wait, our backend uses activity.points! 
      // To bypass this for manual awards, we can use the /api/loyalty/activities to update the manual_award points first, or we can just update the backend to allow point overrides.
      // Since we didn't add point overrides, we'll quickly create a specific activity for this or update the manual_award points.
      await fetch(`/api/loyalty/activities/${manualAct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: manualForm.points })
      });

      const res = await fetch("/api/loyalty/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: manualForm.user_email,
          activity_code: "manual_award",
          remarks: manualForm.remarks
        })
      });
      
      if (res.ok) {
        toast.success(`Awarded ${manualForm.points} points to ${manualForm.user_email}`, { id: toastId });
        setManualForm({ user_email: '', points: 50, remarks: 'Special Reward' });
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to award points", { id: toastId });
      }
    } catch (err) {
      toast.error("Error awarding points", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-brand fill-brand" /> Points & Rewards Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure activities, view logs, and manage user balances.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
        {[
          { id: 'activities', icon: Zap, label: 'Activities' },
          { id: 'logs', icon: List, label: 'Activity Logs' },
          { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
          { id: 'manual', icon: Gift, label: 'Manual Award' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-brand shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'activities' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider">Point Activities</h3>
            <button onClick={openAddForm} className="flex items-center gap-1.5 bg-brand/10 hover:bg-brand/20 text-brand font-bold text-xs px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </button>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? <div className="p-6 text-center text-sm text-slate-500">Loading...</div> : activities.map(act => (
              <div key={act._id} className={`flex items-center justify-between gap-4 px-6 py-4 ${act.status !== 'active' ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{act.activity_name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{act.activity_code}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{act.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-slate-400">
                    <span>Repeatable: {act.is_repeatable ? 'Yes' : 'No'}</span>
                    {act.daily_limit > 0 && <span>• Daily Limit: {act.daily_limit}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 rounded-lg px-2.5 py-1">
                    <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400">+{act.points} pts</span>
                  </div>
                  <button onClick={() => openEditForm(act)} className="p-1.5 text-slate-400 hover:text-brand bg-slate-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggleActivity(act)} className="p-1 text-slate-400 hover:text-brand">
                    {act.status === 'active' ? <ToggleRight className="w-5 h-5 text-brand" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => deleteActivity(act._id!)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <h4 className="text-sm font-bold mb-4">{editingId ? 'Edit Activity' : 'New Activity'}</h4>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Trigger Event / Code *</label>
                  <input 
                    type="text" 
                    disabled={!!editingId} 
                    value={form.activity_code} 
                    onChange={e => setForm({...form, activity_code: e.target.value.toLowerCase().replace(/\s+/g, '_')})} 
                    className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border outline-none text-sm disabled:opacity-50" 
                    placeholder="e.g. daily_login" 
                    list="trigger-codes"
                  />
                  <datalist id="trigger-codes">
                    <option value="daily_login">Daily Login</option>
                    <option value="register_account">Register Account</option>
                    <option value="make_booking">Make a Booking</option>
                    <option value="write_review">Write a Review</option>
                    <option value="add_hotel">Add a Hotel</option>
                    <option value="add_room">Add a Room</option>
                  </datalist>
                  <p className="text-[10px] text-slate-500 mt-1">For automatic points, use a system trigger code.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Activity Name *</label>
                  <input type="text" value={form.activity_name} onChange={e => setForm({...form, activity_name: e.target.value})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border outline-none text-sm" placeholder="e.g. Daily Login" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Points *</label>
                  <input type="number" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)||0})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border outline-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Daily Limit (0 = Unlimited)</label>
                  <input type="number" value={form.daily_limit} onChange={e => setForm({...form, daily_limit: parseInt(e.target.value)||0})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border outline-none text-sm" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border outline-none text-sm" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="repeatable" checked={form.is_repeatable} onChange={e => setForm({...form, is_repeatable: e.target.checked})} className="rounded text-brand" />
                  <label htmlFor="repeatable" className="text-sm font-semibold">Is Repeatable Activity?</label>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={submitForm} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-bold">Save Activity</button>
                <button onClick={() => setShowForm(false)} className="bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h3 className="text-sm font-extrabold uppercase mb-4">Recent Activity Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="py-2 font-semibold">Date</th>
                  <th className="py-2 font-semibold">User</th>
                  <th className="py-2 font-semibold">Activity</th>
                  <th className="py-2 font-semibold">Points</th>
                  <th className="py-2 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any, i) => (
                  <tr key={i} className="border-b last:border-0 border-slate-50 dark:border-slate-800/50">
                    <td className="py-3 text-xs text-slate-500">{new Date(log.awarded_at).toLocaleString()}</td>
                    <td className="py-3 font-semibold">{log.user_id}</td>
                    <td className="py-3 text-xs bg-slate-100 dark:bg-slate-800 px-2 rounded">{log.activity_id}</td>
                    <td className={`py-3 font-bold ${log.points_awarded > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {log.points_awarded > 0 ? '+' : ''}{log.points_awarded}
                    </td>
                    <td className="py-3 text-xs text-slate-500">{log.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
          <h3 className="text-sm font-extrabold uppercase mb-4">Global Leaderboard</h3>
          <div className="space-y-3">
            {leaderboard.map((l: any, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                    #{i + 1}
                  </div>
                  <div>
                    <p className="font-bold">{l.user_id}</p>
                    <p className="text-xs text-slate-500">Available: {l.available_points} pts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-amber-500">{l.total_points}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Lifetime</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <form onSubmit={submitManualAward} className="bg-white dark:bg-slate-900 rounded-2xl border p-6 max-w-xl">
          <h3 className="text-sm font-extrabold uppercase mb-4">Manual Point Award</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">User Email</label>
              <input required type="email" value={manualForm.user_email} onChange={e => setManualForm({...manualForm, user_email: e.target.value})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2.5 border outline-none text-sm" placeholder="user@example.com" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Points to Award (or deduct with -)</label>
              <input required type="number" value={manualForm.points} onChange={e => setManualForm({...manualForm, points: parseInt(e.target.value)||0})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2.5 border outline-none text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Remarks / Reason</label>
              <input required type="text" value={manualForm.remarks} onChange={e => setManualForm({...manualForm, remarks: e.target.value})} className="w-full bg-white dark:bg-slate-900 rounded-xl px-4 py-2.5 border outline-none text-sm" placeholder="e.g. Compensation for issue" />
            </div>
            <button type="submit" className="w-full bg-brand text-white py-3 rounded-xl font-bold mt-2">
              Award Points
            </button>
          </div>
        </form>
      )}

    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <AdminLoyalty {...props} />
    </DashboardLayout>
  );
}
