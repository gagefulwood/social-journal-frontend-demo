import api from "./client";
import axios from "axios";
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
  async getAll(): Promise<{
    occupations: Occupation[];
    educationLevels: EducationLevel[];
    moods: Mood[];
    contexts: ContextCategory[];
    detailCategories: DetailCategory[];
    noteMarkers: NoteMarker[];
    mediaTypes: MediaType[];
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
      ] = await Promise.all([
        api.get("/lookups/occupations"),
        api.get("/lookups/education-levels"),
        api.get("/lookups/moods"),
        api.get("/lookups/context-categories"),
        api.get("/lookups/detail-categories"),
        api.get("/lookups/note-markers"),
        api.get("/lookups/media-types"),
      ]);

      return {
        occupations: occupations.data,
        educationLevels: educationLevels.data,
        moods: moods.data,
        contexts: contexts.data,
        detailCategories: detailCategories.data,
        noteMarkers: noteMarkers.data,
        mediaTypes: mediaTypes.data,
      };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        throw {
          message: "Failed to fetch lookups",
          status: err.response?.status,
        } as ApiError;
      }
      throw { message: "Unknown error" } as ApiError;
    }
  },
};