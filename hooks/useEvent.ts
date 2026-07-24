"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { eventsApi, type EventListParams } from "@/lib/api/eventsApi";
import { subscribePrivateQueryInvalidation } from "@/lib/api/privateQueryCache";
import type { ApiError } from "@/types/auth";
import type { ApiId } from "@/types/api";
import type {
  Event,
  EventChapterDetail,
  EventListResponse,
  EventRelatedItem,
  EventTimelineSummary,
} from "@/types/events";

const chapterDetailCache = new Map<string, EventChapterDetail>();

export function useEvents(params: EventListParams = {}) {
  const [data, setData] = useState<EventListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      title: params.title?.trim() || undefined,
      search: params.search?.trim() || undefined,
      event_after: params.event_after,
      event_before: params.event_before,
      tier: params.tier,
      impact: params.impact || undefined,
      context_category: params.context_category || undefined,
      interaction_mode: params.interaction_mode || undefined,
      participants: params.participants?.trim() || undefined,
      journaled: params.journaled,
      has_mood: params.has_mood,
      ordering: params.ordering,
    }),
    [
      params.page,
      params.page_size,
      params.title,
      params.search,
      params.event_after,
      params.event_before,
      params.tier,
      params.impact,
      params.context_category,
      params.interaction_mode,
      params.participants,
      params.journaled,
      params.has_mood,
      params.ordering,
    ],
  );

  const fetchEvents = useCallback(async () => {
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
  };
}

export function useEventTimelineSummary(params: EventListParams = {}) {
  const [summary, setSummary] = useState<EventTimelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const requestParams = useMemo(
    () => ({
      title: params.title?.trim() || undefined,
      search: params.search?.trim() || undefined,
      event_after: params.event_after,
      event_before: params.event_before,
      tier: params.tier,
      impact: params.impact || undefined,
      context_category: params.context_category || undefined,
      interaction_mode: params.interaction_mode || undefined,
      participants: params.participants?.trim() || undefined,
      journaled: params.journaled,
      has_mood: params.has_mood,
    }),
    [
      params.title,
      params.search,
      params.event_after,
      params.event_before,
      params.tier,
      params.impact,
      params.context_category,
      params.interaction_mode,
      params.participants,
      params.journaled,
      params.has_mood,
    ],
  );

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setSummary(await eventsApi.timelineSummary(requestParams));
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const response = await eventsApi.timelineSummary(requestParams);
        if (isActive) {
          setSummary(response);
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

    void loadSummary();

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}

export function useEvent(id: ApiId | null | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<ApiError | null>(null);

  const eventId = useMemo(() => (id ? String(id) : null), [id]);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await eventsApi.get(eventId);
      setEvent(response);
    } catch (err) {
      setEvent(null);
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    let isActive = true;

    async function loadEvent() {
      if (!eventId) {
        setEvent(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await eventsApi.get(eventId);
        if (isActive) {
          setEvent(response);
        }
      } catch (err) {
        if (isActive) {
          setEvent(null);
          setError(err as ApiError);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [eventId]);

  useEffect(
    () =>
      subscribePrivateQueryInvalidation(["event-journal-summary"], () => {
        void fetchEvent();
      }),
    [fetchEvent],
  );

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}

export function useRelatedEvents(id: ApiId | null | undefined, limit = 2) {
  const [relatedEvents, setRelatedEvents] = useState<EventRelatedItem[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<ApiError | null>(null);

  const eventId = useMemo(() => (id ? String(id) : null), [id]);

  const fetchRelatedEvents = useCallback(async () => {
    if (!eventId) {
      setRelatedEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await eventsApi.getRelated(eventId, limit);
      setRelatedEvents(response);
    } catch (err) {
      setRelatedEvents([]);
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [eventId, limit]);

  useEffect(() => {
    let isActive = true;

    async function loadRelatedEvents() {
      if (!eventId) {
        setRelatedEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await eventsApi.getRelated(eventId, limit);
        if (isActive) {
          setRelatedEvents(response);
        }
      } catch (err) {
        if (isActive) {
          setRelatedEvents([]);
          setError(err as ApiError);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadRelatedEvents();

    return () => {
      isActive = false;
    };
  }, [eventId, limit]);

  return {
    relatedEvents,
    loading,
    error,
    refetch: fetchRelatedEvents,
  };
}

export function useEventChapter(
  eventId: ApiId | null | undefined,
  chapterId: ApiId | null | undefined,
  projection: EventChapterDetail | null = null,
) {
  const eventKey = eventId == null ? null : String(eventId);
  const chapterKey = chapterId == null ? null : String(chapterId);
  const cacheKey = eventKey && chapterKey ? `${eventKey}:${chapterKey}` : null;
  const [chapter, setChapter] = useState<EventChapterDetail | null>(() =>
    cacheKey ? (chapterDetailCache.get(cacheKey) ?? null) : projection,
  );
  const [loading, setLoading] = useState(Boolean(cacheKey && !chapter));
  const [error, setError] = useState<ApiError | null>(null);

  const fetchChapter = useCallback(async () => {
    if (!eventKey || !chapterKey || !cacheKey) {
      setChapter(projection);
      setLoading(false);
      setError(null);
      return projection;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getChapter(eventKey, chapterKey);
      chapterDetailCache.set(cacheKey, response);
      setChapter(response);
      return response;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, chapterKey, eventKey, projection]);

  useEffect(() => {
    let isActive = true;

    async function loadChapter() {
      if (!eventKey || !chapterKey || !cacheKey) {
        if (isActive) {
          setChapter(projection);
          setLoading(false);
          setError(null);
        }
        return;
      }

      const cached = chapterDetailCache.get(cacheKey);
      if (cached) {
        if (isActive) {
          setChapter(cached);
          setLoading(false);
          setError(null);
        }
      } else if (isActive) {
        setChapter(null);
        setLoading(true);
        setError(null);
      }
      try {
        const response = await eventsApi.getChapter(eventKey, chapterKey);
        chapterDetailCache.set(cacheKey, response);
        if (isActive) setChapter(response);
      } catch (err) {
        // A cached chapter remains useful when a background revalidation
        // fails. Only replace the surface with an error when there was no
        // prior value to render.
        if (isActive && !cached) setError(err as ApiError);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadChapter();

    return () => {
      isActive = false;
    };
  }, [cacheKey, chapterKey, eventKey, projection]);

  const invalidate = useCallback(() => {
    if (cacheKey) chapterDetailCache.delete(cacheKey);
    void fetchChapter().catch(() => undefined);
  }, [cacheKey, fetchChapter]);

  return {
    chapter,
    loading,
    error,
    refetch: fetchChapter,
    invalidate,
  };
}
