import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  CreateEventRequest,
  Event,
  EventImpact,
  EventExerciseSummary,
  EventJournalsSummary,
  EventListResponse,
  EventLogSummary,
  EventParticipant,
  EventRelatedItem,
  EventReflectionSummary,
  EventTier,
  EventTimelineSummary,
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

  async getLogSummaries(id: ApiId): Promise<EventLogSummary[]> {
    const event = await this.get(id);
    return event.journals.logs;
  },

  async getReflectionSummaries(id: ApiId): Promise<EventReflectionSummary[]> {
    const event = await this.get(id);
    return event.journals.reflections;
  },

  async getExerciseSummaries(id: ApiId): Promise<EventExerciseSummary[]> {
    const event = await this.get(id);
    return event.journals.exercises;
  },

  async getJournalsSummary(id: ApiId): Promise<EventJournalsSummary> {
    const event = await this.get(id);
    return event.journals;
  },

  async getParticipants(id: ApiId): Promise<EventParticipant[]> {
    const event = await this.get(id);
    return event.participants;
  },
};
