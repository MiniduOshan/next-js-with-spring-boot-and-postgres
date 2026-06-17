"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { Compass, Plus, MapPin, DollarSign, Clock, MessageSquare, CheckCircle, ChevronDown, ChevronUp, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  _id: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: string;
}

interface BidOffer {
  _id: string;
  hotelId: string;
  hotelName: string;
  ownerEmail: string;
  offerDetails: string;
  price: number;
  status: string;
  messages?: Message[];
  createdAt: string;
}

interface BidRequest {
  _id: string;
  location: string;
  budget: string;
  requirements: string;
  status: string;
  createdAt: string;
  offers?: BidOffer[];
  isExpanded?: boolean;
}

export default function TripRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BidRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  const [newLoc, setNewLoc] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newReqs, setNewReqs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [replyText, setReplyText] = useState<{ [offerId: string]: string }>({});

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bid-requests?userEmail=${user.email}`);
      const data = await res.json();
      setRequests(data.map((r: any) => ({ ...r, isExpanded: false, offers: [] })));
    } catch (err) {
      toast.error("Failed to load your trip requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async (reqId: string) => {
    try {
      const res = await fetch(`/api/bid-requests/${reqId}/offers`);
      const offers = await res.json();
      setRequests(prev => prev.map(r => 
        r._id === reqId ? { ...r, offers, isExpanded: true } : r
      ));
    } catch (err) {
      toast.error("Failed to load offers");
    }
  };

  const toggleExpand = (reqId: string, currentlyExpanded: boolean) => {
    if (!currentlyExpanded) {
      fetchOffers(reqId);
    } else {
      setRequests(prev => prev.map(r => r._id === reqId ? { ...r, isExpanded: false } : r));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc || !newBudget || !newReqs) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bid-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user?.email,
          userName: user?.name,
          location: newLoc,
          budget: newBudget,
          requirements: newReqs
        })
      });
      if (res.ok) {
        toast.success("Trip request posted! Hotels will start sending offers.");
        setShowNewModal(false);
        setNewLoc("");
        setNewBudget("");
        setNewReqs("");
        fetchRequests();
      } else {
        toast.error("Failed to post request");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (offerId: string, reqId: string) => {
    const text = replyText[offerId];
    if (!text?.trim()) return;
    try {
      const res = await fetch(`/api/bid-offers/${offerId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: user?.email,
          senderName: user?.name,
          senderRole: "Traveler",
          text
        })
      });
      if (res.ok) {
        setReplyText({ ...replyText, [offerId]: "" });
        fetchOffers(reqId); // Refresh offers to get the new message
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const acceptOffer = async (offerId: string) => {
    try {
      const res = await fetch(`/api/bid-offers/${offerId}/accept`, { method: "PUT" });
      if (res.ok) {
        toast.success("Offer accepted successfully! Have a great trip.");
        fetchRequests(); // reload everything
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to accept offer");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip request?")) return;
    try {
      const res = await fetch(`/api/bid-requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Trip request deleted");
        fetchRequests();
      } else {
        toast.error("Failed to delete request");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your requests...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand" />
            My Trip Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Post what you're looking for and let hotels send you custom offers.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active requests</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Planning a trip? Tell us your destination, budget, and requirements, and we'll broadcast it to our partner hotels.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-6 py-2.5 bg-brand text-white rounded-xl font-semibold shadow-md hover:bg-brand-hover transition-colors"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div 
                className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleExpand(req._id, req.isExpanded || false)}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md",
                        req.status === 'Open' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                        : req.status === 'Accepted' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand" /> {req.location}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-emerald-500" /> Budget: {req.budget}
                    </p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                      "{req.requirements}"
                    </div>
                  </div>
                  
                  <div className="flex items-center self-start md:self-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteRequest(req._id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Offers
                      {req.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {req.isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-900/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                    Offers from Hotels
                  </h4>
                  {req.offers && req.offers.length > 0 ? (
                    <div className="grid gap-4">
                      {req.offers.map((offer) => (
                        <div key={offer._id} className={cn(
                          "p-4 rounded-xl border transition-all",
                          offer.status === 'Accepted' ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800" 
                          : offer.status === 'Rejected' ? "bg-slate-100 border-slate-200 opacity-60 dark:bg-slate-800 dark:border-slate-700"
                          : "bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800"
                        )}>
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-bold text-slate-900 dark:text-white">{offer.hotelName}</h5>
                                {offer.status === 'Accepted' && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <CheckCircle className="w-3 h-3" /> ACCEPTED
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mb-3">{new Date(offer.createdAt).toLocaleString()}</p>
                              <div className="text-sm text-slate-700 dark:text-slate-300 mb-4 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800/50">
                                <span className="font-bold text-xs uppercase text-amber-600 dark:text-amber-500 block mb-1">Offer Details:</span>
                                {offer.offerDetails}
                              </div>

                              {/* Chat Section */}
                              <div className="mt-4 space-y-3">
                                {offer.messages && offer.messages.length > 0 && (
                                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                                    {offer.messages.map(msg => (
                                      <div key={msg._id} className={`flex flex-col ${msg.senderRole === 'Traveler' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                          msg.senderRole === 'Traveler' 
                                          ? 'bg-brand text-white rounded-br-sm' 
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                                        }`}>
                                          <div className="text-[10px] font-bold opacity-75 mb-0.5 flex justify-between gap-2">
                                            <span>{msg.senderRole === 'Traveler' ? 'You' : msg.senderName}</span>
                                            <span className="opacity-75">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                          </div>
                                          <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {offer.status === 'Pending' && req.status === 'Open' && (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Ask a question about this offer..."
                                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                                      value={replyText[offer._id] || ""}
                                      onChange={(e) => setReplyText({ ...replyText, [offer._id]: e.target.value })}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(offer._id, req._id)}
                                    />
                                    <button 
                                      onClick={() => handleSendMessage(offer._id, req._id)}
                                      className="p-2 bg-brand hover:bg-brand-hover text-white rounded-full transition-colors flex-shrink-0"
                                    >
                                      <Send className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end justify-start min-w-[140px] pl-4 border-l border-slate-100 dark:border-slate-800">
                              <div className="text-xl font-black text-brand mb-3">Rs. {offer.price}</div>
                              {req.status === 'Open' && offer.status === 'Pending' && (
                                <button
                                  onClick={() => acceptOffer(offer._id)}
                                  className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
                                >
                                  Accept Offer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No offers received yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request a Trip</h2>
              <p className="text-sm text-slate-500">Fill out your requirements to receive offers from hotels.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Destination / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kandy, Nuwara Eliya"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Estimated Budget</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rs. 10,000 per night"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">What are you looking for?</label>
                <textarea
                  required
                  placeholder="e.g. I need a family room for 2 adults and 2 kids near the temple, must have AC and breakfast included."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none resize-none"
                  value={newReqs}
                  onChange={(e) => setNewReqs(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-md hover:bg-brand-hover active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Post Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
