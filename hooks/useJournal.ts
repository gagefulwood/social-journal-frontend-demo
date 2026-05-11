"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  journalApi,
  type JournalFeedParams,
} from "@/lib/api/journalApi";
import type { ApiError } from "@/types/auth";
import type {
  CombinedJournalFeedItem,
  ExerciseListItem,
  LogListItem,
  ReflectionListItem,
} from "@/types/journals";
import type { PaginatedResponse } from "@/types/api";

export type LogListParams = {
  page?: number;
  page_size?: number;
  title?: string;
  mood?: string;
  entry_tag?: string;
};

export type ReflectionListParams = {
    page?: number;
    page_size?: number;
    title?: string;
    mood?: string;
    entry_tag?: string;
};

export type ExerciseListParams = {
    page?: number;
    page_size?: number;
    title?: string;
    mood?: string;
    entry_tag?: string;
};

type LogListResponse = PaginatedResponse<LogListItem>;
type ReflectionListResponse = PaginatedResponse<ReflectionListItem>;
type ExerciseListResponse = PaginatedResponse<ExerciseListItem>;
type JournalFeedResponse = PaginatedResponse<CombinedJournalFeedItem>;

export function useJournalFeed(params: JournalFeedParams = {}) {
  const [data, setData] = useState<JournalFeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      event: params.event,
      kind: params.kind,
      created_after: params.created_after,
      created_before: params.created_before,
    }),
    [
      params.page,
      params.page_size,
      params.title,
      params.event,
      params.kind,
      params.created_after,
      params.created_before,
    ]
  );

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await journalApi.listFeed(requestParams);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadFeed() {
      setLoading(true);
      setError(null);

      try {
        const response = await journalApi.listFeed(requestParams);
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

    void loadFeed();

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  return {
    data,
    entries: data?.results ?? [],
    loading,
    error,
    refetch: fetchFeed,
  };
}

export function useLogs(params: LogListParams = {}) {
  const [data, setData] = useState<LogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      mood: params.mood || undefined,
      entry_tag: params.entry_tag || undefined,
    }),
    [params.title, params.mood, params.entry_tag, params.page, params.page_size]
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

export function useRefs(params: ReflectionListParams = {}) {
  const [data, setData] = useState<ReflectionListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      mood: params.mood || undefined,
      entry_tag: params.entry_tag || undefined,
    }),
    [params.title, params.mood, params.entry_tag, params.page, params.page_size]
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await journalApi.listReflections(requestParams);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadRefs() {
      setLoading(true);
      setError(null);

      try {
        const response = await journalApi.listReflections(requestParams);
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

    void loadRefs();

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  return {
    data,
    reflections: data?.results ?? [],
    loading,
    error,
    refetch: fetchLogs,
  };
}

export function useExercises(params: ExerciseListParams = {}) {
  const [data, setData] = useState<ExerciseListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      mood: params.mood || undefined,
      entry_tag: params.entry_tag || undefined,
    }),
    [params.title, params.mood, params.entry_tag, params.page, params.page_size]
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await journalApi.listExercises(requestParams);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadExercises() {
      setLoading(true);
      setError(null);

      try {
        const response = await journalApi.listExercises(requestParams);
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

    void loadExercises();

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  return {
    data,
    exercises: data?.results ?? [],
    loading,
    error,
    refetch: fetchLogs,
  };
}
