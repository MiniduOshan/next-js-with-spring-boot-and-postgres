"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { Users, Crown, Zap, Gift, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PartnerUsage {
  _id: string;
  email: string;
  plan: string;
  totalBookings: number;
  totalHotels: number;
  pendingCommission: number;
  upgradeEmailSent?: boolean;
}

const PLAN_BADGES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Free: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: <Gift className="w-3.5 h-3.5" /> },
  Pro: { bg: 'bg-brand/10 dark:bg-brand/20', text: 'text-brand', icon: <Zap className="w-3.5 h-3.5" /> },
  Premium: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400', icon: <Crown className="w-3.5 h-3.5" /> },
};

export default function AdminPartnerUsage() {
  const [partners, setPartners] = useState<PartnerUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPartnerUsages();
  }, []);

  const fetchPartnerUsages = async () => {
    try {
      const response = await fetch('/api/admin/partner-usages');
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setPartners(data);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch partner usages, using fallback data', err);
    }

    // Fallback dummy partners for demo
    const dummyPartners: PartnerUsage[] = [
      { _id: "1", email: "john.partner@example.com", plan: "Free", totalBookings: 8, totalHotels: 2, pendingCommission: 500, upgradeEmailSent: true },
      { _id: "2", email: "sarah.premium@hotels.com", plan: "Premium", totalBookings: 45, totalHotels: 5, pendingCommission: 2800, upgradeEmailSent: false },
      { _id: "3", email: "new.hotelier@test.com", plan: "Free", totalBookings: 2, totalHotels: 1, pendingCommission: 0, upgradeEmailSent: true },
      { _id: "4", email: "enterprise.group@corp.com", plan: "Pro", totalBookings: 15, totalHotels: 4, pendingCommission: 2250, upgradeEmailSent: false }
    ];
    setPartners(dummyPartners);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" /> Partner Plan Usages
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor partner plans, bookings limits, and pending commissions.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Partner Email</th>
                <th className="px-6 py-4 font-medium">Current Plan</th>
                <th className="px-6 py-4 font-medium">Hotels (Used/Max)</th>
                <th className="px-6 py-4 font-medium">Bookings (Total)</th>
                <th className="px-6 py-4 font-medium">Pending Commission</th>
                <th className="px-6 py-4 font-medium">Upgrade Email</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading partners...</td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No partner usages found.</td>
                </tr>
              ) : (
                partners.map(partner => {
                  const badge = PLAN_BADGES[partner.plan] || PLAN_BADGES['Free'];
                  const maxHotels = partner.plan === 'Free' ? '3' : partner.plan === 'Pro' ? '10' : '∞';
                  
                  return (
                    <tr key={partner._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {partner.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          {badge.icon}
                          {partner.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {partner.totalHotels} / {maxHotels}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {partner.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                        LKR {partner.pendingCommission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {partner.plan !== 'Free' ? (
                          partner.upgradeEmailSent === false ? (
                            <span 
                              onClick={() => router.push(`/dashboard/communications?email=${encodeURIComponent(partner.email)}&template=upgrade`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
                              title="Click to send upgrade notification"
                            >
                              ⚠️ Pending Send
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              ✅ Sent
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            const templateQuery = partner.upgradeEmailSent === false ? '&template=upgrade' : '';
                            router.push(`/dashboard/communications?email=${encodeURIComponent(partner.email)}${templateQuery}`);
                          }}
                          className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-brand hover:bg-brand/10 rounded-xl transition-colors"
                          title="Compose message in Communications"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
