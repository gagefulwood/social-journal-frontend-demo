"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  eventsApi,
  type EventListParams,
} from "@/lib/api/eventsApi";
import type { ApiError } from "@/types/auth";
import type { EventListResponse } from "@/types/events";

export function useEvents(params: EventListParams = {}) {
  const [data, setData] = useState<EventListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      event_after: params.event_after,
      event_before: params.event_before,
      tier: params.tier,
      context_category: params.context_category || undefined,
      participants: params.participants?.trim() || undefined,
      journaled: params.journaled,
    }),
    [
      params.page,
      params.page_size,
      params.title,
      params.event_after,
      params.event_before,
      params.tier,
      params.context_category,
      params.participants,
      params.journaled,
    ]
  );

    const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventsApi.list(requestParams);
      setData(response);
    }
        catch (err) {
        setError(err as ApiError);
    } finally {
        setLoading(false);
    }
    }, [requestParams]);

    useEffect(() => {
      let isActive = true;

      async function loadEvents() {
        setLoading(true);
        setError(null);

        try {
          const response = await eventsApi.list(requestParams);
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

      void loadEvents();

      return () => {
        isActive = false;
      };
    }, [requestParams]);

    return {
        data,
        events: data?.results || [],
        loading,
        error,
        refetch: fetchEvents,
    }
}
