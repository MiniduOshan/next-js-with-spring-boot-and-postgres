"use client";

import { Star, MoreVertical, MessageCircle, Send, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useAuth } from "@/components/AuthContext";

export default function Reviews() {
  const { user, activeHotel } = useAuth();
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = { "X-Owner-Email": user?.email || "" };
      if (activeHotel) {
        headers["X-Hotel-Id"] = activeHotel._id;
      }
      const res = await fetch("/api/reviews", { headers });
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?.email, activeHotel?._id]);

  const handleDelete = async () => {
    if (reviewToDelete !== null) {
      try {
        const res = await fetch(`/api/reviews/${reviewToDelete}`, {
          method: "DELETE",
          headers: {
            "X-Owner-Email": user?.email || ""
          }
        });
        if (res.ok) {
          setReviewsList(reviewsList.filter(r => r._id !== reviewToDelete));
        }
      } catch (err) {
        console.error("Error deleting review:", err);
      } finally {
        setReviewToDelete(null);
      }
    }
  };

  const handlePostReply = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Owner-Email": user?.email || ""
        },
        body: JSON.stringify({ reply: replyText })
      });
      if (res.ok) {
        const updated = await res.json();
        setReviewsList(reviewsList.map(r => r._id === id ? updated : r));
      }
      setActiveReply(null);
      setEditingReply(null);
      setReplyText("");
    } catch (err) {
      console.error("Error posting reply:", err);
    }
  };

  const startEditReply = (r: any) => {
    setEditingReply(r._id);
    setReplyText(r.reply || "");
  };

  const startReply = (id: string) => {
    setActiveReply(id);
    setReplyText("");
  };

  const isMockAllowed = user?.email?.toLowerCase() === "partner@yme.lk";

  const calculateStats = () => {
    if (reviewsList.length === 0) {
      return {
        avg: isMockAllowed ? "9.2" : "0.0",
        label: isMockAllowed ? "Superb" : "No Reviews",
        dist: [
          { s: 5, w: isMockAllowed ? "w-[85%]" : "w-[0%]" },
          { s: 4, w: isMockAllowed ? "w-[10%]" : "w-[0%]" },
          { s: 3, w: isMockAllowed ? "w-[5%]" : "w-[0%]" },
          { s: 2, w: "w-[0%]" },
          { s: 1, w: "w-[0%]" }
        ]
      };
    }
    const total = reviewsList.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    const avgScoreOutOf5 = reviewsList.length > 0 ? total / reviewsList.length : 0;
    const avgScoreOutOf10 = (Number(avgScoreOutOf5 || 0) * 2).toFixed(1);

    // Distribution
    const count = reviewsList.length;
    const dist = [5, 4, 3, 2, 1].map(star => {
      const starCount = reviewsList.filter(r => Number(r.score) === star).length;
      const pct = count > 0 ? (starCount / count) * 100 : 0;
      return { s: star, w: `w-[${(Number(pct) || 0).toFixed(0)}%]` };
    });

    let label = "Good";
    if (avgScoreOutOf5 >= 4.5) label = "Superb";
    else if (avgScoreOutOf5 >= 4.0) label = "Very Good";

    return { avg: avgScoreOutOf10, label, dist };
  };

  const statResult = calculateStats();

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Guest Reviews</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and respond to feedback from your recent guests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm text-center">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Overall Rating</h3>
            <div className="inline-flex items-center justify-center bg-brand text-white text-xl w-24 h-24 rounded-full font-bold mb-4 border-4 border-brand-light">
              {statResult.avg}
            </div>
            <p className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{statResult.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Based on actual reviews</p>

            <div className="space-y-2">
              {statResult.dist.map(b => (
                <div key={b.s} className="flex flex-row items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-3">{b.s}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-amber-400 ${b.w}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="flex gap-2">
            <button className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium">All Reviews</button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading feedback...</div>
            ) : reviewsList.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                <p className="text-slate-500 dark:text-slate-400">No reviews found.</p>
              </div>
            ) : reviewsList.map(r => (
              <div key={r._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-3 group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white">{r.guest}</div>
                      <span className="text-xs text-slate-400">• {r.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.score ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`} />)}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{r.room}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewToDelete(r._id)}
                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-sm">"{r.text}"</p>

                {r.reply && editingReply !== r._id ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 ml-6 border border-slate-100 dark:border-slate-800 relative before:content-[''] before:absolute before:left-[-12px] before:top-4 before:border-[6px] before:border-transparent before:border-r-slate-100 group/reply">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-xs text-brand">Your Reply</span>
                      <button
                        onClick={() => startEditReply(r)}
                        className="text-slate-400 hover:text-brand opacity-0 group-hover/reply:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{r.reply}</p>
                  </div>
                ) : activeReply === r._id || editingReply === r._id ? (
                  <div className="ml-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <textarea
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${r.guest}...`}
                      autoFocus
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setActiveReply(null); setEditingReply(null); }}
                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePostReply(r._id)}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand-hover flex items-center gap-2 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> {editingReply === r._id ? 'Save Edit' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => startReply(r._id)} className="flex w-max items-center gap-2 text-brand text-sm font-medium hover:underline ml-1">
                    <MessageCircle className="w-4 h-4" /> Reply to Review
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={reviewToDelete !== null}
        onClose={() => setReviewToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />
    </div>
  );
}
