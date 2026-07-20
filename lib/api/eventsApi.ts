import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  AttachEventMediaRequest,
  CreateEventChapterRequest,
  CreateEventRequest,
  Event,
  EventChapterDetail,
  EventChapterHeader,
  EventImpact,
  EventListResponse,
  EventMediaAttachment,
  EventRelatedItem,
  EventTier,
  EventTimelineSummary,
  UpdateEventChapterRequest,
  UpdateEventMediaRequest,
  UpdateEventRequest,
} from "@/types/events";

export type EventListParams = {
  page?: number;
  page_size?: number;
  title?: string;
  search?: string;
  event_after?: string;
  event_before?: string;
  tier?: EventTier;
  impact?: EventImpact;
  context_category?: ApiId;
  interaction_mode?: ApiId;
  participants?: string;
  journaled?: boolean;
  has_mood?: boolean;
  ordering?: "event_timestamp" | "-event_timestamp";
};

export const eventsApi = {
  async list(params?: EventListParams): Promise<EventListResponse> {
    const response = await api.get<EventListResponse>("/api/events/", {
      params,
    });
    return response.data;
  },

  async timelineSummary(
    params?: EventListParams,
  ): Promise<EventTimelineSummary> {
    const response = await api.get<EventTimelineSummary>(
      "/api/events/timeline-summary/",
      { params },
    );
    return response.data;
  },

  async get(id: ApiId): Promise<Event> {
    const response = await api.get<Event>(`/api/events/${id}/`);
    return response.data;
  },

  async getRelated(id: ApiId, limit = 2): Promise<EventRelatedItem[]> {
    const response = await api.get<EventRelatedItem[]>(
      `/api/events/${id}/related/`,
      {
        params: { limit },
      },
    );
    return response.data;
  },

  async listChapters(id: ApiId): Promise<EventChapterHeader[]> {
    const response = await api.get<EventChapterHeader[]>(
      `/api/events/${id}/chapters/`,
    );
    return response.data;
  },

  async getChapter(
    eventId: ApiId,
    chapterId: ApiId,
  ): Promise<EventChapterDetail> {
    const response = await api.get<EventChapterDetail>(
      `/api/events/${eventId}/chapters/${chapterId}/`,
    );
    return response.data;
  },

  async createChapter(
    eventId: ApiId,
    data: CreateEventChapterRequest,
  ): Promise<EventChapterDetail> {
    const response = await api.post<EventChapterDetail>(
      `/api/events/${eventId}/chapters/`,
      data,
    );
    return response.data;
  },

  async updateChapter(
    eventId: ApiId,
    chapterId: ApiId,
    data: UpdateEventChapterRequest,
  ): Promise<EventChapterDetail> {
    const response = await api.patch<EventChapterDetail>(
      `/api/events/${eventId}/chapters/${chapterId}/`,
      data,
    );
    return response.data;
  },

  async removeChapter(eventId: ApiId, chapterId: ApiId): Promise<void> {
    await api.delete(`/api/events/${eventId}/chapters/${chapterId}/`);
  },

  async reorderChapters(
    eventId: ApiId,
    chapterIds: ApiId[],
  ): Promise<EventChapterHeader[]> {
    const response = await api.put<EventChapterHeader[]>(
      `/api/events/${eventId}/chapters/reorder/`,
      { chapter_ids: chapterIds },
    );
    return response.data;
  },

  async materializeLegacyChapter(
    eventId: ApiId,
    data: UpdateEventChapterRequest = {},
  ): Promise<EventChapterDetail> {
    const response = await api.post<EventChapterDetail>(
      `/api/events/${eventId}/chapters/materialize-legacy/`,
      data,
    );
    return response.data;
  },

  async listMedia(
    eventId: ApiId,
    chapterId?: ApiId | null,
  ): Promise<EventMediaAttachment[]> {
    const response = await api.get<EventMediaAttachment[]>(
      `/api/events/${eventId}/media/`,
      {
        params:
          chapterId === undefined
            ? undefined
            : { chapter_id: chapterId === null ? "event" : chapterId },
      },
    );
    return response.data;
  },

  async attachMedia(
    eventId: ApiId,
    data: AttachEventMediaRequest,
  ): Promise<EventMediaAttachment> {
    const response = await api.post<EventMediaAttachment>(
      `/api/events/${eventId}/media/`,
      data,
    );
    return response.data;
  },

  async updateMedia(
    eventId: ApiId,
    attachmentId: ApiId,
    data: UpdateEventMediaRequest,
  ): Promise<EventMediaAttachment> {
    const response = await api.patch<EventMediaAttachment>(
      `/api/events/${eventId}/media/${attachmentId}/`,
      data,
    );
    return response.data;
  },

  async removeMedia(eventId: ApiId, attachmentId: ApiId): Promise<void> {
    await api.delete(`/api/events/${eventId}/media/${attachmentId}/`);
  },

  async reorderMedia(
    eventId: ApiId,
    attachmentIds: ApiId[],
    chapterId?: ApiId | null,
  ): Promise<EventMediaAttachment[]> {
    const response = await api.put<EventMediaAttachment[]>(
      `/api/events/${eventId}/media/reorder/`,
      {
        media_ids: attachmentIds,
        chapter_id: chapterId ?? null,
      },
    );
    return response.data;
  },

  async create(data: CreateEventRequest): Promise<Event> {
    const response = await api.post<Event>("/api/events/", data);
    return response.data;
  },

  async update(id: ApiId, data: UpdateEventRequest): Promise<Event> {
    const response = await api.patch<Event>(`/api/events/${id}/`, data);
    return response.data;
  },

  async remove(id: ApiId): Promise<void> {
    await api.delete(`/api/events/${id}/`);
  },
};
