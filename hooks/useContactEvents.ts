"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { eventsApi, type EventListParams } from "@/lib/api/eventsApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type { EventListResponse } from "@/types/events";

export type ContactEventListParams = Omit<EventListParams, "participants">;

export function useContactEvents(
  contactId: ApiId | null | undefined,
  params: ContactEventListParams = {},
) {
  const [data, setData] = useState<EventListResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(contactId));
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(() => {
    const sanitizedParams: ContactEventListParams = {
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      event_after: params.event_after,
      event_before: params.event_before,
      tier: params.tier,
      context_category: params.context_category || undefined,
      journaled: params.journaled,
    };

    return {
      participants: contactId == null ? "" : String(contactId),
      page_size: 8,
      ...sanitizedParams,
    };
  }, [
    contactId,
    params.page,
    params.page_size,
    params.title,
    params.event_after,
    params.event_before,
    params.tier,
    params.context_category,
    params.journaled,
  ]);

  const fetchContactEvents = useCallback(async () => {
    if (contactId == null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await eventsApi.list(requestParams);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [contactId, requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadContactEvents() {
      if (contactId == null) {
        setData(null);
        setLoading(false);
        return;
      }

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

    void loadContactEvents();

    return () => {
      isActive = false;
    };
  }, [contactId, requestParams]);

  return {
    data,
    events: data?.results ?? [],
    loading,
    error,
    refetch: fetchContactEvents,
  };
}
