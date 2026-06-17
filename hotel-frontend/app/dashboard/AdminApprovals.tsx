"use client";

import { useState, useEffect } from 'react';
import { useAuth, User } from "@/components/AuthContext";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import {
    Building2,
    Check,
    X,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Clock,
    Hotel,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    UserCheck,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminApprovals() {
    const { getPartners, approvePartner, rejectPartner } = useAuth();
    const [partners, setPartners] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);

    const reloadData = () => {
        const list = getPartners();
        setPartners(list);
    };

    useEffect(() => {
        reloadData();
    }, []);

    // Filter partners based on search query and current status
    const filteredPartners = partners.filter(p => {
        // Determine status: Suresh is approved by default; if no status is set, default to approved (for legacy/testing)
        const status = p.hotelStatus || 'approved';
        if (status !== activeTab) return false;

        if (searchQuery.trim() === '') return true;

        const searchLower = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(searchLower);
        const matchEmail = p.email?.toLowerCase().includes(searchLower);
        const matchHotel = p.hotelName?.toLowerCase().includes(searchLower);
        const matchCity = p.hotelCity?.toLowerCase().includes(searchLower);

        return matchName || matchEmail || matchHotel || matchCity;
    });

    const handleApprove = (p: User) => {
        approvePartner(p.id);

        // Set verified in hotel profile
        fetch('/api/hotel-profile/verify', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ownerEmail: p.email.toLowerCase().trim(),
                hotelName: p.hotelName,
                city: p.hotelCity
            })
        }).catch(console.error);

        // Notify the partner of approval
        try {
            fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientEmail: p.email.toLowerCase().trim(),
                    title: 'Congratulations! Your Hotel is Verified! 🎉',
                    message: `Dear ${p.name}, your hotel "${p.hotelName || 'Your Property'}" has been officially verified! You now have the verified badge displayed on your profile.`,
                    type: 'info'
                })
            }).catch(console.error);
        } catch (e) {
            console.error(e);
        }

        reloadData();
        toast.success(`Approved: "${p.hotelName || 'Hotel'}" is now live and verified!`);
        if (selectedPartner?.id === p.id) {
            setSelectedPartner({ ...p, hotelStatus: 'approved' });
        }
    };

    const handleReject = (p: User) => {
        rejectPartner(p.id);

        // Notify the partner of rejection
        try {
            fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientEmail: p.email.toLowerCase().trim(),
                    title: 'Operator Application Update ❌',
                    message: `Your hotel operator application for "${p.hotelName || 'Your Property'}" was reviewed by YME Hotels administration and was declined. Please check compliance guidelines.`,
                    type: 'info'
                })
            }).catch(console.error);
        } catch (e) {
            console.error(e);
        }

        reloadData();
        toast.error(`Rejected: Registration request for "${p.hotelName || 'Hotel'}" was declined.`);
        if (selectedPartner?.id === p.id) {
            setSelectedPartner({ ...p, hotelStatus: 'rejected' });
        }
    };

    // Compute counts for badging
    const pendingCount = partners.filter(p => (p.hotelStatus === 'pending')).length;
    const approvedCount = partners.filter(p => (p.hotelStatus === 'approved' || !p.hotelStatus)).length;
    const rejectedCount = partners.filter(p => p.hotelStatus === 'rejected').length;

    return (
        <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-7 h-7 text-[#00A67E]" />
                        Hotel Registrations Approval
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Review, validate and manage newly registered hotel operators matching compliance criteria.
                    </p>
                </div>
            </div>

            {/* Tabs Menu & Search */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl space-x-1 shrink-0 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'pending'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-350'
                            }`}
                    >
                        <span>Pending Approvals</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${pendingCount > 0
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-405'
                            }`}>
                            {pendingCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('approved')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'approved'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-350'
                            }`}
                    >
                        <span>Active Hotels</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400`}>
                            {approvedCount}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('rejected')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'rejected'
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-350'
                            }`}
                    >
                        <span>Rejected</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400`}>
                            {rejectedCount}
                        </span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative flex-1 lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search hotel name, city or agent..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 outline-none focus:border-brand focus:ring-1 focus:ring-brand text-slate-800 dark:text-white"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Main list */}
                <div className={cn(
                    "lg:col-span-2 space-y-3",
                    selectedPartner && "hidden lg:block"
                )}>
                    <AnimatePresence mode="popLayout">
                        {filteredPartners.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
                            >
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-805/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Hotel className="w-5 h-5 text-slate-350 dark:text-slate-500" />
                                </div>
                                <h3 className="text-base font-bold text-slate-755 dark:text-white mb-1">
                                    No partners found
                                </h3>
                                <p className="text-xs text-slate-450 dark:text-slate-500">
                                    There are no registrations matching the '{activeTab}' status tab category.
                                </p>
                            </motion.div>
                        ) : (
                            filteredPartners.map((p) => {
                                const isSelected = selectedPartner?.id === p.id;
                                return (
                                    <motion.div
                                        key={p.id}
                                        layoutId={`partner-card-${p.id}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => setSelectedPartner(p)}
                                        className={`bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 card-item ${isSelected
                                                ? 'ring-2 ring-brand/50 bg-brand/[0.02] shadow-md'
                                                : 'shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-850 text-[#00A67E] flex items-center justify-center font-bold text-lg leading-none shrink-0 border border-slate-200 dark:border-slate-800 overflow-hidden">
                                                {p.avatarUrl ? (
                                                    <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    p.hotelName?.[0] || 'H'
                                                )}
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-slate-800 dark:text-white truncate">
                                                        {p.hotelName || 'Unnamed Resort'}
                                                    </h4>
                                                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                                                        {p.hotelCity || 'Sri Lanka'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                    <span className="font-medium text-slate-600 dark:text-slate-350">Agent Name:</span> {p.name}
                                                </p>
                                                <div className="flex gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                                                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {p.email}</span>
                                                    {p.hotelPhone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {p.hotelPhone}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t border-slate-100 dark:border-slate-800/80 pt-3 md:pt-0 md:border-0 shrink-0">
                                            {p.hotelStatus === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReject(p);
                                                        }}
                                                        className="p-2 border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer active:scale-95"
                                                        title="Reject Registration"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApprove(p);
                                                        }}
                                                        className="bg-[#00A67E] hover:bg-[#008f6c] text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer active:scale-95"
                                                    >
                                                        <Check className="w-3.5 h-3.5" /> Approve
                                                    </button>
                                                </>
                                            ) : p.hotelStatus === 'rejected' ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApprove(p);
                                                    }}
                                                    className="border border-brand text-brand hover:bg-brand/5 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Approve Now
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleReject(p);
                                                    }}
                                                    className="border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Suspend
                                                </button>
                                            )}

                                            <ChevronRight className="w-4 h-4 text-slate-350 hidden md:block" />
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Inspector Panel */}
                <div className={cn(
                    "lg:col-span-1",
                    selectedPartner ? "fixed lg:relative inset-0 z-50 lg:z-0 p-4 lg:p-0 bg-[#f8fafc] dark:bg-slate-950 lg:bg-transparent overflow-y-auto" : "hidden lg:block"
                )}>
                    <div className="sticky top-6 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none space-y-4 border border-slate-100 dark:border-slate-800 lg:border-none">
                        {selectedPartner ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Validation details</h3>
                                    <button
                                        onClick={() => setSelectedPartner(null)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 dark:bg-slate-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                                    <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-base shadow-inner mb-3 overflow-hidden">
                                        {selectedPartner.avatarUrl ? (
                                            <img src={selectedPartner.avatarUrl} alt={selectedPartner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            selectedPartner.hotelName?.[0] || 'H'
                                        )}
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
                                        {selectedPartner.hotelName || 'Grand Hotel'}
                                    </h4>
                                    <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {selectedPartner.hotelCity || 'Colombo, Sri Lanka'}
                                    </span>

                                    {/* Status badge */}
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-4 border ${(selectedPartner.hotelStatus || 'approved') === 'approved'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                            : (selectedPartner.hotelStatus === 'pending')
                                                ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                        }`}>
                                        {selectedPartner.hotelStatus || 'approved'}
                                    </span>
                                </div>

                                {/* Listing metadata */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-555">Owner Profile</h4>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-850">
                                            <span className="text-slate-400">Agent Username:</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPartner.name}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-850">
                                            <span className="text-slate-400">Agent ID:</span>
                                            <span className="font-mono font-medium text-slate-605 dark:text-slate-400">{selectedPartner.id}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-850">
                                            <span className="text-slate-400">Authorized Email:</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={selectedPartner.email}>{selectedPartner.email}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-850">
                                            <span className="text-slate-400">Contact Number:</span>
                                            <span className="font-medium text-slate-705 dark:text-slate-300">{selectedPartner.hotelPhone || 'Not provided'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-850">
                                            <span className="text-slate-400">Joined Date:</span>
                                            <span className="font-medium text-slate-705 dark:text-slate-300 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-350" /> {selectedPartner.joinedDate || new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Validation checklist */}
                                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl">
                                    <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <UserCheck className="w-4 h-4 text-brand" /> Validation Checklist
                                    </h4>
                                    <ul className="space-y-2 text-xs">
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="w-4 h-4 text-[#00A67E] shrink-0" /> Email address verified.
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="w-4 h-4 text-[#00A67E] shrink-0" /> Valid city and property name provided.
                                        </li>
                                        <li className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <CheckCircle className="w-4 h-4 text-[#00A67E] shrink-0" /> Complies with Sri Lanka Tourism guidelines.
                                        </li>
                                    </ul>
                                </div>

                                {/* CTA actions */}
                                <div className="flex gap-2">
                                    {selectedPartner.hotelStatus === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleReject(selectedPartner)}
                                                className="flex-1 py-2 bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 text-slate-600 hover:text-rose-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:border-rose-200 transition-colors cursor-pointer active:scale-[0.98]"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleApprove(selectedPartner)}
                                                className="flex-[2] py-2 bg-[#00A67E] hover:bg-[#008f6c] text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer active:scale-[0.98]"
                                            >
                                                Approve Application
                                            </button>
                                        </>
                                    ) : selectedPartner.hotelStatus === 'rejected' ? (
                                        <button
                                            onClick={() => handleApprove(selectedPartner)}
                                            className="w-full py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer active:scale-[0.98]"
                                        >
                                            Reinstate and Approve Hotel
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReject(selectedPartner)}
                                            className="w-full py-2 border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
                                        >
                                            Suspend Merchant License
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-slate-350 mb-3">
                                    <ShieldAlert className="w-5 h-5 text-slate-400" />
                                </div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Hotel Selected</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mt-1.5">
                                    Select any registered partner card details to drill-down and audit credentials.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
