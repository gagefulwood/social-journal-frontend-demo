"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { journalApi } from "@/lib/api/journalApi";
import {
  acquirePrivateQuery,
  peekPrivateQuery,
  subscribePrivateQueryInvalidation,
} from "@/lib/api/privateQueryCache";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  ContactJournalSummary,
  JournalFeedParams,
  JournalFilterOptions,
  JournalHubSummary,
  JournalListResponse,
  JournalLookupOption,
  Log,
  LogPatternResponse,
  Reflection,
} from "@/types/journals";

const FEED_STALE_TIME_MS = 30_000;
const SUMMARY_STALE_TIME_MS = 30_000;
const DETAIL_STALE_TIME_MS = 60_000;
const PATTERN_STALE_TIME_MS = 60_000;
const FILTER_OPTIONS_STALE_TIME_MS = 5 * 60_000;
const LOOKUP_STALE_TIME_MS = 5 * 60_000;

const JOURNAL_FEED_TAGS = ["journal", "journal-feed"];
const JOURNAL_HUB_SUMMARY_TAGS = ["journal", "journal-hub-summary"];
const CONTACT_JOURNAL_SUMMARY_TAGS = ["journal", "contact-journal-summary"];
const JOURNAL_DETAIL_TAGS = ["journal", "journal-detail"];
const JOURNAL_PATTERN_TAGS = ["journal", "journal-patterns"];
const JOURNAL_FILTER_OPTION_TAGS = ["journal-filter-options"];
const JOURNAL_LOOKUP_TAGS = ["journal-lookups"];

type CachedQueryState<TData> = {
  key: string;
  data: TData | null;
  error: ApiError | null;
};

type CachedQueryOptions<TData> = {
  key: string;
  enabled?: boolean;
  tags: string[];
  staleTimeMs: number;
  loader: (signal: AbortSignal) => Promise<TData>;
};

function useCachedJournalQuery<TData>({
  key,
  enabled = true,
  tags,
  staleTimeMs,
  loader,
}: CachedQueryOptions<TData>) {
  const loaderRef = useRef(loader);
  const forceRef = useRef(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] = useState<CachedQueryState<TData>>(() => ({
    key,
    data: enabled ? peekPrivateQuery<TData>(key) : null,
    error: null,
  }));

  const refetch = useCallback(() => {
    forceRef.current = true;
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(
    () =>
      subscribePrivateQueryInvalidation(tags, () => {
        forceRef.current = true;
        setRequestVersion((version) => version + 1);
      }),
    [tags],
  );

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    const request = acquirePrivateQuery({
      key,
      tags,
      staleTimeMs,
      force: forceRef.current,
      loader: (signal) => loaderRef.current(signal),
    });
    forceRef.current = false;

    void request.promise.then(
      (data) => {
        if (active) {
          setState({ key, data, error: null });
        }
      },
      (caught) => {
        if (active) {
          setState({
            key,
            data: peekPrivateQuery<TData>(key),
            error: caught as ApiError,
          });
        }
      },
    );

    return () => {
      active = false;
      request.release();
    };
  }, [enabled, key, requestVersion, staleTimeMs, tags]);

  const cached = enabled ? peekPrivateQuery<TData>(key) : null;
  const visible =
    enabled && state.key === key
      ? state
      : {
          key,
          data: cached,
          error: null,
        };

  return {
    data: visible.data,
    loading: enabled && visible.data == null && visible.error == null,
    error: visible.error,
    refetch,
  };
}

function stableParams(params: JournalFeedParams) {
  return {
    page: params.page,
    page_size: params.page_size,
    family: params.family,
    status: params.status,
    format: params.format,
    search: params.search?.trim() || undefined,
    contact: params.contact,
    related_contact: params.related_contact,
    event: params.event,
    chapter: params.chapter,
    occurred_after: params.occurred_after,
    occurred_before: params.occurred_before,
    ordering: params.ordering,
  } satisfies JournalFeedParams;
}

function queryKey(
  prefix: string,
  params: Record<string, unknown> | JournalFeedParams,
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([name, value]) => {
    if (value != null && value !== "") {
      query.set(name, String(value));
    }
  });
  const serialized = query.toString();
  return `${prefix}${serialized ? `?${serialized}` : ""}`;
}

