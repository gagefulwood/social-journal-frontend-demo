"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ApiId } from "@/types/api";
import type {
  FactListParams,
  ObservationListParams,
  ObservationStatus,
  ObservationType,
} from "@/types/contacts";

type ContextFilterKey =
  | "category"
  | "event"
  | "marker"
  | "observationType"
  | "occurredAfter"
  | "occurredBefore"
  | "status";

type ContextFilters = {
  category: string;
  event: string;
  marker: string;
  observationType: Exclude<ObservationType, null> | "";
  occurredAfter: string;
  occurredBefore: string;
  status: ObservationStatus | "";
};

const PARAMS = {
  category: "context_category",
  event: "context_event",
  marker: "context_marker",
  observationType: "context_type",
  occurredAfter: "context_after",
  occurredBefore: "context_before",
  search: "context_search",
  status: "context_status",
} as const;

export function useContactContextFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get(PARAMS.search) ?? "";
  const filters = useMemo<ContextFilters>(
    () => ({
      category: searchParams.get(PARAMS.category) ?? "",
      event: searchParams.get(PARAMS.event) ?? "",
      marker: searchParams.get(PARAMS.marker) ?? "",
      observationType:
        (searchParams.get(PARAMS.observationType) as ContextFilters["observationType"]) ??
        "",
      occurredAfter: searchParams.get(PARAMS.occurredAfter) ?? "",
      occurredBefore: searchParams.get(PARAMS.occurredBefore) ?? "",
      status:
        (searchParams.get(PARAMS.status) as ContextFilters["status"]) ?? "",
    }),
    [searchParams],
  );

  const replaceParams = useCallback(
    (updates: Partial<Record<string, string>>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }
      }
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const setSearch = useCallback(
    (value: string) => replaceParams({ [PARAMS.search]: value }),
    [replaceParams],
  );
  const setFilter = useCallback(
    (key: ContextFilterKey, value: string) => {
      replaceParams({ [PARAMS[key]]: value });
    },
    [replaceParams],
  );
  const clearFilters = useCallback(() => {
    replaceParams({
      [PARAMS.category]: "",
      [PARAMS.event]: "",
      [PARAMS.marker]: "",
      [PARAMS.observationType]: "",
      [PARAMS.occurredAfter]: "",
      [PARAMS.occurredBefore]: "",
      [PARAMS.search]: "",
      [PARAMS.status]: "",
    });
  }, [replaceParams]);

  const factParams = useMemo<FactListParams>(
    () => ({
      search: search || undefined,
      category: (filters.category || undefined) as ApiId | undefined,
    }),
    [filters.category, search],
  );
  const observationParams = useMemo<ObservationListParams>(
    () => ({
      search: search || undefined,
      status: filters.status || undefined,
      observation_type: filters.observationType || undefined,
      marker: (filters.marker || undefined) as ApiId | undefined,
      event: (filters.event || undefined) as ApiId | undefined,
      occurred_after: filters.occurredAfter || undefined,
      occurred_before: filters.occurredBefore || undefined,
    }),
    [filters, search],
  );

  const activeFilterCount = [
    search,
    filters.category,
    filters.event,
    filters.marker,
    filters.observationType,
    filters.occurredAfter,
    filters.occurredBefore,
    filters.status,
  ].filter(Boolean).length;

  return {
    activeFilterCount,
    clearFilters,
    factParams,
    filters,
    observationParams,
    search,
    setFilter,
    setSearch,
  };
}
