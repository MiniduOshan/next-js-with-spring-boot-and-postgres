import { baseClient } from "./baseClient";

export const publicClient = {
  getHotels: async () => {
    const res = await baseClient.get("/api/hotels");
    return res.data;
  },
  getHotelBySlug: async (slug: string) => {
    const res = await baseClient.get(`/api/hotels/byslug/${slug}`);
    return res.data;
  },
  getHotelById: async (id: string) => {
    const res = await baseClient.get(`/api/hotels/${id}`);
    return res.data;
  },
  getHotelRooms: async (hotelId: string) => {
    const res = await baseClient.get(`/api/hotels/${hotelId}/rooms`);
    return res.data;
  },
  getHotelReviews: async (hotelId: string) => {
    const res = await baseClient.get(`/api/hotels/${hotelId}/reviews`);
    return res.data;
  },
  checkAvailability: async (params: { hotelId: string; roomName?: string; checkIn: string; checkOut: string }) => {
    const res = await baseClient.get("/api/bookings/check-availability", { params });
    return res.data;
  },
  getPublicOffers: async () => {
    const res = await baseClient.get("/api/public-offers");
    return res.data;
  },
  getNews: async () => {
    const res = await baseClient.get("/api/news");
    return res.data;
  },
  staffLogin: async (credentials: { email: string; password?: string }) => {
    const res = await baseClient.post("/api/staff-login", credentials);
    return res.data;
  },
};
