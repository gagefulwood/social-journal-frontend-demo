import api from "./client";
import { Event, EventSummary } from "@/models/events";
import { ApiError } from "./types";

export const eventsApi = {
  /**
   * GET /api/events/
   * Returns paginated list of authenticated user events
   */
  async list(params?: {
    context_category_id?: number;
    mood_id?: number;
  }): Promise<{ count: number; results: EventSummary[] }> {
    try {
      const res = await api.get("/api/events/", { params });
      return res.data;
    } catch (err: unknown) {
      throw {
        message: "Failed to fetch events",
        status: (err as { response?: { status?: number } }).response?.status,
      } as ApiError;
    }
  },

  /**
   * GET /api/events/{id}/
   * Returns full detail for a single event including participants.
   */
  async get(id: string): Promise<Event> {
    try {
      const res = await api.get<Event>(`/api/events/${id}/`);
      return res.data;
    } catch (err: unknown) {
      throw {
        message: "Failed to fetch event",
        status: (err as { response?: { status?: number } }).response?.status,
      } as ApiError;
    }
  },

  /** 
   * POST /api/events/
   * Creates a new event, user is set server-side from request.user,
   * participant_ids is an optional list of contact UUIDs.
   */
  async create(data: {
    title: string;
    event_timestamp: string;
    context_category?: number | null;
    participant_ids?: string[];
  }): Promise<Event> {
    try {
      const res = await api.post<Event>("/api/events/", data);
      return res.data;
    } catch (err: unknown) {
      throw {
        message: "Failed to create event",
        status: (err as {response?: {status?: number } }).response?.status,
      } as ApiError;
    }
  },

  /** PATCH /api/events/{id}/
   * Updates allowed fields on an existing event.
   */
  async update(id: string, data: {
    title?: string;
    event_timestamp?: string;
    context_category?: number | null;
  }): Promise<Event> {
    try {
      const res = await api.patch<Event>(`/api/events/${id}/`, data);
      return res.data;
    } catch (err: unknown) {
      throw {
        message: "Failed to update event",
        status: (err as { response?: { status?: number } }).response?.status,
      } as ApiError;
    }
  },

  /**
   * DELETE /api/events/{id}/
   * Permanently removes the event and cascades to participant rows.
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/api/events/${id}/`);
    } catch (err: unknown) {
      throw {
        message: "Failed to delete event",
        status: (err as { response?: { status?: number } }).response?.status,
      } as ApiError;
    }
  },
};