import api from "@/lib/api/client";
import type { DashboardData } from "@/models/dashboard";

export const dashboardApi = {
  /** 
   * GET /api/dashboard/
   * Returns all four dashboard widgets in a single response.
   */
  async get(): Promise<DashboardData> {
    const res = await api.get<DashboardData>("/api/dashboard/");
    return res.data;
  },
};