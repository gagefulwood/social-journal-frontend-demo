"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  ObservationListParams,
  ObservationListResponse,
} from "@/types/contacts";

type UseContactObservationsOptions = {
  enabled?: boolean;
};

export function useContactObservations(
  contactId: ApiId | null | undefined,
  params: ObservationListParams = {},
  options: UseContactObservationsOptions = {},
) {
  const { enabled = true } = options;
  const [data, setData] = useState<ObservationListResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(contactId) && enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadedPage, setLoadedPage] = useState(params.page ?? 1);
  const requestParams = useMemo(
    () => ({
      page_size: params.page_size,
      search: params.search?.trim() || undefined,
      status: params.status,
      observation_type: params.observation_type,
      marker: params.marker,
      event: params.event,
      occurred_after: params.occurred_after,
      occurred_before: params.occurred_before,
      created_after: params.created_after,
      created_before: params.created_before,
      pinned: params.pinned,
      ordering: params.ordering,
    }),
    [
      params.created_after,
      params.created_before,
      params.event,
      params.marker,
      params.observation_type,
      params.ordering,
      params.occurred_after,
      params.occurred_before,
      params.page_size,
      params.pinned,
      params.search,
      params.status,
    ],
  );
  const initialPage = params.page ?? 1;

  const refetch = useCallback(async () => {
    if (contactId == null || !enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const nextData = await contactsApi.listObservations(contactId, {
        ...requestParams,
        page: initialPage,
      });
      setData(nextData);
      setLoadedPage(initialPage);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [contactId, enabled, initialPage, requestParams]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (contactId == null || !enabled) {
        if (active) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const nextData = await contactsApi.listObservations(contactId, {
          ...requestParams,
          page: initialPage,
        });
        if (active) {
          setData(nextData);
          setLoadedPage(initialPage);
        }
      } catch (err) {
        if (active) {
          setError(err as ApiError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [contactId, enabled, initialPage, requestParams]);

  const loadMore = useCallback(async () => {
    if (contactId == null || !enabled || !data?.next || loadingMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const nextData = await contactsApi.listObservations(contactId, {
        ...requestParams,
        page: loadedPage + 1,
      });
      setData((previousData) =>
        previousData
          ? {
              ...nextData,
              previous: previousData.previous,
              results: [...previousData.results, ...nextData.results],
            }
          : nextData,
      );
      setLoadedPage((page) => page + 1);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoadingMore(false);
    }
  }, [contactId, data?.next, enabled, loadedPage, loadingMore, requestParams]);

  return {
    data,
    observations: data?.results ?? [],
    loading,
    loadingMore,
    error,
    hasMore: Boolean(data?.next),
    loadMore,
    refetch,
  };
}
