import api from "@/lib/api/client";
import type { JournalEntryPreview, JournalEntry } from "@/models/events";

export const journalApi = {
  list: async (): Promise<JournalEntryPreview[]> => {
    const res = await api.get<JournalEntryPreview[]>("/api/journal/entries/");
    return res.data;
  },

  get: async (id: number): Promise<JournalEntry> => {
    const res = await api.get<JournalEntry>(`/api/journal/entries/${id}/`);
    return res.data;
  },

  create: async (data: { title: string; body: string }): Promise<JournalEntry> => {
    const res = await api.post<JournalEntry>("/api/journal/entries/", data);
    return res.data;
  },
};