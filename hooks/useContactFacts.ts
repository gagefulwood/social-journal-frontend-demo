"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type { FactListParams, FactListResponse } from "@/types/contacts";

type UseContactFactsOptions = {
  enabled?: boolean;
};

export function useContactFacts(
  contactId: ApiId | null | undefined,
  params: FactListParams = {},
  options: UseContactFactsOptions = {},
) {
  const { enabled = true } = options;
  const [data, setData] = useState<FactListResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(contactId) && enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [loadedPage, setLoadedPage] = useState(params.page ?? 1);
  const requestParams = useMemo(
    () => ({
      page_size: params.page_size,
      search: params.search?.trim() || undefined,
      category: params.category,
      is_conversation_cue: params.is_conversation_cue,
      pinned: params.pinned,
      ordering: params.ordering,
    }),
    [
      params.category,
      params.is_conversation_cue,
      params.ordering,
      params.page_size,
      params.pinned,
      params.search,
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
      const nextData = await contactsApi.listFacts(contactId, {
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
        const nextData = await contactsApi.listFacts(contactId, {
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
      const nextData = await contactsApi.listFacts(contactId, {
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
    facts: data?.results ?? [],
    loading,
    loadingMore,
    error,
    hasMore: Boolean(data?.next),
    loadMore,
    refetch,
  };
}
