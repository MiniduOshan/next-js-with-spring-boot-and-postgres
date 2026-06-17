import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const baseClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

baseClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("user-email") || "";
      const tenantId = localStorage.getItem("tenant-id") || "";
      const hotelId = localStorage.getItem("hotel-id") || "";
      const token = localStorage.getItem("token") || "";

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (email) {
        config.headers["x-owner-email"] = email;
        config.headers["x-recipient-email"] = email;
      }
      if (tenantId) {
        config.headers["X-Tenant-ID"] = tenantId;
      }
      if (hotelId) {
        config.headers["x-hotel-id"] = hotelId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

baseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error response:", error.response || error.message);
    return Promise.reject(error);
  }
);
