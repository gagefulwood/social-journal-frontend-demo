"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { eventsApi, type EventListParams } from "@/lib/api/eventsApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type { EventListResponse } from "@/types/events";

export type ContactEventListParams = Omit<EventListParams, "participants">;

type UseContactEventsOptions = {
  enabled?: boolean;
};

export function useContactEvents(
  contactId: ApiId | null | undefined,
  params: ContactEventListParams = {},
  options: UseContactEventsOptions = {},
) {
  const { enabled = true } = options;
  const [data, setData] = useState<EventListResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(contactId) && enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<ApiError | null>(null);
  const [loadedPage, setLoadedPage] = useState(params.page ?? 1);
  const requestVersion = useRef(0);
  const initialPage = params.page ?? 1;

  const requestParams = useMemo(() => {
    const sanitizedParams: ContactEventListParams = {
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      search: params.search?.trim() || undefined,
      event_after: params.event_after,
      event_before: params.event_before,
      tier: params.tier,
      impact: params.impact || undefined,
      context_category: params.context_category || undefined,
      interaction_mode: params.interaction_mode || undefined,
      journaled: params.journaled,
      has_mood: params.has_mood,
      ordering: params.ordering,
    };

    return {
      participants: contactId == null ? "" : String(contactId),
      page_size: 8,
      ...sanitizedParams,
    };
  }, [
    contactId,
    params.page_size,
    params.title,
    params.search,
    params.event_after,
    params.event_before,
    params.tier,
    params.impact,
    params.context_category,
    params.interaction_mode,
    params.journaled,
    params.has_mood,
    params.ordering,
  ]);

  const fetchContactEvents = useCallback(async () => {
    if (contactId == null || !enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadMoreError(null);
    const version = ++requestVersion.current;

    try {
      const response = await eventsApi.list({
        ...requestParams,
        page: initialPage,
      });
      if (version === requestVersion.current) {
        setData(response);
        setLoadedPage(initialPage);
      }
    } catch (err) {
      if (version === requestVersion.current) {
        setError(err as ApiError);
      }
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [contactId, enabled, initialPage, requestParams]);

  useEffect(() => {
    let isActive = true;
    const version = ++requestVersion.current;

    async function loadContactEvents() {
      if (contactId == null || !enabled) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadingMore(false);
      setError(null);
      setLoadMoreError(null);
      setData(null);

      try {
        const response = await eventsApi.list({
          ...requestParams,
          page: initialPage,
        });
        if (isActive && version === requestVersion.current) {
          setData(response);
          setLoadedPage(initialPage);
        }
      } catch (err) {
        if (isActive && version === requestVersion.current) {
          setError(err as ApiError);
        }
      } finally {
        if (isActive && version === requestVersion.current) {
          setLoading(false);
        }
      }
    }

    void loadContactEvents();

    return () => {
      isActive = false;
    };
  }, [contactId, enabled, initialPage, requestParams]);

  const loadMore = useCallback(async () => {
    if (contactId == null || !enabled || !data?.next || loadingMore) {
      return;
    }

    const version = requestVersion.current;
    const nextPage = loadedPage + 1;
    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await eventsApi.list({
        ...requestParams,
        page: nextPage,
      });

      if (version !== requestVersion.current) {
        return;
      }

      setData((previousData) => {
        if (!previousData) {
          return response;
        }

        const existingIds = new Set(
          previousData.results.map((event) => String(event.id)),
        );
        const uniqueResults = response.results.filter(
          (event) => !existingIds.has(String(event.id)),
        );

        return {
          ...response,
          previous: previousData.previous,
          results: [...previousData.results, ...uniqueResults],
        };
      });
      setLoadedPage(nextPage);
    } catch (err) {
      if (version === requestVersion.current) {
        setLoadMoreError(err as ApiError);
      }
    } finally {
      if (version === requestVersion.current) {
        setLoadingMore(false);
      }
    }
  }, [contactId, data?.next, enabled, loadedPage, loadingMore, requestParams]);

  return {
    data,
    events: data?.results ?? [],
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore: Boolean(data?.next),
    loadMore,
    refetch: fetchContactEvents,
  };
}
