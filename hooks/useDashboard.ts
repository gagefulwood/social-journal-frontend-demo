"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dashboardApi } from "@/lib/api/dashboardApi";
import type { ApiError } from "@/types/auth";
import type { DashboardPayload } from "@/types/dashboard";

export function useDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const requestIdRef = useRef(0);

  const fetchDashboard = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);

    try {
      const response = await dashboardApi.get();
      if (requestIdRef.current === requestId) {
        setData(response);
      }
    } catch (err) {
      if (requestIdRef.current === requestId) {
        setError(err as ApiError);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
