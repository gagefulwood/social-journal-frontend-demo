import api from "@/lib/api/client";
import type {
  ContextCategory,
  EducationLevel,
  EntryTag,
  FactCategory,
  InteractionMode,
  MediaType,
  Mood,
  ObservationMarker,
  Occupation,
  Relation,
} from "@/types/lookups";

export type LookupData = {
  moods: Mood[];
  contextCategories: ContextCategory[];
  interactionModes: InteractionMode[];
  factCategories: FactCategory[];
  observationMarkers: ObservationMarker[];
  entryTags: EntryTag[];
  occupations: Occupation[];
  relations: Relation[];
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
      "/api/lookups/context-categories/",
    );
    return res.data;
  },

  async listInteractionModes(): Promise<InteractionMode[]> {
    const res = await api.get<InteractionMode[]>(
      "/api/lookups/interaction-modes/",
    );
    return res.data;
  },

  async listFactCategories(): Promise<FactCategory[]> {
    const res = await api.get<FactCategory[]>("/api/lookups/fact-categories/");
    return res.data;
  },

  async listObservationMarkers(): Promise<ObservationMarker[]> {
    const res = await api.get<ObservationMarker[]>(
      "/api/lookups/observation-markers/",
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

  async listRelations(): Promise<Relation[]> {
    const res = await api.get<Relation[]>("/api/lookups/relations/");
    return res.data;
  },

  async listEducationLevels(): Promise<EducationLevel[]> {
    const res = await api.get<EducationLevel[]>(
      "/api/lookups/education-levels/",
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
      interactionModes,
      factCategories,
      observationMarkers,
      entryTags,
      occupations,
      relations,
      educationLevels,
      mediaTypes,
    ] = await Promise.all([
      this.listMoods(),
      this.listContextCategories(),
      this.listInteractionModes(),
      this.listFactCategories(),
      this.listObservationMarkers(),
      this.listEntryTags(),
      this.listOccupations(),
      this.listRelations(),
      this.listEducationLevels(),
      this.listMediaTypes(),
    ]);

    return {
      moods,
      contextCategories,
      interactionModes,
      factCategories,
      observationMarkers,
      entryTags,
      occupations,
      relations,
      educationLevels,
      mediaTypes,
    };
  },
};
