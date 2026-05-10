import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
    Event,
    EventParticipant,
    EventLogSummary,
    EventReflectionSummary,
    EventExerciseSummary,
    EventJournalsSummary,
    CreateEventRequest,
    UpdateEventRequest,
    EventListResponse,
} from "@/types/events";

type MaybePaginated<TItem> = TItem[] | { results: TItem[] };

export type EventListParams = {
    page?: number;
    page_size?: number;
    title?: string;
    context_category?: ApiId;
}

function normalizeList<TItem>(data: MaybePaginated<TItem>): TItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.results) ? data.results : [];
}

export const eventsApi = {
    async list(params?: Record<string, any>): Promise<EventListResponse> {
        const response = await api.get<EventListResponse>("/events/", { params });
        return {
            ...response.data,
            results: normalizeList(response.data),
        };
    },

    async get(id: ApiId): Promise<Event> {
        const response = await api.get<Event>(`/events/${id}`);
        return response.data;
    },

    async create(data: CreateEventRequest): Promise<Event> {
        const response = await api.post<Event>("/events", data);
        return response.data;
    },

    async update(id: ApiId, data: UpdateEventRequest): Promise<Event> {
        const response = await api.patch<Event>(`/events/${id}`, data);
        return response.data;
    },

    async remove(id: ApiId): Promise<void> {
        await api.delete(`/events/${id}`);
    },

    async getLogSummary(id: ApiId): Promise<EventLogSummary | null> {
        const response = await api.get<EventLogSummary>(`/events/${id}/log_summary`);
        return response.data;
    },

    async getReflectionSummary(id: ApiId): Promise<EventReflectionSummary | null> {
        const response = await api.get<EventReflectionSummary>(`/events/${id}/reflection_summary`);
        return response.data;
    },

    async getExerciseSummary(id: ApiId): Promise<EventExerciseSummary | null> {
        const response = await api.get<EventExerciseSummary>(`/events/${id}/exercise_summary`);
        return response.data;
    },

    async getJournalsSummary(id: ApiId): Promise<EventJournalsSummary> {
        const response = await api.get<EventJournalsSummary>(`/events/${id}/journals_summary`);
        return response.data;
    },

    async getParticipants(id: ApiId): Promise<EventParticipant[]> {
        const response = await api.get<EventParticipant[]>(`/events/${id}/participants`);
        return normalizeList(response.data);
    }
};
