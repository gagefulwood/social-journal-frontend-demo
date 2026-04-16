import api from "./client";
import axios from "axios";
import { DashboardData, HeatmapCell } from "@/models";
import { ApiError } from "./types";

export const dashboardApi = {
  async get(): Promise<DashboardData> {
    try {
      const res = await api.get("/dashboard");
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw {
          message: "Failed to fetch dashboard",
          status: err.response?.status,
        } as ApiError;
      }
      throw { message: "Unknown error" } as ApiError;
    }
  },

  async getHeatmap(range: string): Promise<HeatmapCell[]> {
    try {
      const res = await api.get("/dashboard/heatmap", {
        params: { range },
      });
      return res.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw {
          message: "Failed to fetch heatmap",
          status: err.response?.status,
        } as ApiError;
      }
      throw { message: "Unknown error" } as ApiError;
    }
  },
};