"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell,
    Check,
    Trash2,
    CheckCheck,
    Inbox,
    Search,
    Calendar,
    Tag,
    MessageSquare,
    Info,
    Clock,
    Sparkles,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationItem {
    _id: string;
    title: string;
    message: string;
    type: 'booking_status' | 'offer' | 'review_reply' | 'info';
    read: boolean;
    createdAt: string;
    relatedId?: string;
}

function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const fetchNotifications = () => {
        if (!user?.email) return;
        setLoading(true);
        fetch('/api/notifications', {
            headers: {
                'X-Recipient-Email': user.email
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load notifications');
                return res.json();
            })
            .then((data: NotificationItem[]) => {
                let filtered = data || [];
                if (user) {
                    const isUserAdmin = user.isAdmin || user.email?.toLowerCase() === 'admin@yme.lk';
                    if (isUserAdmin) {
                        filtered = filtered.filter(n => {
                            const titleLower = n.title.toLowerCase();
                            const messageLower = n.message.toLowerCase();
                            return (
                                titleLower.includes('registration') ||
                                titleLower.includes('register') ||
                                titleLower.includes('operator') ||
                                messageLower.includes('registered') ||
                                messageLower.includes('operator') ||
                                titleLower.includes('application')
                            );
                        });
                    } else if (user.isPartner) {
                        filtered = filtered.filter(n => n.type === 'booking_status' || n.type === 'review_reply');
                    } else {
                        // Normal user (traveler)
                        filtered = filtered.filter(n => n.type === 'booking_status' || n.type === 'review_reply');
                    }
                }
                setNotifications(filtered);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const getFilterTabs = () => {
        const isUserAdmin = user?.isAdmin || user?.email?.toLowerCase() === 'admin@yme.lk';
        if (isUserAdmin) {
            return [
                { id: 'all', label: 'All', icon: Filter },
                { id: 'info', label: 'Registrations', icon: Info },
            ];
        }
        if (user?.isPartner) {
            return [
                { id: 'all', label: 'All', icon: Filter },
                { id: 'booking_status', label: 'Bookings', icon: Calendar },
                { id: 'review_reply', label: 'Reviews', icon: MessageSquare },
            ];
        }
        return [
            { id: 'all', label: 'All', icon: Filter },
            { id: 'booking_status', label: 'My Bookings', icon: Calendar },
            { id: 'review_reply', label: 'Host Replies', icon: MessageSquare },
        ];
    };

    useEffect(() => {
        fetchNotifications();
    }, [user?.email]);

    const handleMarkAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));

            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT'
            });
            if (!res.ok) throw new Error('Failed to mark notification as read');
        } catch (err) {
            console.error(err);
            toast.error('Could not mark notification as read');
            fetchNotifications();
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user?.email || notifications.every(n => n.read)) return;
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');

            const res = await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'X-Recipient-Email': user.email
                }
            });
            if (!res.ok) throw new Error('Failed to mark all as read');
        } catch (err) {
            console.error(err);
            toast.error('Failed to mark all as read');
            fetchNotifications();
        }
    };

    const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification cleared');

            const res = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete notification');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete notification');
            fetchNotifications();
        }
    };

    // Helper properties
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'booking_status':
                return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'offer':
                return <Tag className="w-4 h-4 text-emerald-500" />;
            case 'review_reply':
                return <MessageSquare className="w-4 h-4 text-purple-500" />;
            default:
                return <Info className="w-4 h-4 text-slate-500" />;
        }
    };

    const getNotificationStyle = (type: string, read: boolean) => {
        const base = "p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 relative flex gap-3 sm:gap-4 items-start ";
        if (!read) {
            switch (type) {
                case 'booking_status':
                    return base + "bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 hover:border-blue-200 border-l-4 border-l-brand";
                case 'offer':
                    return base + "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-200 border-l-4 border-l-brand";
                case 'review_reply':
                    return base + "bg-purple-50/40 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/30 hover:border-purple-200 border-l-4 border-l-brand";
                default:
                    return base + "bg-brand/5 dark:bg-brand/10 border-brand/10 dark:border-brand/20 hover:border-brand/20 border-l-4 border-l-brand";
            }
        }
        return base + "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700/80";
    };

    const formatDistance = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMin = Math.round(diffMs / 60000);
            const diffHrs = Math.round(diffMs / 3600000);
            const diffDays = Math.round(diffMs / 86400000);

            if (diffMin < 1) return 'Just now';
            if (diffMin < 60) return `${diffMin}m ago`;
            if (diffHrs < 24) return `${diffHrs}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch {
            return 'Just now';
        }
    };

    const filteredNotifs = notifications.filter(n => {
        const matchesFilter = activeFilter === 'all' || n.type === activeFilter;
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div id="notifications-hub" className="max-w-6xl mx-auto space-y-4">
            {/* Header and Quick Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                        <Bell className="w-5 h-5 text-brand" />
                        <span>Notification Hub</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Stay updated with your bookings, live promotions, and review replies
                    </p>
                </div>

                {unreadCount > 0 && (
                    <button
                        id="mark-all-read-btn"
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                        <CheckCheck className="w-4 h-4 text-brand" />
                        <span>Mark all read ({unreadCount})</span>
                    </button>
                )}
            </div>

            {/* Control Panel: Filters & Search */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center justify-between shadow-xs">
                {/* Filter categories */}
                <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
                    {getFilterTabs().map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeFilter === f.id
                                    ? 'bg-brand text-white shadow-sm shadow-brand/10'
                                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <f.icon className="w-3.5 h-3.5" />
                            <span>{f.label}</span>
                        </button>
                    ))}
                </div>

                {/* Search input */}
                <div className="relative w-full lg:w-64 shrink-0">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notifications..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-950 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                </div>
            </div>

            {/* Notifications List Container */}
            <div className="space-y-3.5">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-white dark:bg-slate-950 h-24 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-5 flex items-start gap-3">
                                <div className="w-10 h-10 bg-slate-150 dark:bg-slate-800 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-slate-150 dark:bg-slate-800 rounded-md w-1/4" />
                                    <div className="h-3 bg-slate-150 dark:bg-slate-800 rounded-md w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifs.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {filteredNotifs.map((n) => (
                            <motion.div
                                key={n._id}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                                onClick={() => !n.read && handleMarkAsRead(n._id)}
                                className={getNotificationStyle(n.type, n.read)}
                            >
                                {/* Left icon wrapper */}
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shrink-0 shadow-xs">
                                    {getNotificationIcon(n.type)}
                                </div>

                                {/* Main text area */}
                                <div className="flex-1 min-w-0 pr-1 sm:pr-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className={`text-xs tracking-tight text-slate-900 dark:text-white ${!n.read ? 'font-bold' : 'font-medium'}`}>
                                            {n.title}
                                        </h4>

                                        {/* Badge type indicators */}
                                        <span className="text-xs font-bold uppercase tracking-wider scale-95 opacity-80">
                                            {n.type === 'booking_status' && <span className="text-blue-500">Trip</span>}
                                            {n.type === 'offer' && <span className="text-emerald-500">Offer</span>}
                                            {n.type === 'review_reply' && <span className="text-purple-500">Reply</span>}
                                            {n.type === 'info' && <span className="text-slate-500">General</span>}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 dark:text-slate-355 mt-1 leading-relaxed">
                                        {n.message}
                                    </p>

                                    <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-400 dark:text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDistance(n.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Right hand buttons */}
                                <div className="flex items-center gap-1 shrink-0 self-center sm:self-start mt-0.5 sm:mt-0">
                                    {!n.read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(n._id);
                                            }}
                                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => handleDeleteNotification(n._id, e)}
                                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 active:scale-95 transition-all cursor-pointer"
                                        title="Dismiss notification"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
                            <Inbox className="w-7 h-7 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">No notifications found</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                            {searchQuery || activeFilter !== 'all'
                                ? "No alerts match your current search queries or selected filters."
                                : "You are completely up to date! Future status changes and offers will appear here."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <NotificationsPage {...props} />
    </DashboardLayout>
  );
}
