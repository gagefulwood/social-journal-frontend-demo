import { create } from "zustand";
import { lookupsApi } from "@/lib/api/lookupsApi";
import {
  Mood,
  ContextCategory,
  NoteMarker,
  Occupation,
} from "@/models";

interface LookupState {
  moods: Mood[];
  categories: ContextCategory[];
  markers: NoteMarker[];
  occupations: Occupation[];

  isLoading: boolean;
  error: string | null;

  fetchLookups: () => Promise<void>;
}

export const useLookupStore = create<LookupState>((set) => ({
  moods: [],
  categories: [],
  markers: [],
  occupations: [],

  isLoading: false,
  error: null,

  fetchLookups: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await lookupsApi.getAll();

      set({
        moods: data.moods,
        categories: data.contexts,
        markers: data.noteMarkers,
        occupations: data.occupations,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch lookups",
        isLoading: false,
      });
    }
  },
}));