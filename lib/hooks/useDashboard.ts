"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboardApi";
import type { DashboardData } from "@/models/dashboard";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.get();
        setData(res);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return { data, isLoading, error };
}