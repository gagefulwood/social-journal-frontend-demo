import { create } from "zustand";
import { lookupsApi } from "@/lib/api/lookupsApi";
import {
  Mood,
  ContextCategory,
  NoteMarker,
  Occupation,
  EducationLevel,
  DetailCategory,
  MediaType,
  JournalTag,
} from "@/models/lookup";

interface LookupState {
  moods: Mood[];
  categories: ContextCategory[];
  markers: NoteMarker[];
  occupations: Occupation[];
  educationLevels: EducationLevel[];
  detailCategories: DetailCategory[];
  mediaTypes: MediaType[];
  journalTags: JournalTag[];

  isLoading: boolean;
  error: string | null;

  fetchLookups: () => Promise<void>;
}

export const useLookupStore = create<LookupState>((set) => ({
  moods: [],
  categories: [],
  markers: [],
  occupations: [],
  educationLevels: [],
  detailCategories: [],
  mediaTypes: [],
  journalTags: [],

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
        educationLevels: data.educationLevels,
        detailCategories: data.detailCategories,
        mediaTypes: data.mediaTypes,
        journalTags: data.journalTags,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch lookups",
        isLoading: false,
      });
    }
  },
}));