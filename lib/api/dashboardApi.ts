import api from "@/lib/api/client";
import type { DashboardPayload } from "@/types/dashboard";

export const dashboardApi = {
  async get() {
    const response = await api.get<DashboardPayload>("/api/dashboard/");
    return response.data;
  },
};
