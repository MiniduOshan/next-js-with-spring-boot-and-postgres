import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Heart, Building2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "signin" }: AuthModalProps) {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"signin" | "signup">(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isPartner, setIsPartner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hotel states
  const [hotelName, setHotelName] = useState("");
  const [hotelCity, setHotelCity] = useState("");
  const [hotelPhone, setHotelPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError(null);
      setEmail("");
      setPassword("");
      setName("");
      setIsPartner(false);
      setHotelName("");
      setHotelCity("");
      setHotelPhone("");
      setIsSuccess(false);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (view === "signin") {
        const res = await login(email, password);
        if (res.success) {
          setIsSuccess(true);
          setTimeout(async () => {
            onClose();
            if (res.user?.isAdmin || res.user?.isPartner || res.user?.isStaff) {
              router.push("/dashboard");
            } else if (res.user?.email) {
              // Check if this user is a staff member (manager/cashier) of any hotel
              try {
                const hotelsRes = await fetch("/api/my-hotels", {
                  headers: { "x-owner-email": res.user.email }
                });
                if (hotelsRes.ok) {
                  const hotels = await hotelsRes.json();
                  if (Array.isArray(hotels) && hotels.length > 0) {
                    // User is staff of at least one hotel — redirect to dashboard
                    router.push("/dashboard");
                  }
                }
              } catch (e) {
                // Silently fail — user will stay on current page
              }
            }
          }, 1000);
        } else {
          setError(res.error || "Failed to sign in");
        }
      } else {
        if (isPartner && (!hotelName.trim() || !hotelCity.trim())) {
          setError("Hotel Name and City are required for partners.");
          setIsSubmitting(false);
          return;
        }
        const res = await signup(name, email, password, isPartner, isPartner ? {
          hotelName,
          hotelCity,
          hotelPhone
        } : undefined);
        if (res.success) {
          // Send registration notifications dynamically
          try {
            if (isPartner) {
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipientEmail: 'admin@yme.lk',
                  title: 'New Partner Registration 🏢',
                  message: `Operator "${name}" has registered a new property: "${hotelName}" in ${hotelCity}. Please review the application.`,
                  type: 'info'
                })
              }).catch(console.error);
            } else {
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipientEmail: email.toLowerCase().trim(),
                  title: 'Welcome to YME Hotels! 🏨',
                  message: `Hi ${name || 'Traveler'}! Thank you for signing up. Enjoy booking verified premium stays across Sri Lanka.`,
                  type: 'info'
                })
              }).catch(console.error);
            }
          } catch (notifErr) {
            console.error("Failed to post registration notification:", notifErr);
          }

          setIsSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setError(res.error || "Failed to sign up");
        }
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemoUser = (role: "user" | "partner" | "admin") => {
    if (role === "partner") {
      setEmail("partner@yme.lk");
    } else if (role === "admin") {
      setEmail("admin@yme.lk");
    } else {
      setEmail("user@yme.lk");
    }
    setPassword("password");
    setError(null);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Backdrop - stays fixed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-0"
        />

        {/* Centering container */}
        <div className="relative min-h-screen flex justify-center items-center p-4 pointer-events-none">
          {/* Modal Container */}
          <motion.div
            id="auth-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden pointer-events-auto my-8"
          >
            {/* Top Banner / Color Block */}
            <div className="h-2 bg-gradient-to-r from-yme-green to-brand shrink-0" />

            {/* Close button */}
            <button
              id="auth-modal-close"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 z-20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto min-h-0 scrollbar-thin">
              {/* Header Identity */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-yme-green flex items-center justify-center text-white font-bold tracking-tight text-base shadow-sm mb-3">
                  Y
                </div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {view === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {view === "signin"
                    ? "Sign in to access your bookings, favorites, and dashboard"
                    : "Join YME Hotels to find premium stays at the best rates in Sri Lanka"}
                </p>
              </div>

              {/* Error notifications */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex gap-2 items-start"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Success state overlay */}
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4"
                  >
                    <Check className="w-8 h-8 stroke-[3]" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Success!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {view === "signin" ? "Logging you in safely..." : "Account created successfully, welcome!"}
                  </p>
                </div>
              ) : (
                /* Auth Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                          id="auth-signup-name"
                          type="text"
                          placeholder="John Doe"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5 ml-1">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Password
                      </label>
                      {view === "signin" && (
                        <button
                          type="button"
                          onClick={() => alert("Simulated: Check your details or log in with the testing accounts.")}
                          className="text-[11px] font-medium text-brand hover:underline"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {view === "signup" && (
                    <div className="space-y-3">
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 transition-all">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            id="auth-ispartner"
                            type="checkbox"
                            checked={isPartner}
                            onChange={(e) => setIsPartner(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-brand focus:ring-brand w-4 h-4"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-brand" /> Register as a Hotel Partner
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              Enables listings dashboard to manage rooms, offers, custom bookings and inquiries.
                            </span>
                          </div>
                        </label>
                      </div>

                      {isPartner && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-3 pl-3 border-l-2 border-brand/40 overflow-hidden"
                        >
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                              Hotel/Property Name *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Ella Grand Paradise Resort"
                              required={isPartner}
                              value={hotelName}
                              onChange={(e) => setHotelName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Location City *
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Ella"
                                required={isPartner}
                                value={hotelCity}
                                onChange={(e) => setHotelCity(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                Contact Phone
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. +94 77 XXXXXXX"
                                value={hotelPhone}
                                onChange={(e) => setHotelPhone(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    id="auth-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 mt-2 bg-brand hover:bg-brand-hover text-white rounded-full text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{view === "signin" ? "Sign In" : "Sign Up"}</span>
                    )}
                  </button>

                  {/* Quick login aids */}
                  {view === "signin" && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[10px] font-semibold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider mb-2">
                        Demo Testing Accounts
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => autofillDemoUser("partner")}
                          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[10px] font-medium text-slate-650 dark:text-slate-300 text-center transition-colors"
                        >
                          Hotel Owner
                        </button>
                        <button
                          type="button"
                          onClick={() => autofillDemoUser("user")}
                          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[10px] font-medium text-slate-650 dark:text-slate-300 text-center transition-colors"
                        >
                          Traveler
                        </button>
                        <button
                          type="button"
                          onClick={() => autofillDemoUser("admin")}
                          className="p-2 border border-teal-200 dark:border-teal-900/50 rounded-xl bg-teal-50/20 dark:bg-teal-950/10 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-[10px] font-semibold text-teal-600 dark:text-teal-400 text-center transition-colors"
                        >
                          Admin Panel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Toggle Mode */}
                  <div className="pt-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                    {view === "signin" ? (
                      <>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setView("signup");
                            setError(null);
                          }}
                          className="font-semibold text-brand hover:underline"
                        >
                          Sign Up Free
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setView("signin");
                            setError(null);
                          }}
                          className="font-semibold text-brand hover:underline"
                        >
                          Sign In Here
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
