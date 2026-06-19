"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  deleteAccount: (userId: string) => void;
  getPartners: () => User[];
  approvePartner: (userId: string) => void;
  rejectPartner: (userId: string) => void;
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

  // Load user from localStorage on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem("yme_current_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.email && parsed.email.toLowerCase() === "partner@yme.lk") {
          parsed.hotelStatus = "approved";
          localStorage.setItem("yme_current_user", JSON.stringify(parsed));
        }
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem("yme_current_user");
      }
    }

    // Seed default manager/partner if not already seeded
    const users = localStorage.getItem("yme_registered_users");
    const defaultUsers = [
      {
        id: "demo-partner-1",
        name: "Suresh Perera",
        email: "partner@yme.lk",
        password: "password",
        isPartner: true,
        hotelName: "Grand Paradise Resort",
        hotelCity: "Colombo",
        hotelPhone: "+94 77 123 4567",
        hotelStatus: "approved",
        avatarUrl: "https://images.unsplash.com/photo-1542314831-c6a4d14abace?w=100&h=100&fit=crop",
        joinedDate: new Date().toLocaleDateString(),
        points: 0
      },
      {
        id: "demo-user-1",
        name: "Nimmi Alwis",
        email: "user@yme.lk",
        password: "password",
        isPartner: false,
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        joinedDate: new Date().toLocaleDateString(),
        points: 50 // Demo user has 50 points to start
      },
      {
        id: "demo-admin-1",
        name: "Chathura Silva (Admin)",
        email: "admin@yme.lk",
        password: "password",
        isPartner: false,
        isAdmin: true,
        avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
        joinedDate: new Date().toLocaleDateString(),
        points: 0
      }
    ];

    if (!users) {
      localStorage.setItem("yme_registered_users", JSON.stringify(defaultUsers));
    } else {
      // Guarantee admin user exists and partner@yme.lk is always approved
      try {
        const parsedUsers = JSON.parse(users);
        const adminExists = parsedUsers.some((u: any) => u.email.toLowerCase() === "admin@yme.lk");
        if (!adminExists) {
          parsedUsers.push(defaultUsers[2]);
        }

        const partnerIndex = parsedUsers.findIndex((u: any) => u.email.toLowerCase() === "partner@yme.lk");
        if (partnerIndex === -1) {
          parsedUsers.push(defaultUsers[0]);
        } else {
          parsedUsers[partnerIndex].hotelStatus = "approved";
          parsedUsers[partnerIndex].isPartner = true;
        }

        localStorage.setItem("yme_registered_users", JSON.stringify(parsedUsers));
      } catch (e) {
        localStorage.setItem("yme_registered_users", JSON.stringify(defaultUsers));
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
      const res = await fetch("/api/my-hotels", { headers: { "x-owner-email": user.email } });
      if (!res.ok) return;
      const rawHotels = await res.json();
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

        // Auto-select only for staff members who are not partners (owners).
        // Partners/Owners always land on the Portfolio Overview (Main Dashboard) first.
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
      fetch(`/api/loyalty/summary/${user.email}`)
        .then(res => res.json())
        .then(data => {
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
    // Artificial slight delay for realistic UX transitions
    await new Promise((resolve) => setTimeout(resolve, 600));

    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    const foundUser = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const userProfile: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        isPartner: foundUser.isPartner,
        isStaff: foundUser.isStaff,
        staffRole: foundUser.staffRole,
        isAdmin: foundUser.isAdmin,
        hotelName: foundUser.hotelName,
        hotelCity: foundUser.hotelCity,
        hotelPhone: foundUser.hotelPhone,
        hotelStatus: foundUser.hotelStatus,
        avatarUrl: foundUser.avatarUrl,
        joinedDate: foundUser.joinedDate,
        points: foundUser.points || 0
      };

      setUser(userProfile);
      localStorage.setItem("yme_current_user", JSON.stringify(userProfile));

      // Attempt to award daily login points via the new backend engine
      fetch("/api/loyalty/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userProfile.email, activity_code: "daily_login" })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.summary) {
            setUser(prev => prev ? { ...prev, points: data.summary.available_points } : prev);
          }
        })
        .catch(console.error);

      return { success: true, user: userProfile };
    }

    try {
      const staffRes = await fetch("/api/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password })
      });

      if (staffRes.ok) {
        const data = await staffRes.json();
        const staffUser = data.user as User;

        setUser(staffUser);
        localStorage.setItem("yme_current_user", JSON.stringify(staffUser));

        fetch("/api/loyalty/award", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: staffUser.email, activity_code: "daily_login" })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.summary) {
              setUser(prev => prev ? { ...prev, points: data.summary.available_points } : prev);
            }
          })
          .catch(console.error);

        return { success: true, user: staffUser };
      }
    } catch (err) {
      console.error("Staff login failed:", err);
    }

    return {
      success: false,
      error: "Invalid email or password."
    };
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    isPartner: boolean,
    hotelDetails?: { hotelName: string; hotelCity: string; hotelPhone: string }
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 850));

    if (!name.trim()) return { success: false, error: "Please enter your full name." };
    if (!email.trim() || !email.includes("@")) return { success: false, error: "Please enter a valid email address." };
    if (password.length < 6) return { success: false, error: "Password must be at least 6 characters long." };

    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    const emailExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return { success: false, error: "An account with this email already exists." };
    }

    // Get simple initials avatar
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=00a67e`;

    const signupDate = new Date();
    const premiumExpiry = new Date(signupDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      password,
      isPartner,
      hotelName: isPartner ? hotelDetails?.hotelName || "My New Hotel" : undefined,
      hotelCity: isPartner ? hotelDetails?.hotelCity || "Colombo" : undefined,
      hotelPhone: isPartner ? hotelDetails?.hotelPhone || "" : undefined,
      hotelStatus: isPartner ? "pending" : undefined,
      avatarUrl,
      joinedDate: new Date().toLocaleDateString(),
      points: 0,
      subscriptionPlan: 'premium' as const,
      subscriptionExpiry: premiumExpiry.toISOString(),
      subscriptionStartDate: signupDate.toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("yme_registered_users", JSON.stringify(users));

    const userProfile: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isPartner: newUser.isPartner,
      isAdmin: false,
      hotelName: newUser.hotelName,
      hotelCity: newUser.hotelCity,
      hotelPhone: newUser.hotelPhone,
      hotelStatus: newUser.hotelStatus as "pending" | "approved" | "rejected" | undefined,
      avatarUrl: newUser.avatarUrl,
      joinedDate: newUser.joinedDate,
      points: newUser.points,
      subscriptionPlan: 'premium',
      subscriptionExpiry: newUser.subscriptionExpiry,
      subscriptionStartDate: newUser.subscriptionStartDate,
    };

    setUser(userProfile);
    localStorage.setItem("yme_current_user", JSON.stringify(userProfile));

    // Award registration points
    fetch("/api/loyalty/award", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: userProfile.email, activity_code: "register_account" })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.summary) {
          setUser(prev => prev ? { ...prev, points: data.summary.available_points } : prev);
        }
      })
      .catch(console.error);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("yme_current_user");
  };

  const deleteAccount = (userId: string) => {
    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    const filteredUsers = users.filter((u: any) => u.id !== userId);
    localStorage.setItem("yme_registered_users", JSON.stringify(filteredUsers));
    logout();
  };

  const updateProfile = (updatedData: Partial<User> | ((prev: User) => Partial<User>)) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const dataToUpdate = typeof updatedData === 'function' ? updatedData(prevUser) : updatedData;
      const updatedUser = { ...prevUser, ...dataToUpdate };
      localStorage.setItem("yme_current_user", JSON.stringify(updatedUser));

      const storedUsersJson = localStorage.getItem("yme_registered_users");
      const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
      const index = users.findIndex((u: any) => u.id === prevUser.id);
      if (index !== -1) {
        users[index] = { ...users[index], ...dataToUpdate };
        localStorage.setItem("yme_registered_users", JSON.stringify(users));
      }
      return updatedUser;
    });
  };

  const getPartners = (): User[] => {
    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    return users.filter((u: any) => u.isPartner === true);
  };

  const approvePartner = (userId: string) => {
    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    const index = users.findIndex((u: any) => u.id === userId);
    if (index !== -1) {
      users[index].hotelStatus = "approved";
      localStorage.setItem("yme_registered_users", JSON.stringify(users));

      // If current user is this partner, update current user too
      if (user && user.id === userId) {
        const updated = { ...user, hotelStatus: "approved" as const };
        setUser(updated);
        localStorage.setItem("yme_current_user", JSON.stringify(updated));
      }
    }
  };

  const rejectPartner = (userId: string) => {
    const storedUsersJson = localStorage.getItem("yme_registered_users");
    const users = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    const index = users.findIndex((u: any) => u.id === userId);
    if (index !== -1) {
      users[index].hotelStatus = "rejected";
      localStorage.setItem("yme_registered_users", JSON.stringify(users));

      // If current user is this partner, update current user too
      if (user && user.id === userId) {
        const updated = { ...user, hotelStatus: "rejected" as const };
        setUser(updated);
        localStorage.setItem("yme_current_user", JSON.stringify(updated));
      }
    }
  };

  const awardPoints = async (activity_code: string, reference_id?: string, remarks?: string) => {
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/loyalty/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user.email, activity_code, reference_id, remarks })
      });
      const data = await res.json();
      if (res.ok && data.success && data.summary) {
        updateProfile({ points: data.summary.available_points });
      } else {
        console.error("Failed to award points:", data.error);
      }
    } catch (err) {
      console.error("Error awarding points:", err);
    }
  };

  const redeemPoints = async (points_to_redeem: number, remarks?: string) => {
    if (!user || !user.email) return;
    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: user.email, points_to_redeem, remarks })
      });
      const data = await res.json();
      if (res.ok && data.success && data.summary) {
        updateProfile({ points: data.summary.available_points });
      } else {
        console.error("Failed to redeem points:", data.error);
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
