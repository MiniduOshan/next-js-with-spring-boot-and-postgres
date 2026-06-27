"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { baseClient } from "@/src/core/api/baseClient";

export interface User {
  id: string;
  name: string;
  email: string;
  isPartner: boolean;
  isStaff?: boolean;
  staffRole?: "manager" | "cashier";
  isAdmin?: boolean;
  hotelName?: string;
  hotelCity?: string;
  hotelPhone?: string;
  hotelStatus?: "pending" | "approved" | "rejected";
  avatarUrl?: string;
  joinedDate?: string;
  points?: number;
  subscriptionPlan?: 'free' | 'pro' | 'premium';
  subscriptionExpiry?: string;    // ISO date string
  subscriptionStartDate?: string; // ISO date string
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    password: string,
    isPartner: boolean,
    hotelDetails?: { hotelName: string; hotelCity: string; hotelPhone: string }
  ) => Promise<{ success: boolean; error?: string; debugVerificationCode?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; debugResetCode?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (googlePayload: { token: string; isPartner?: boolean }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;

  updateProfile: (updatedData: Partial<User>) => void;
  deleteAccount: (userId: string) => void;
  getPartners: () => Promise<User[]>;
  approvePartner: (userId: string) => Promise<void>;
  rejectPartner: (userId: string) => Promise<void>;
  awardPoints: (activity_code: string, reference_id?: string, remarks?: string) => Promise<void>;
  redeemPoints: (points_to_redeem: number, remarks?: string) => Promise<void>;
  accessibleHotels: any[];
  activeHotel: any | null;
  activeRole: "owner" | "manager" | "cashier" | null;
  switchHotel: (hotelId: string, currentHotels?: any[]) => void;
  refreshHotels: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [accessibleHotels, setAccessibleHotels] = useState<any[]>([]);
  const [activeHotel, setActiveHotel] = useState<any | null>(null);
  const [activeRole, setActiveRole] = useState<"owner" | "manager" | "cashier" | null>(null);

  // Initialize and load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("yme_current_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("yme_current_user");
      }
    }

    setIsLoading(false);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "yme_current_user") {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch (e) {
            console.error("Error parsing user from storage", e);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const refreshHotels = async () => {
    if (!user || !user.email) return;
    try {
      const res = await baseClient.get("/api/my-hotels");
      const rawHotels = res.data;
      if (Array.isArray(rawHotels)) {
        const hotels = rawHotels.map((h: any) => ({
          ...h,
          _id: h.id || h._id,
          id: h.id || h._id
        }));
        setAccessibleHotels(hotels);
        const storedHotelId = localStorage.getItem("yme_active_hotel_id");

        if (storedHotelId) {
          const found = hotels.find((h: any) => h._id === storedHotelId);
          if (found) {
            switchHotel(found._id, hotels);
            return;
          }
        }

        if (hotels.length > 0 && user.isStaff && !user.isPartner) {
          switchHotel(hotels[0]._id, hotels);
        } else {
          switchHotel('');
        }
      }
    } catch (e) {
      console.error("Failed to fetch accessible hotels", e);
    }
  };

  const switchHotel = (hotelId: string, currentHotels = accessibleHotels) => {
    if (!hotelId) {
      setActiveHotel(null);
      setActiveRole(null);
      localStorage.removeItem("yme_active_hotel_id");
      return;
    }
    const hotel = currentHotels.find((h: any) => h._id === hotelId);
    if (hotel) {
      setActiveHotel(hotel);
      localStorage.setItem("yme_active_hotel_id", hotelId);

      const userEmail = user?.email?.toLowerCase();
      if (hotel.owner?.toLowerCase() === userEmail) {
        setActiveRole("owner");
      } else {
        const staffRec = hotel.staff?.find((s: any) => s.email?.toLowerCase() === userEmail);
        setActiveRole(staffRec ? staffRec.role : null);
      }
    }
  };

  useEffect(() => {
    if (user && user.email) {
      refreshHotels();
    } else {
      setAccessibleHotels([]);
      setActiveHotel(null);
      setActiveRole(null);
      localStorage.removeItem("yme_active_hotel_id");
    }
  }, [user?.email]);

  useEffect(() => {
    if (user && user.email) {
      baseClient.get(`/api/loyalty/summary/${user.email}`)
        .then(res => {
          const data = res.data;
          if (data.summary && data.summary.available_points !== undefined) {
            if (user.points !== data.summary.available_points) {
              updateProfile({ points: data.summary.available_points });
            }
          }
        })
        .catch(console.error);
    }
  }, [user?.email]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await baseClient.post("/api/auth/login", { email, password });
      if (res.data && res.data.success) {
        const loggedUser = res.data.user as User;
        const accessToken = res.data.accessToken;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user-email", loggedUser.email);
        localStorage.setItem("yme_current_user", JSON.stringify(loggedUser));
        setUser(loggedUser);

        // Award daily login points
        baseClient.post("/api/loyalty/award", { user_email: loggedUser.email, activity_code: "daily_login" })
          .then(awardRes => {
            if (awardRes.data.success && awardRes.data.summary) {
              setUser(prev => prev ? { ...prev, points: awardRes.data.summary.available_points } : prev);
            }
          })
          .catch(console.error);

        return { success: true, user: loggedUser };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Invalid email or password.";
      return { success: false, error: errMsg };
    }
    return { success: false, error: "Invalid email or password." };
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    isPartner: boolean,
    hotelDetails?: { hotelName: string; hotelCity: string; hotelPhone: string }
  ): Promise<{ success: boolean; error?: string; debugVerificationCode?: string }> => {
    try {
      const res = await baseClient.post("/api/auth/signup", {
        name,
        email,
        password,
        isPartner,
        hotelDetails
      });
      if (res.data && res.data.success) {
        return {
          success: true,
          debugVerificationCode: res.data.debugVerificationCode
        };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Failed to sign up." };
    }
    return { success: false, error: "Failed to sign up." };
  };

  const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await baseClient.post("/api/auth/verify", { email, code });
      if (res.data && res.data.success) {
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Verification failed." };
    }
    return { success: false, error: "Verification failed." };
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string; debugResetCode?: string }> => {
    try {
      const res = await baseClient.post("/api/auth/forgot-password", { email });
      if (res.data && res.data.success) {
        return { success: true, debugResetCode: res.data.debugResetCode };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Failed to initiate password reset." };
    }
    return { success: false, error: "Failed to initiate password reset." };
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await baseClient.post("/api/auth/reset-password", { email, code, newPassword });
      if (res.data && res.data.success) {
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Failed to reset password." };
    }
    return { success: false, error: "Failed to reset password." };
  };


  const googleLogin = async (googlePayload: { token: string; isPartner?: boolean }): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const res = await baseClient.post("/api/auth/google", googlePayload);
      if (res.data && res.data.success) {
        const loggedUser = res.data.user as User;
        const accessToken = res.data.accessToken;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user-email", loggedUser.email);
        localStorage.setItem("yme_current_user", JSON.stringify(loggedUser));
        setUser(loggedUser);

        return { success: true, user: loggedUser };
      }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || "Google authentication failed." };
    }
    return { success: false, error: "Google authentication failed." };
  };

  const logout = async () => {
    try {
      await baseClient.post("/api/auth/logout");
    } catch (e) {
      console.error("Logout request failed:", e);
    }
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user-email");
    localStorage.removeItem("yme_current_user");
    localStorage.removeItem("yme_active_hotel_id");
  };

  const deleteAccount = async (userId: string) => {
    // Standard mock action or request to delete in backend if supported. For simplicity we clear auth state.
    logout();
  };

  const updateProfile = (updatedData: Partial<User> | ((prev: User) => Partial<User>)) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const dataToUpdate = typeof updatedData === 'function' ? updatedData(prevUser) : updatedData;
      const updatedUser = { ...prevUser, ...dataToUpdate };
      localStorage.setItem("yme_current_user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const getPartners = useCallback(async (): Promise<User[]> => {
    try {
      const res = await baseClient.get("/api/auth/partners");
      return res.data;
    } catch (e) {
      // Return empty list or local mock fallback for admin listing of partners
      return [];
    }
  }, []);

  const approvePartner = async (userId: string) => {
    try {
      await baseClient.post(`/api/auth/partners/${userId}/approve`);
    } catch (e) {
      console.error(e);
    }
  };

  const rejectPartner = async (userId: string) => {
    try {
      await baseClient.post(`/api/auth/partners/${userId}/reject`);
    } catch (e) {
      console.error(e);
    }
  };

  const awardPoints = async (activity_code: string, reference_id?: string, remarks?: string) => {
    if (!user || !user.email) return;
    try {
      const res = await baseClient.post("/api/loyalty/award", {
        user_email: user.email,
        activity_code,
        reference_id,
        remarks
      });
      const data = res.data;
      if (data.success && data.summary) {
        updateProfile({ points: data.summary.available_points });
      }
    } catch (err) {
      console.error("Error awarding points:", err);
    }
  };

  const redeemPoints = async (points_to_redeem: number, remarks?: string) => {
    if (!user || !user.email) return;
    try {
      const res = await baseClient.post("/api/loyalty/redeem", {
        user_email: user.email,
        points_to_redeem,
        remarks
      });
      const data = res.data;
      if (data.success && data.summary) {
        updateProfile({ points: data.summary.available_points });
      }
    } catch (err) {
      console.error("Error redeeming points:", err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      verifyEmail,
      forgotPassword,
      resetPassword,
      googleLogin,
      logout,

      updateProfile,
      deleteAccount,
      getPartners,
      approvePartner,
      rejectPartner,
      awardPoints,
      redeemPoints,
      accessibleHotels,
      activeHotel,
      activeRole,
      switchHotel,
      refreshHotels
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
