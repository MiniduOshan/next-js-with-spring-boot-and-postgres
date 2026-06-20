"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import { MessageSquare, MapPin, DollarSign, Clock, Send, Hotel, CheckCircle, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BidRequest {
  _id: string;
  userName: string;
  location: string;
  budget: string;
  requirements: string;
  status: string;
  createdAt: string;
}

interface Message {
  _id: string;
  senderEmail: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: string;
}

interface PartnerOffer {
  _id: string;
  requestId: string;
  hotelId: string;
  hotelName: string;
  offerDetails: string;
  price: number;
  status: string;
  messages: Message[];
  createdAt: string;
  requestLocation: string;
  requestBudget: string;
  requestRequirements: string;
  travelerName: string;
}

function PartnerGuestRequests() {
  const { user, activeHotel } = useAuth();
  const [activeTab, setActiveTab] = useState<'requests' | 'offers'>('requests');
  
  const [requests, setRequests] = useState<BidRequest[]>([]);
  const [myOffers, setMyOffers] = useState<PartnerOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedReq, setSelectedReq] = useState<BidRequest | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [replyText, setReplyText] = useState<{ [offerId: string]: string }>({});

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else {
      fetchMyOffers();
    }
  }, [activeTab, user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/open-bid-requests");
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      toast.error("Failed to load guest requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner-offers", {
        headers: { "X-Owner-Email": user?.email || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setMyOffers(data);
      }
    } catch (err) {
      toast.error("Failed to load your offers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHotel) {
      toast.error("Please select an active hotel from the sidebar first");
      return;
    }
    if (!offerPrice || !offerDetails) {
      toast.error("Please provide both price and details");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bid-requests/${selectedReq?._id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelId: activeHotel._id,
          hotelName: activeHotel.propertyName,
          ownerEmail: user?.email,
          offerDetails,
          price: Number(offerPrice)
        })
      });
      if (res.ok) {
        toast.success("Offer sent to guest!");
        setSelectedReq(null);
        setOfferPrice("");
        setOfferDetails("");
        fetchRequests(); // Refresh to ensure it's still open or just leave it
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send offer");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (offerId: string) => {
    const text = replyText[offerId];
    if (!text?.trim()) return;
    try {
      const res = await fetch(`/api/bid-offers/${offerId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: user?.email,
          senderName: activeHotel?.propertyName || user?.name || "Hotel",
          senderRole: "Hotel",
          text
        })
      });
      if (res.ok) {
        setReplyText({ ...replyText, [offerId]: "" });
        fetchMyOffers(); // Refresh offers to get the new message
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    try {
      const res = await fetch(`/api/bid-offers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Offer deleted");
        fetchMyOffers();
      } else {
        toast.error("Failed to delete offer");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand" />
            Guest Trip Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse open requests from travelers and manage your sent offers.
          </p>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'requests' 
              ? "bg-white dark:bg-slate-900 text-brand shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <FileText className="w-4 h-4" />
          Open Guest Requests
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'offers' 
              ? "bg-white dark:bg-slate-900 text-brand shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Send className="w-4 h-4" />
          My Sent Offers
        </button>
      </div>

      {!activeHotel && activeTab === 'requests' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center gap-3">
          <Hotel className="w-5 h-5 text-amber-500" />
          <p className="text-sm font-medium">Please select your active hotel from the sidebar before sending offers.</p>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : activeTab === 'requests' ? (
        // --- OPEN REQUESTS TAB ---
        requests.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No open requests right now</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Check back later! When travelers are looking for accommodation, their requests will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((req) => (
              <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{req.userName} is looking for a place</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-bold text-brand flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> {req.location}
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Guest Budget: <span className="font-bold text-slate-900 dark:text-white">{req.budget}</span>
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-xs uppercase text-slate-500 block mb-1">Requirements:</span>
                    {req.requirements}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSelectedReq(req)}
                    disabled={!activeHotel}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Send an Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // --- MY SENT OFFERS TAB ---
        myOffers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <Send className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No offers sent yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              You haven't sent any offers to travelers. Browse open guest requests to start sending offers!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myOffers.map((offer) => (
              <div key={offer._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-5 md:w-1/3 bg-slate-50 dark:bg-slate-800/30 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <span className={cn(
                    "inline-flex px-2 py-0.5 text-xs font-bold rounded mb-3",
                    offer.status === 'Accepted' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : offer.status === 'Rejected' ? "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {offer.status.toUpperCase()}
                  </span>
                  
                  <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Requested Trip</div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-brand" /> {offer.requestLocation}
                  </h4>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Budget: {offer.requestBudget}</p>
                  <p className="text-xs text-slate-500 italic">Traveler: {offer.travelerName}</p>
                </div>

                <div className="p-5 md:w-2/3 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">My Offer: Rs. {offer.price}</h4>
                      <p className="text-xs text-slate-500">{new Date(offer.createdAt).toLocaleString()}</p>
                    </div>
                    {offer.status === 'Pending' && (
                      <button 
                        onClick={() => handleDeleteOffer(offer._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 mb-6">
                    {offer.offerDetails}
                  </div>

                  {/* Chat interface for this offer */}
                  <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h5 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Conversation with Traveler
                    </h5>
                    
                    {offer.messages && offer.messages.length > 0 && (
                      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                        {offer.messages.map(msg => (
                          <div key={msg._id} className={`flex flex-col ${msg.senderRole === 'Hotel' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                              msg.senderRole === 'Hotel' 
                              ? 'bg-slate-900 dark:bg-slate-800 text-white rounded-br-sm' 
                              : 'bg-brand/10 text-brand-dark dark:bg-brand/20 dark:text-brand-light rounded-bl-sm'
                            }`}>
                              <div className="text-[10px] font-bold opacity-75 mb-0.5 flex justify-between gap-2">
                                <span>{msg.senderRole === 'Hotel' ? 'You' : msg.senderName}</span>
                                <span className="opacity-75">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {offer.status === 'Pending' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Reply to traveler..."
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                          value={replyText[offer._id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [offer._id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(offer._id)}
                        />
                        <button 
                          onClick={() => handleSendMessage(offer._id)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 dark:bg-brand dark:hover:bg-brand-hover text-white rounded-full transition-colors flex-shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* New Offer Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send Offer to {selectedReq.userName}</h2>
              <p className="text-sm text-slate-500 mt-1">Location: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedReq.location}</span> | Budget: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedReq.budget}</span></p>
            </div>
            <form onSubmit={handleSubmitOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Your Total Price (Rs.)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 12000"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Offer Details (Room type, what's included)</label>
                <textarea
                  required
                  placeholder="e.g. We can offer a Deluxe AC Room for 2 nights including Breakfast. We are located 5 mins from the temple."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none resize-none"
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl shadow-md hover:bg-brand-hover active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? "Sending..." : <><Send className="w-4 h-4" /> Send Offer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <PartnerGuestRequests {...props} />
    </DashboardLayout>
  );
}
