import { baseClient } from "./baseClient";

export const partnerClient = {
  getHotelProfile: async () => {
    const res = await baseClient.get("/api/hotel-profile");
    return res.data;
  },
  saveHotelProfile: async (profile: any) => {
    const res = await baseClient.post("/api/hotel-profile", profile);
    return res.data;
  },
  updateHotelProfile: async (profile: any) => {
    const res = await baseClient.put("/api/hotel-profile", profile);
    return res.data;
  },
  getRooms: async () => {
    const res = await baseClient.get("/api/rooms");
    return res.data;
  },
  createRoom: async (room: any) => {
    const res = await baseClient.post("/api/rooms", room);
    return res.data;
  },
  updateRoom: async (id: string, room: any) => {
    const res = await baseClient.put(`/api/rooms/${id}`, room);
    return res.data;
  },
  deleteRoom: async (id: string) => {
    const res = await baseClient.delete(`/api/rooms/${id}`);
    return res.data;
  },
  getBookings: async () => {
    const res = await baseClient.get("/api/bookings");
    return res.data;
  },
  updateBookingStatus: async (id: string, status: string) => {
    const res = await baseClient.put(`/api/bookings/${id}/status`, { status });
    return res.data;
  },
  getOffers: async () => {
    const res = await baseClient.get("/api/offers");
    return res.data;
  },
  createOffer: async (offer: any) => {
    const res = await baseClient.post("/api/offers", offer);
    return res.data;
  },
  updateOffer: async (id: string, offer: any) => {
    const res = await baseClient.put(`/api/offers/${id}`, offer);
    return res.data;
  },
  deleteOffer: async (id: string) => {
    const res = await baseClient.delete(`/api/offers/${id}`);
    return res.data;
  },
};
