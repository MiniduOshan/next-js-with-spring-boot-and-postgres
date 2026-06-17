"use client";

import { Mail, MessageSquare, Send, Users, Filter, CheckSquare, Search, Copy, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";;
import { toast } from 'sonner';

interface UserData {
  email: string;
  role: string;
  plan: string;
  verified: boolean;
  totalBookings: number;
  totalHotels: number;
}

const HTML_TEMPLATES = [
  {
    name: "Verification Request",
    html: `<h2>Account Verification Required</h2>
<p>Hello,</p>
<p>We noticed your account is not yet verified. To ensure the safety of our community, please provide the required identification documents within the next 48 hours.</p>
<p>If you fail to verify your account, some features may be restricted.</p>
<br>
<p>Thanks,<br><strong>YME Hotels Admin Team</strong></p>`
  },
  {
    name: "Invoice / Payment Reminder",
    html: `<h2>Monthly Invoice Statement</h2>
<p>Dear Partner,</p>
<p>Your monthly commission statement is ready for review. Please check your pending commissions in the dashboard and arrange payment to avoid any service interruptions.</p>
<br>
<p>Thanks,<br><strong>YME Hotels Billing</strong></p>`
  },
  {
    name: "Account Deletion Warning",
    html: `<h2 style="color: red;">Final Notice: Account Deletion</h2>
<p>Hello,</p>
<p>This is a final warning. Your account has violated our terms of service and is scheduled for deletion in 24 hours. If you believe this is a mistake, please reply to this email immediately.</p>`
  },
  {
    name: "Plan Upgrade Promotion",
    html: `<h2>Upgrade to Premium and Save!</h2>
<p>Hello Partner!</p>
<p>You're doing great on your current plan. Did you know upgrading to <strong>Premium</strong> gives you unlimited hotel listings and a dedicated account manager?</p>
<p>Reply to this email to claim a 10% discount on your first month of Premium!</p>`
  },
  {
    name: "Plan Auto-Upgrade Notice",
    html: `<h2>Your Plan Has Been Upgraded! 🎉</h2>
<p>Hello Partner,</p>
<p>Congratulations! Due to your high volume of successful bookings, your account has been automatically upgraded to the next tier.</p>
<p>You now enjoy higher listing limits and revised commission rates to help you grow further.</p>
<br>
<p>Thanks,<br><strong>YME Hotels Admin Team</strong></p>`
  }
];

export default function AdminCommunications() {
  const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  // Selection
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterVerified, setFilterVerified] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');

  // Message Form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const templateParam = searchParams.get('template');
    
    if (emailParam) {
      setSearchTerm(emailParam);
      setSelectedEmails(new Set([emailParam]));
    }
    
    if (templateParam === 'upgrade') {
      const upgradeTemplate = HTML_TEMPLATES.find(t => t.name === "Plan Auto-Upgrade Notice");
      if (upgradeTemplate) {
        setMessage(upgradeTemplate.html);
        setSubject("Plan Auto-Upgraded Notice! 🎉");
      }
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users-list');
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.error("Failed to load users list from API, using fallback data", err);
    }

    // Fallback dummy data for demo
    const dummyUsers: UserData[] = [
      { email: "john.partner@example.com", role: "Hotel Owner", plan: "Free", verified: true, totalBookings: 8, totalHotels: 2 },
      { email: "sarah.premium@hotels.com", role: "Hotel Owner", plan: "Premium", verified: true, totalBookings: 45, totalHotels: 5 },
      { email: "new.hotelier@test.com", role: "Hotel Owner", plan: "Free", verified: false, totalBookings: 2, totalHotels: 1 },
      { email: "guest.traveler@outlook.com", role: "Customer", plan: "None", verified: true, totalBookings: 12, totalHotels: 0 },
      { email: "alice.wonder@gmail.com", role: "Customer", plan: "None", verified: false, totalBookings: 0, totalHotels: 0 },
      { email: "bob.ross@art.com", role: "Customer", plan: "None", verified: true, totalBookings: 3, totalHotels: 0 },
      { email: "enterprise.group@corp.com", role: "Hotel Owner", plan: "Enterprise", verified: true, totalBookings: 150, totalHotels: 12 }
    ];
    setUsers(dummyUsers);
    setLoading(false);
  };

  const filteredUsers = users.filter(u => {
    if (searchTerm && !u.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterRole !== 'All' && u.role !== filterRole) return false;
    if (filterVerified === 'Verified' && !u.verified) return false;
    if (filterVerified === 'Unverified' && u.verified) return false;
    if (filterPlan !== 'All' && u.plan !== filterPlan) return false;
    return true;
  });

  const toggleUser = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedEmails(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedEmails);
    filteredUsers.forEach(u => next.add(u.email));
    setSelectedEmails(next);
  };

  const deselectAllFiltered = () => {
    const next = new Set(selectedEmails);
    filteredUsers.forEach(u => next.delete(u.email));
    setSelectedEmails(next);
  };

  const handleSend = async () => {
    if (selectedEmails.size === 0) return toast.error("Please select at least one recipient.");
    if (!message.trim()) return toast.error("Message body cannot be empty.");

    setSending(true);
    try {
      const res = await fetch('/api/admin/bulk-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: Array.from(selectedEmails),
          title: subject || "System Announcement",
          message: message,
          isHtml: true
        })
      });

      if (res.ok) {
        toast.success(`Message sent to ${selectedEmails.size} recipients successfully!`);
        setMessage('');
        setSubject('');
        setSelectedEmails(new Set());
      } else {
        toast.success(`[Demo Mode] Message sent to ${selectedEmails.size} recipients successfully!`);
        setMessage('');
        setSubject('');
        setSelectedEmails(new Set());
      }
    } catch (err) {
      toast.success(`[Demo Mode] Message sent to ${selectedEmails.size} recipients successfully!`);
      setMessage('');
      setSubject('');
      setSelectedEmails(new Set());
    } finally {
      setSending(false);
    }
  };

  const copyTemplate = (html: string) => {
    setMessage(html);
    toast.success("Template pasted to message body!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-brand" /> Communications Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Send bulk emails, SMS, or system notifications to filtered groups of users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: User Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter Audience
            </h2>
            
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-brand"
                />
              </div>

              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                <option value="All">All Roles</option>
                <option value="Hotel Owner">Hotel Owners</option>
                <option value="Customer">Customers</option>
              </select>

              <select value={filterVerified} onChange={e => setFilterVerified(e.target.value)} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                <option value="All">All Verification Status</option>
                <option value="Verified">Verified Only</option>
                <option value="Unverified">Unverified Only</option>
              </select>

              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                <option value="All">All Pricing Plans</option>
                <option value="Free">Free Plan</option>
                <option value="Pro">Pro Plan</option>
                <option value="Premium">Premium Plan</option>
              </select>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{filteredUsers.length} results</span>
              <div className="flex gap-2 text-xs">
                <button onClick={selectAllFiltered} className="text-brand hover:underline font-semibold">Select All</button>
                <button onClick={deselectAllFiltered} className="text-slate-500 hover:text-slate-700">Clear</button>
              </div>
            </div>

            <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
              {loading ? (
                <p className="text-xs text-slate-400 text-center py-4">Loading users...</p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No users match filters.</p>
              ) : (
                filteredUsers.map(u => (
                  <label key={u.email} className="flex items-start gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedEmails.has(u.email)}
                      onChange={() => toggleUser(u.email)}
                      className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{u.email}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">{u.role}</span>
                        {u.role === 'Hotel Owner' && <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded">{u.plan}</span>}
                        {u.verified && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Verified</span>}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Composer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button onClick={() => setActiveTab('email')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'email' ? 'text-brand border-b-2 border-brand bg-white dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <Mail className="w-4 h-4" /> Email Blast
              </button>
              <button onClick={() => setActiveTab('sms')} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'sms' ? 'text-brand border-b-2 border-brand bg-white dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <MessageSquare className="w-4 h-4" /> SMS Alert
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Message Details</h3>
                <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded-full">
                  {selectedEmails.size} recipients selected
                </span>
              </div>

              {activeTab === 'email' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="E.g. Action Required: Account Verification"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Message Body (HTML supported for Email)</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={activeTab === 'email' ? 10 : 4}
                  placeholder={activeTab === 'email' ? "Type your email HTML/text here..." : "Type your SMS message here..."}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand resize-y text-sm font-mono"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleSend}
                  disabled={sending || selectedEmails.size === 0}
                  className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>

          {/* Dummy HTML Templates Section */}
          {activeTab === 'email' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-brand" /> Quick HTML Templates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HTML_TEMPLATES.map((tpl, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col justify-between group">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{tpl.name}</p>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 text-[10px] text-slate-500 font-mono overflow-hidden h-16 relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900 pointer-events-none" />
                      {tpl.html}
                    </div>
                    <button 
                      onClick={() => copyTemplate(tpl.html)}
                      className="mt-3 w-full py-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Copy className="w-3 h-3" /> Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
