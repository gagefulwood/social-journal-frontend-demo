import api from "@/lib/api/client";
import type {
  ContextCategory,
  EducationLevel,
  EntryTag,
  FactCategory,
  MediaType,
  Mood,
  ObservationMarker,
  Occupation,
} from "@/types/lookups";

export type LookupData = {
  moods: Mood[];
  contextCategories: ContextCategory[];
  factCategories: FactCategory[];
  observationMarkers: ObservationMarker[];
  entryTags: EntryTag[];
  occupations: Occupation[];
  educationLevels: EducationLevel[];
  mediaTypes: MediaType[];
};

export const lookupsApi = {
  async listMoods(): Promise<Mood[]> {
    const res = await api.get<Mood[]>("/api/lookups/moods/");
    return res.data;
  },

  async listContextCategories(): Promise<ContextCategory[]> {
    const res = await api.get<ContextCategory[]>(
      "/api/lookups/context-categories/"
    );
    return res.data;
  },

  async listFactCategories(): Promise<FactCategory[]> {
    const res = await api.get<FactCategory[]>(
      "/api/lookups/fact-categories/"
    );
    return res.data;
  },

  async listObservationMarkers(): Promise<ObservationMarker[]> {
    const res = await api.get<ObservationMarker[]>(
      "/api/lookups/observation-markers/"
    );
    return res.data;
  },

  async listEntryTags(): Promise<EntryTag[]> {
    const res = await api.get<EntryTag[]>("/api/lookups/entry-tags/");
    return res.data;
  },

  async listOccupations(): Promise<Occupation[]> {
    const res = await api.get<Occupation[]>("/api/lookups/occupations/");
    return res.data;
  },

  async listEducationLevels(): Promise<EducationLevel[]> {
    const res = await api.get<EducationLevel[]>(
      "/api/lookups/education-levels/"
    );
    return res.data;
  },

  async listMediaTypes(): Promise<MediaType[]> {
    const res = await api.get<MediaType[]>("/api/lookups/media-types/");
    return res.data;
  },

  async listAll(): Promise<LookupData> {
    const [
      moods,
      contextCategories,
      factCategories,
      observationMarkers,
      entryTags,
      occupations,
      educationLevels,
      mediaTypes,
    ] = await Promise.all([
      this.listMoods(),
      this.listContextCategories(),
      this.listFactCategories(),
      this.listObservationMarkers(),
      this.listEntryTags(),
      this.listOccupations(),
      this.listEducationLevels(),
      this.listMediaTypes(),
    ]);

    return {
      moods,
      contextCategories,
      factCategories,
      observationMarkers,
      entryTags,
      occupations,
      educationLevels,
      mediaTypes,
    };
  },
};
