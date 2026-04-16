"use client";

import { useEffect } from "react";
import { useLookupStore } from "@/store/useLookupStore";

export function useLookups() {
  const { moods, categories, markers, occupations, fetchLookups } =
    useLookupStore();

  useEffect(() => {
    if (moods.length === 0) {
      fetchLookups();
    }
  }, [moods.length, fetchLookups]);

  return { moods, categories, markers, occupations };
}