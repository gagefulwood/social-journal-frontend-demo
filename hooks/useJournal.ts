"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { journalApi } from "@/lib/api/journalApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  JournalFeedParams,
  JournalListResponse,
  Log,
  LogPatternResponse,
  Reflection,
} from "@/types/journals";

function stableParams(params: JournalFeedParams) {
  return {
    page: params.page,
    page_size: params.page_size,
    family: params.family,
    status: params.status,
    format: params.format,
    search: params.search?.trim() || undefined,
    contact: params.contact,
    event: params.event,
    occurred_after: params.occurred_after,
    occurred_before: params.occurred_before,
    ordering: params.ordering,
  } satisfies JournalFeedParams;
}

export function useJournalFeed(params: JournalFeedParams = {}) {
  const {
    contact,
    event,
    family,
    format,
    occurred_after,
    occurred_before,
    ordering,
    page,
    page_size,
    search,
    status,
  } = params;
  const requestParams = useMemo(
    () =>
      stableParams({
        contact,
        event,
        family,
        format,
        occurred_after,
        occurred_before,
        ordering,
        page,
        page_size,
        search,
        status,
      }),
    [
      contact,
      event,
      family,
      format,
      occurred_after,
      occurred_before,
      ordering,
      page,
      page_size,
      search,
      status,
    ],
  );
  const [data, setData] = useState<JournalListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const response = await journalApi.listFeed(requestParams, {
          signal: controller.signal,
        });
        if (isActive) {
          setData(response);
        }
      } catch (caught) {
        if (isActive && !controller.signal.aborted) {
          setError(caught as ApiError);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [requestParams, requestVersion]);

  return {
    data,
    entries: data?.results ?? [],
    loading,
    error,
    refetch,
  };
}

type JournalDetailState<TEntry> = {
  request: {
    target: { id: ApiId | null };
    version: number;
  };
  entry: TEntry | null;
  loading: boolean;
  error: ApiError | null;
};

function useJournalDetail<TEntry>(
  id: ApiId | null | undefined,
  loader: (id: ApiId) => Promise<TEntry>,
) {
  const requestId = id ?? null;
  const requestTarget = useMemo(() => ({ id: requestId }), [requestId]);
  const [requestVersion, setRequestVersion] = useState(0);
  const request = useMemo(
    () => ({ target: requestTarget, version: requestVersion }),
    [requestTarget, requestVersion],
  );
  const [state, setState] = useState<JournalDetailState<TEntry>>({
    request,
    entry: null,
    loading: requestId != null,
    error: null,
  });
  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (requestId == null) {
      return;
    }

    void loader(requestId)
      .then((entry) => {
        if (isActive) {
          setState({
            request,
            entry,
            loading: false,
            error: null,
          });
        }
      })
      .catch((caught) => {
        if (isActive) {
          setState({
            request,
            entry: null,
            loading: false,
            error: caught as ApiError,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [loader, request, requestId]);

  const isCurrentRequest = state.request === request;
  const visibleState = isCurrentRequest
    ? state
    : {
        entry: state.request.target === requestTarget ? state.entry : null,
        loading: requestId != null,
        error: null,
      };

  return {
    entry: visibleState.entry,
    loading: visibleState.loading,
    error: visibleState.error,
    refetch,
  };
}

export function useLog(id: ApiId | null | undefined) {
  return useJournalDetail<Log>(id, journalApi.getLog);
}

export function useReflection(id: ApiId | null | undefined) {
  return useJournalDetail<Reflection>(id, journalApi.getReflection);
}

export function useLogPatterns(
  params: {
    format?: Parameters<typeof journalApi.getLogPatterns>[0] extends infer T
      ? T extends { format?: infer F }
        ? F
        : never
      : never;
    days?: number;
  } = {},
) {
  const { days, format } = params;
  const requestParams = useMemo(() => ({ days, format }), [days, format]);
  const [state, setState] = useState<{
    requestParams: typeof requestParams;
    data: LogPatternResponse | null;
    loading: boolean;
    error: ApiError | null;
  }>({
    requestParams,
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isActive = true;

    void journalApi
      .getLogPatterns(requestParams)
      .then((response) => {
        if (isActive) {
          setState({
            requestParams,
            data: response,
            loading: false,
            error: null,
          });
        }
      })
      .catch((caught) => {
        if (isActive) {
          setState((current) => ({
            requestParams,
            data: current.data,
            loading: false,
            error: caught as ApiError,
          }));
        }
      });

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  const visibleState =
    state.requestParams === requestParams
      ? state
      : { ...state, loading: true, error: null };

  return {
    data: visibleState.data,
    loading: visibleState.loading,
    error: visibleState.error,
  };
}
