"use client";

import { useEffect } from "react";
import { useLookupStore } from "@/store/useLookupStore";

type UseLookupsOptions = {
  autoLoad?: boolean;
};

export function useLookups(options: UseLookupsOptions = {}) {
  const { autoLoad = true } = options;
  const moods = useLookupStore((state) => state.moods);
  const contextCategories = useLookupStore((state) => state.contextCategories);
  const factCategories = useLookupStore((state) => state.factCategories);
  const observationMarkers = useLookupStore((state) => state.observationMarkers);
  const entryTags = useLookupStore((state) => state.entryTags);
  const occupations = useLookupStore((state) => state.occupations);
  const relations = useLookupStore((state) => state.relations);
  const educationLevels = useLookupStore((state) => state.educationLevels);
  const mediaTypes = useLookupStore((state) => state.mediaTypes);
  const loaded = useLookupStore((state) => state.loaded);
  const isHydrated = useLookupStore((state) => state.isHydrated);
  const isLoading = useLookupStore((state) => state.isLoading);
  const error = useLookupStore((state) => state.error);
  const hydrate = useLookupStore((state) => state.hydrate);
  const refresh = useLookupStore((state) => state.refresh);
  const clear = useLookupStore((state) => state.clear);
  const getMoodById = useLookupStore((state) => state.getMoodById);
  const getContextCategoryById = useLookupStore(
    (state) => state.getContextCategoryById
  );
  const getFactCategoryById = useLookupStore(
    (state) => state.getFactCategoryById
  );
  const getObservationMarkerById = useLookupStore(
    (state) => state.getObservationMarkerById
  );
  const getEntryTagById = useLookupStore((state) => state.getEntryTagById);
  const getOccupationById = useLookupStore((state) => state.getOccupationById);
  const getRelationById = useLookupStore((state) => state.getRelationById);
  const getEducationLevelById = useLookupStore(
    (state) => state.getEducationLevelById
  );
  const getMediaTypeById = useLookupStore((state) => state.getMediaTypeById);


  useEffect(() => {
    if (autoLoad && !isHydrated && !isLoading) {
      void hydrate();
    }
  }, [autoLoad, hydrate, isHydrated, isLoading]);

  return {
    moods,
    contextCategories,
    factCategories,
    observationMarkers,
    entryTags,
    occupations,
    relations,
    educationLevels,
    mediaTypes,
    loaded,
    isHydrated,
    isLoading,
    error,
    hydrate,
    refresh,
    clear,
    getMoodById,
    getContextCategoryById,
    getFactCategoryById,
    getObservationMarkerById,
    getEntryTagById,
    getOccupationById,
    getRelationById,
    getEducationLevelById,
    getMediaTypeById,
  };
}
