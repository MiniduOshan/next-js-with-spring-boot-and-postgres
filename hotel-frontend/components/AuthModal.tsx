import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, Heart, Building2, Check, AlertCircle, Key } from "lucide-react";
import { useAuth } from "./AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialView = "signin" }: AuthModalProps) {
  const { login, signup, verifyEmail, googleLogin, forgotPassword, resetPassword } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<"signin" | "signup" | "verify" | "forgot" | "reset">(initialView);
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isPartner, setIsPartner] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hotel states
  const [hotelName, setHotelName] = useState("");
  const [hotelCity, setHotelCity] = useState("");
  const [hotelPhone, setHotelPhone] = useState("");

  const [verificationCode, setVerificationCode] = useState("");
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
      setVerificationCode("");
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
            }
          }, 1000);
        } else {
          setError(res.error || "Failed to sign in");
        }
      } else if (view === "signup") {
        const res = await signup(name, email, password, isPartner);
        if (res.success) {
          // If mock verification code is returned, auto-fill/notify
          if (res.debugVerificationCode) {
            setError(`[Demo Help] Verification Code generated: ${res.debugVerificationCode}`);
          }
          setView("verify");
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

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await verifyEmail(email, verificationCode);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setView("signin");
          setError(null);
        }, 1200);
      } else {
        setError(res.error || "Invalid verification code");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        if (res.debugResetCode) {
          setError(`[Demo Help] Password Reset Code generated: ${res.debugResetCode}`);
        }
        setView("reset");
      } else {
        setError(res.error || "Failed to request password reset");
      }
    } catch (err) {
      setError("Password reset request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await resetPassword(email, verificationCode, password);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setView("signin");
          setError(null);
          setPassword("");
          setVerificationCode("");
        }, 1200);
      } else {
        setError(res.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Password reset execution failed.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleGoogleLogin = async (partnerChoice: boolean) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Simulate Google identity provider response
      const randomId = Math.random().toString(36).substring(2, 7);
      const googleUser = {
        email: `${partnerChoice ? 'partner' : 'traveler'}-${randomId}@gmail.com`,
        name: partnerChoice ? `Google Partner ${randomId.toUpperCase()}` : `Google Traveler ${randomId.toUpperCase()}`,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${randomId}`,
        isPartner: partnerChoice
      };

      const res = await googleLogin(googleUser);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(res.error || "Google Sign-In failed.");
      }
    } catch (err) {
      setError("Google Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Backdrop */}
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
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-yme-green flex items-center justify-center text-white font-bold tracking-tight text-base shadow-sm mb-3">
                  Y
                </div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {view === "signin" && "Welcome back"}
                  {view === "signup" && "Create your account"}
                  {view === "verify" && "Verify your email"}
                  {view === "forgot" && "Forgot Password"}
                  {view === "reset" && "Reset Password"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {view === "signin" && "Sign in to access your bookings, favorites, and dashboard"}
                  {view === "signup" && "Join YME Hotels to find premium stays at the best rates"}
                  {view === "verify" && `We sent a verification code to ${email}`}
                  {view === "forgot" && "Enter your email to receive a password reset code"}
                  {view === "reset" && "Enter the reset code and your new password"}
                </p>

              </div>

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
                    Proceeding automatically...
                  </p>
                </div>
              ) : view === "verify" ? (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-center tracking-widest font-mono text-lg"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 mt-2 bg-brand hover:bg-brand-hover text-white rounded-full text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isSubmitting ? "Verifying..." : "Verify & Activate"}
                  </button>

                  <div className="text-center text-xs">
                    <button
                      type="button"
                      onClick={() => setView("signup")}
                      className="font-semibold text-brand hover:underline"
                    >
                      Back to Sign Up
                    </button>
                  </div>
                 </form>
              ) : view === "forgot" ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 mt-2 bg-brand hover:bg-brand-hover text-white rounded-full text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Code"}
                  </button>

                  <div className="text-center text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setView("signin")}
                      className="font-semibold text-brand hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              ) : view === "reset" ? (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      6-Digit Reset Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-center tracking-widest font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 mt-2 bg-brand hover:bg-brand-hover text-white rounded-full text-sm font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {view === "signup" && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <input
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
                            onClick={() => {
                              setView("forgot");
                              setError(null);
                            }}
                            className="text-[11px] font-medium text-brand hover:underline"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
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

                      </div>
                    )}

                    {/* Submit button */}
                    <button
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
                  </form>

                  {/* Optional Google Login */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-900 px-2.5 text-slate-400 dark:text-slate-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleLogin(isPartner)}
                    className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>


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
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
