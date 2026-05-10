"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { journalApi } from "@/lib/api/journalApi";
import type { ApiError } from "@/types/auth";
import type { LogListItem } from "@/types/journals";
import type { PaginatedResponse } from "@/types/api";

export type LogListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  mood?: string;
  entry_tag?: string;
};

type LogListResponse = PaginatedResponse<LogListItem>;

export function useLogs(params: LogListParams = {}) {
  const [data, setData] = useState<LogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      search: params.search?.trim() || undefined,
      mood: params.mood || undefined,
      entry_tag: params.entry_tag || undefined,
    }),
    [params.search, params.mood, params.entry_tag, params.page, params.page_size]
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await journalApi.listLogs(requestParams);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadLogs() {
      setLoading(true);
      setError(null);

      try {
        const response = await journalApi.listLogs(requestParams);
        if (isActive) {
          setData(response);
        }
      } catch (err) {
        if (isActive) {
          setError(err as ApiError);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadLogs();

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  return {
    data,
    logs: data?.results ?? [],
    loading,
    error,
    refetch: fetchLogs,
  };
}

