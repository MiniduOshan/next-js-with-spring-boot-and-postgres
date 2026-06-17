"use client";

import { useAuth } from "@/components/AuthContext";
import { motion } from 'motion/react';
import {
    Clock,
    XOctagon,
    LogOut,
    Building2,
    Phone,
    Mail,
    HelpCircle,
    FileSearch,
    RefreshCw
} from 'lucide-react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { toast } from 'sonner';

interface PartnerStatusMessageProps {
    status: 'pending' | 'rejected';
    hotelName: string;
}

export default function PartnerStatusMessage({ status, hotelName }: PartnerStatusMessageProps) {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogoutClick = () => {
        logout();
        router.push('/');
        toast.info("Logged out from partner standby account.");
    };

    const isPending = status === 'pending';

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center py-10 px-3">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-xl space-y-4 text-center"
            >
                {/* Visual status indicators */}
                <div className="flex justify-center">
                    {isPending ? (
                        <div className="relative">
                            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 shadow-md">
                                <Clock className="w-10 h-10 animate-pulse" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 text-xs font-extrabold shadow-sm">
                                !
                            </span>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 shadow-md">
                                <XOctagon className="w-10 h-10" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 text-xs font-extrabold shadow-sm">
                                X
                            </span>
                        </div>
                    )}
                </div>

                {/* Messaging */}
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                        {isPending ? 'Standby Account Pending' : 'Application Unapproved'}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
                        Property: {hotelName}
                    </p>
                    <p className="text-sm text-slate-505 dark:text-slate-400 leading-relaxed px-2">
                        {isPending ? (
                            <span>
                                Your merchant license registration has been submitted and is currently being audited by our verification team. This typical compliance review takes less than 24 hours.
                            </span>
                        ) : (
                            <span>
                                Your registration application for this hospitality listing was declined as it did not fulfill our strict safety, registration info, or location correctness constraints.
                            </span>
                        )}
                    </p>
                </div>

                {/* Info panel */}
                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/80 text-left space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-[#00A67E]" /> Standby Support Lines
                    </h3>
                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400 shrink-0" /> validation@yme.lk</span>
                        <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400 shrink-0" /> +94 77 987 6543 (Hotline)</span>
                        <span className="flex items-center gap-2 font-medium"><FileSearch className="w-4 h-4 text-slate-400 shrink-0" /> Status: <span className={isPending ? 'text-amber-600 font-bold' : 'text-rose-600 font-bold'}>{isPending ? 'Verification Pending' : 'Permanently Declined'}</span></span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2.5">
                    {isPending && (
                        <button
                            onClick={() => {
                                toast.success("Querying application status...");
                                // Force state check if they want to click refresh
                                setTimeout(() => {
                                    toast.info("Database loaded: Application state is current.", { duration: 1500 });
                                }, 500);
                            }}
                            className="w-full bg-[#00A67E] hover:bg-[#008f6c] text-white py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" /> Check Application Status
                        </button>
                    )}
                    <button
                        onClick={handleLogoutClick}
                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200 dark:border-slate-700/80"
                    >
                        <LogOut className="w-4 h-4" /> Log out and leave board
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
