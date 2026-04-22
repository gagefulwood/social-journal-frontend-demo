import api from "./client";
import {
  Occupation,
  EducationLevel,
  Mood,
  ContextCategory,
  DetailCategory,
  NoteMarker,
  MediaType,
} from "@/models";
import { ApiError } from "./types";

export const lookupsApi = {
  /**
   * Fetches all lookup tables in parallel.
   * Called once when the app loads and is stored in useLookupStore.
   */
  async getAll(): Promise<{
    occupations: Occupation[];
    educationLevels: EducationLevel[];
    moods: Mood[];
    contexts: ContextCategory[];
    detailCategories: DetailCategory[];
    noteMarkers: NoteMarker[];
    mediaTypes: MediaType[];
    journalTags: { id: number; tag_name: string }[];
  }> {
    try {
      const [
        occupations,
        educationLevels,
        moods,
        contexts,
        detailCategories,
        noteMarkers,
        mediaTypes,
        journalTags,
      ] = await Promise.all([
        api.get("/api/lookups/occupations/"),
        api.get("/api/lookups/education-levels/"),
        api.get("/api/lookups/moods/"),
        api.get("/api/lookups/context-categories/"),
        api.get("/api/lookups/detail-categories/"),
        api.get("/api/lookups/note-markers/"),
        api.get("/api/lookups/media-types/"),
        api.get("/api/lookups/journal-tags/"),
      ]);

      return {
        occupations: occupations.data,
        educationLevels: educationLevels.data,
        moods: moods.data,
        contexts: contexts.data,
        detailCategories: detailCategories.data,
        noteMarkers: noteMarkers.data,
        mediaTypes: mediaTypes.data,
        journalTags: journalTags.data,
      };
    } catch (err: unknown) {
      throw {
        message: "Failed to fetch lookups",
        status: (err as { response?: {status?: number } }).response?.status,
      } as ApiError;
    }
  },
};