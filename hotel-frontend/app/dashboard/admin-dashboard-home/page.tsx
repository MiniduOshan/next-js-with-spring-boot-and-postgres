"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import {
    Shield,
    Users,
    Building2,
    Clock,
    ArrowRight,
    CheckCircle2,
    XCircle,
    TrendingUp,
    ShieldCheck,
    FileText,
    Package,
    Mail,
    BookOpen,
    CreditCard
} from 'lucide-react';

function AdminDashboardHome() {
    const { user, getPartners } = useAuth();
    const partners = getPartners();

    const pendingCount = partners.filter(p => p.hotelStatus === 'pending').length;
    const approvedCount = partners.filter(p => p.hotelStatus === 'approved' || !p.hotelStatus).length;
    const rejectedCount = partners.filter(p => p.hotelStatus === 'rejected').length;
    const totalCount = partners.length;

    return (
        <div className="max-w-6xl mx-auto space-y-4">



            {/* Admin Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <Link href="/dashboard/users" className="bg-white dark:bg-slate-900 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-brand">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-bold text-center">Manage Users</span>
                </Link>
                <Link href="/dashboard/communications" className="bg-white dark:bg-slate-900 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-brand">
                    <Mail className="w-5 h-5" />
                    <span className="text-xs font-bold text-center">Communications</span>
                </Link>
                <Link href="/dashboard/admin-bookings" className="bg-white dark:bg-slate-900 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-brand">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-bold text-center">Bookings</span>
                </Link>
                <Link href="/dashboard/price-plans" className="bg-white dark:bg-slate-900 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-slate-600 dark:text-slate-400 hover:text-brand">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs font-bold text-center">Price Plans</span>
                </Link>
            </div>
            {/* Admin stats bento layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 text-slate-705 dark:text-slate-200 rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded-md font-semibold">Total Partners</span>
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Registered Operators</h3>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl">
                            <Clock className="w-5 h-5" />
                        </div>
                        {pendingCount > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-700 animate-pulse px-2 py-0.5 rounded-md font-semibold">Needs Attention</span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Pending Approval</h3>
                        <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-semibold font-mono">Live</span>
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Active Listings</h3>
                        <p className="text-lg font-bold text-[#00A67E]">{approvedCount}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-semibold">Declined</span>
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Rejected Applications</h3>
                        <p className="text-lg font-bold text-rose-600">{rejectedCount}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Pending approvals teaser card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                            Pending Applications Queue
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                        </h2>
                        <p className="text-xs text-slate-450 dark:text-slate-500">
                            New hotel partner accounts waiting for document and integrity checks.
                        </p>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {partners.filter(p => p.hotelStatus === 'pending').slice(0, 3).map((p) => (
                            <div key={p.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                                        {p.hotelName?.[0] || 'H'}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{p.hotelName || 'My Hotel'}</h4>
                                        <span className="text-xs text-slate-400">{p.hotelCity} • Owned by {p.name}</span>
                                    </div>
                                </div>
                                <Link href="/dashboard/approvals" className="p-1 px-3 text-xs font-bold text-brand border border-brand/20 hover:bg-brand hover:text-white rounded-lg transition-all">
                                    Audit Details
                                </Link>
                            </div>
                        ))}

                        {pendingCount === 0 && (
                            <div className="py-10 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                                <ShieldCheck className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                                <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">Clear queue. All registrations have been audited!</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-855 flex justify-end">
                        <Link href="/dashboard/approvals" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
                            Open Full Approvals Center <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Administration Guidelines */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-6 flex flex-col justify-between">
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-[#00A67E]" />
                            Compliance Code
                        </h3>
                        <ul className="space-y-3.5">
                            <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <span>Verify that any contact telephone provided matches a legal representative located in Sri Lanka.</span>
                            </li>
                            <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <span>Confirm of official email verification matching listed domains before final merchant license dispatch.</span>
                            </li>
                            <li className="flex gap-2.5 items-start text-xs text-slate-600 dark:text-slate-400">
                                <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <span>In case of safety flags, suspend listing instantly pending internal evaluation from safety board.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-855 text-center">
                        <span className="block text-xs font-mono text-slate-400 uppercase tracking-widest leading-none">
                            Portal Engine: v1.8.2-Alpha
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <AdminDashboardHome {...props} />
    </DashboardLayout>
  );
}