export function useJournalFeed(params: JournalFeedParams = {}) {
  const {
    contact,
    related_contact,
    event,
    chapter,
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
        related_contact,
        event,
        chapter,
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
      related_contact,
      event,
      chapter,
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
  const key = useMemo(
    () => queryKey("journal-feed", requestParams),
    [requestParams],
  );
  const query = useCachedJournalQuery<JournalListResponse>({
    key,
    tags: JOURNAL_FEED_TAGS,
    staleTimeMs: FEED_STALE_TIME_MS,
    loader: (signal) => journalApi.listFeed(requestParams, { signal }),
  });

  return {
    ...query,
    entries: query.data?.results ?? [],
  };
}

export function useJournalHubSummary(enabled = true) {
  return useCachedJournalQuery<JournalHubSummary>({
    key: "journal-hub-summary",
    enabled,
    tags: JOURNAL_HUB_SUMMARY_TAGS,
    staleTimeMs: SUMMARY_STALE_TIME_MS,
    loader: (signal) => journalApi.getHubSummary({ signal }),
  });
}

export function useContactJournalSummary(contactId: ApiId | null | undefined) {
  const key = `contact-journal-summary:${String(contactId ?? "none")}`;
  return useCachedJournalQuery<ContactJournalSummary>({
    key,
    enabled: contactId != null,
    tags: CONTACT_JOURNAL_SUMMARY_TAGS,
    staleTimeMs: SUMMARY_STALE_TIME_MS,
    loader: (signal) => journalApi.getContactSummary(contactId!, { signal }),
  });
}

export function useJournalFilterOptions({
  enabled,
  relatedContact,
}: {
  enabled: boolean;
  relatedContact?: ApiId;
}) {
  const requestParams = useMemo(
    () => ({
      limit: 100,
      related_contact: relatedContact,
    }),
    [relatedContact],
  );
  const key = useMemo(
    () => queryKey("journal-filter-options", requestParams),
    [requestParams],
  );
  return useCachedJournalQuery<JournalFilterOptions>({
    key,
    enabled,
    tags: JOURNAL_FILTER_OPTION_TAGS,
    staleTimeMs: FILTER_OPTIONS_STALE_TIME_MS,
    loader: (signal) =>
      journalApi.getFilterOptions(requestParams, {
        signal,
      }),
  });
}

export function useJournalLookupOptions(
  kind: Parameters<typeof journalApi.listLookups>[0],
) {
  return useCachedJournalQuery<JournalLookupOption[]>({
    key: `journal-lookups:${kind}`,
    tags: JOURNAL_LOOKUP_TAGS,
    staleTimeMs: LOOKUP_STALE_TIME_MS,
    loader: (signal) => journalApi.listLookups(kind, { signal }),
  });
}

function useJournalDetail<TEntry>(
  family: "log" | "reflection",
  id: ApiId | null | undefined,
  loader: (id: ApiId, signal: AbortSignal) => Promise<TEntry>,
) {
  const key = `journal-detail:${family}:${String(id ?? "none")}`;
  const query = useCachedJournalQuery<TEntry>({
    key,
    enabled: id != null,
    tags: JOURNAL_DETAIL_TAGS,
    staleTimeMs: DETAIL_STALE_TIME_MS,
    loader: (signal) => loader(id!, signal),
  });
  return {
    ...query,
    entry: query.data,
  };
}

export function useLog(id: ApiId | null | undefined) {
  return useJournalDetail<Log>("log", id, (journalId, signal) =>
    journalApi.getLog(journalId, { signal }),
  );
}

export function useReflection(id: ApiId | null | undefined) {
  return useJournalDetail<Reflection>("reflection", id, (journalId, signal) =>
    journalApi.getReflection(journalId, {
      signal,
    }),
  );
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
  const key = useMemo(
    () => queryKey("journal-patterns", requestParams),
    [requestParams],
  );
  return useCachedJournalQuery<LogPatternResponse>({
    key,
    tags: JOURNAL_PATTERN_TAGS,
    staleTimeMs: PATTERN_STALE_TIME_MS,
    loader: (signal) =>
      journalApi.getLogPatterns(requestParams, {
        signal,
      }),
  });
}
