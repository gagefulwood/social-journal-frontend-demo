import api from "@/lib/api/client";
import type { JournalEntry, JournalEntryPreview, Reflection } from "@/models/events";

export const journalApi = {
  /**
   * GET /api/journal/entries/
   * Returns paginated list of the authenticated user's journal entries.
   */
  async list(params?: {
    mood_id?: number;
    entry_timestamp_after?: string;
    entry_timestamp_before?: string;
  }): Promise<{ count: number; results: JournalEntryPreview[] }> {
    const res = await api.get<{ count: number; results: JournalEntryPreview[] }>(
      "/api/journals/",
      { params }
    );
    return res.data;
  },

  /**
   * GET /api/journal/entries/{id}/
   * Returns full detail for a single journal entry.
   */
  async get(id: string): Promise<JournalEntry> {
    const res = await api.get<JournalEntry>(`/api/journals/${id}/`);
    return res.data;
  },

  /**
   * POST /api/journal/entries/
   * Creates a new journal entry, event_id is optional for standalone entries.
   */
  async create(data: {
    title: string;
    body: string;
    event_id?: string;
    mood?: number | null;
    tags?: number[];
  }): Promise<JournalEntry> {
    const res = await api.post<JournalEntry>("/api/journals/", data);
    return res.data;
  },

  /**
   * PATCH /api/journal/entries/{id}/
   * Updates title, mood, or tags only. Body is immutable after creation.
   */
  async update(id: string, data: {
    title?: string;
    mood?: number | null;
    tags?: number[];
  }): Promise<JournalEntry> {
    const res = await api.patch<JournalEntry>(`/api/journals/${id}/`, data);
    return res.data;
  },

  /**
   * GET /api/journal/entries/{entryId}/reflections/
   * Returns all reflections for a journal entry ordered ascending.
   */
  async listReflections(entryId: string): Promise<Reflection[]> {
    const res = await api.get<Reflection[]>(
      `/api/journals/${entryId}/reflections/`
    );
    return res.data;
  },

  /**
   * POST /api/journal/entries/{entryId}/reflections/
   * Adds a reflection. Returns 429 if within rate-limited 12-hour cooldown
   */
  async createReflection(entryId: string, data: { body: string }): Promise<Reflection> {
    const res = await api.post<Reflection>(
      `/api/journals/${entryId}/reflections/`,
      data
    );
    return res.data;
  },
};
