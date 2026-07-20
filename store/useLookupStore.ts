import { create } from "zustand";
import { lookupsApi, type LookupData } from "@/lib/api/lookups";
import type { ApiError } from "@/types/auth";
import type { ApiId } from "@/types/api";
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

export type LookupKey = keyof LookupData;

type LookupLoadedState = Record<LookupKey, boolean>;

type LookupStoreState = LookupData & {
  loaded: LookupLoadedState;
  isHydrated: boolean;
  isLoading: boolean;
  error: ApiError | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
  getMoodById: (id: ApiId) => Mood | undefined;
  getContextCategoryById: (id: ApiId) => ContextCategory | undefined;
  getInteractionModeById: (id: ApiId) => InteractionMode | undefined;
  getFactCategoryById: (id: ApiId) => FactCategory | undefined;
  getObservationMarkerById: (id: ApiId) => ObservationMarker | undefined;
  getEntryTagById: (id: ApiId) => EntryTag | undefined;
  getOccupationById: (id: ApiId) => Occupation | undefined;
  getRelationById: (id: ApiId) => Relation | undefined;
  getEducationLevelById: (id: ApiId) => EducationLevel | undefined;
  getMediaTypeById: (id: ApiId) => MediaType | undefined;
};

const emptyLookupData: LookupData = {
  moods: [],
  contextCategories: [],
  interactionModes: [],
  factCategories: [],
  observationMarkers: [],
  entryTags: [],
  occupations: [],
  relations: [],
  educationLevels: [],
  mediaTypes: [],
};

const emptyLoadedState: LookupLoadedState = {
  moods: false,
  contextCategories: false,
  interactionModes: false,
  factCategories: false,
  observationMarkers: false,
  entryTags: false,
  occupations: false,
  relations: false,
  educationLevels: false,
  mediaTypes: false,
};

const fullLoadedState: LookupLoadedState = {
  moods: true,
  contextCategories: true,
  interactionModes: true,
  factCategories: true,
  observationMarkers: true,
  entryTags: true,
  occupations: true,
  relations: true,
  educationLevels: true,
  mediaTypes: true,
};

function idsMatch(left: ApiId, right: ApiId) {
  return String(left) === String(right);
}

function findById<TItem extends { id: ApiId }>(
  items: TItem[],
  id: ApiId,
): TItem | undefined {
  return items.find((item) => idsMatch(item.id, id));
}

function findFactCategoryById(
  categories: FactCategory[],
  id: ApiId,
): FactCategory | undefined {
  for (const category of categories) {
    if (idsMatch(category.id, id)) {
      return category;
    }

    const child = findFactCategoryById(category.children, id);
    if (child) {
      return child;
    }
  }

  return undefined;
}

async function fetchLookupData() {
  return lookupsApi.listAll();
}

export const useLookupStore = create<LookupStoreState>((set, get) => ({
  ...emptyLookupData,
  loaded: emptyLoadedState,
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    const { isHydrated, isLoading } = get();
    if (isHydrated || isLoading) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await fetchLookupData();
      set({
        ...data,
        loaded: fullLoadedState,
        isHydrated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error as ApiError,
      });
    }
  },

  refresh: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await fetchLookupData();
      set({
        ...data,
        loaded: fullLoadedState,
        isHydrated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error as ApiError,
      });
    }
  },

  clear: () =>
    set({
      ...emptyLookupData,
      loaded: emptyLoadedState,
      isHydrated: false,
      isLoading: false,
      error: null,
    }),

  getMoodById: (id) => findById(get().moods, id),
  getContextCategoryById: (id) => findById(get().contextCategories, id),
  getInteractionModeById: (id) => findById(get().interactionModes, id),
  getFactCategoryById: (id) => findFactCategoryById(get().factCategories, id),
  getObservationMarkerById: (id) => findById(get().observationMarkers, id),
  getEntryTagById: (id) => findById(get().entryTags, id),
  getOccupationById: (id) => findById(get().occupations, id),
  getRelationById: (id) => findById(get().relations, id),
  getEducationLevelById: (id) => findById(get().educationLevels, id),
  getMediaTypeById: (id) => findById(get().mediaTypes, id),
}));
