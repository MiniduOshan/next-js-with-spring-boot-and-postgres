"use client";

import { useState } from 'react';
import {
  Package, CheckCircle2, Edit2, Save, X, Plus, Trash2,
  Crown, Zap, Gift, ToggleLeft, ToggleRight, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSystemPackages, saveSystemPackages, SystemPackage
} from "@/lib/packagesData";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Gift className="w-5 h-5" />,
  pro: <Zap className="w-5 h-5" />,
  premium: <Crown className="w-5 h-5" />,
};

const PLAN_COLORS: Record<string, { gradient: string; icon: string; ring: string; badge: string }> = {
  free: {
    gradient: 'from-slate-500 to-slate-700',
    icon: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    ring: 'ring-slate-200 dark:ring-slate-700',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  pro: {
    gradient: 'from-brand to-emerald-600',
    icon: 'bg-brand/10 text-brand',
    ring: 'ring-brand/30',
    badge: 'bg-brand/10 text-brand dark:bg-brand/20',
  },
  premium: {
    gradient: 'from-violet-600 to-purple-700',
    icon: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-300 dark:ring-violet-700',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  },
};

function AdminPackages() {
  const [packages, setPackages] = useState<SystemPackage[]>(getSystemPackages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<SystemPackage | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const startEdit = (pkg: SystemPackage) => {
    setEditingId(pkg.id);
    setEditDraft({ ...pkg, features: [...pkg.features] });
    setNewFeature('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
    setNewFeature('');
  };

  const saveEdit = () => {
    if (!editDraft) return;
    const updated = packages.map(p => p.id === editDraft.id ? { ...editDraft } : p);
    setPackages(updated);
    saveSystemPackages(updated);
    toast.success(`"${editDraft.name}" plan updated successfully`);
    cancelEdit();
  };

  const toggleStatus = (id: string) => {
    const updated = packages.map(p =>
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p
    ) as SystemPackage[];
    setPackages(updated);
    saveSystemPackages(updated);
    const pkg = updated.find(p => p.id === id)!;
    toast.success(`"${pkg.name}" is now ${pkg.status}`);
  };

  const addFeature = () => {
    if (!editDraft || !newFeature.trim()) return;
    setEditDraft({ ...editDraft, features: [...editDraft.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    if (!editDraft) return;
    setEditDraft({ ...editDraft, features: editDraft.features.filter((_, i) => i !== idx) });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-brand" /> Subscription Packages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage the three system-level plans displayed to users and on the landing page.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          Plans are fixed (Free / Pro / Premium) — edit content only
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map(pkg => {
          const colors = PLAN_COLORS[pkg.id] || PLAN_COLORS.free;
          const isEditing = editingId === pkg.id;
          const draft = isEditing && editDraft ? editDraft : pkg;

          return (
            <div
              key={pkg.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm flex flex-col h-full overflow-hidden transition-all ${
                pkg.highlighted
                  ? 'border-violet-300 dark:border-violet-700 shadow-violet-100 dark:shadow-violet-900/20 ring-1 ' + colors.ring
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card Header Gradient Bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${colors.gradient}`} />

              <div className="p-5 flex-1 flex flex-col">
                {/* Plan Title Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                      {PLAN_ICONS[pkg.id]}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          className="font-bold text-slate-900 dark:text-white text-base bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none w-24"
                          value={draft.name}
                          readOnly
                        />
                      ) : (
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{pkg.name}</h3>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${
                        pkg.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {pkg.status}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg transition-colors"
                          title="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(pkg)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand rounded-lg transition-colors"
                          title="Edit plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(pkg.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            pkg.status === 'Active'
                              ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={pkg.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {pkg.status === 'Active'
                            ? <ToggleRight className="w-5 h-5" />
                            : <ToggleLeft className="w-5 h-5" />
                          }
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-500">LKR</span>
                      <input
                        type="number"
                        min={0}
                        value={draft.price}
                        onChange={e => setEditDraft({ ...editDraft!, price: Number(e.target.value) })}
                        className="w-28 font-bold text-2xl text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none focus:border-brand"
                      />
                      <span className="text-slate-500 text-sm">/ mo</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      {pkg.price === 0 ? (
                        <span className="text-2xl font-black text-slate-900 dark:text-white">Free</span>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-slate-500 self-start mt-1">LKR</span>
                          <span className="text-2xl font-black text-slate-900 dark:text-white">{pkg.price.toLocaleString()}</span>
                          <span className="text-slate-500 text-xs">{pkg.billing}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={draft.description}
                    onChange={e => setEditDraft({ ...editDraft!, description: e.target.value })}
                    className="w-full text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-brand resize-none mb-4"
                  />
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[2.5rem] line-clamp-2">{pkg.description}</p>
                )}

                {/* Max Hotels */}
                <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <Package className="w-3.5 h-3.5 text-brand" />
                  Max Hotels:&nbsp;
                  {isEditing ? (
                    <input
                      type="number"
                      min={1}
                      value={draft.maxHotels === Infinity ? 9999 : draft.maxHotels}
                      onChange={e => setEditDraft({ ...editDraft!, maxHotels: Number(e.target.value) >= 9999 ? Infinity : Number(e.target.value) })}
                      className="w-16 font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 outline-none"
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white">
                      {pkg.maxHotels === Infinity ? 'Unlimited' : pkg.maxHotels}
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">Features</p>
                  <ul className="space-y-2">
                    {draft.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="flex-1">{feat}</span>
                        {isEditing && (
                          <button
                            onClick={() => removeFeature(idx)}
                            className="text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {isEditing && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addFeature()}
                        placeholder="Add feature..."
                        className="flex-1 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-brand"
                      />
                      <button
                        onClick={addFeature}
                        className="bg-brand/10 hover:bg-brand/20 text-brand rounded-lg px-3 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Badge editor */}
                {isEditing && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Badge label:</span>
                    <input
                      type="text"
                      value={draft.badge || ''}
                      onChange={e => setEditDraft({ ...editDraft!, badge: e.target.value })}
                      placeholder="e.g. Most Popular"
                      className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-brand"
                    />
                  </div>
                )}
              </div>

              {/* Badge pill at bottom if not editing */}
              {!isEditing && (
                <div className="px-5 pb-4 min-h-[32px] flex items-center">
                  {pkg.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colors.badge}`}>
                      ★ {pkg.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-2xl p-5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4 text-brand" />
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">New Signup Default Plan</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Every new user who signs up automatically starts with the <span className="font-semibold text-brand">Free package</span> by default.
          </p>
        </div>
      </div>
    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <AdminPackages {...props} />
    </DashboardLayout>
  );
}
