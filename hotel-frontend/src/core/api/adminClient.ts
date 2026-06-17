import { baseClient } from "./baseClient";

export const adminClient = {
  getSystemPackages: async () => {
    const res = await baseClient.get("/api/system-packages");
    return res.data;
  },
  createSystemPackage: async (pkg: any) => {
    const res = await baseClient.post("/api/system-packages", pkg);
    return res.data;
  },
  updateSystemPackage: async (id: string, pkg: any) => {
    const res = await baseClient.put(`/api/system-packages/${id}`, pkg);
    return res.data;
  },
  deleteSystemPackage: async (id: string) => {
    const res = await baseClient.delete(`/api/system-packages/${id}`);
    return res.data;
  },
  getPartnerUsages: async () => {
    const res = await baseClient.get("/api/admin/partner-usages");
    return res.data;
  },
  getUsersList: async () => {
    const res = await baseClient.get("/api/admin/users-list");
    return res.data;
  },
  sendBulkMessage: async (payload: { emails: string[]; title: string; message: string }) => {
    const res = await baseClient.post("/api/admin/bulk-message", payload);
    return res.data;
  },
};
