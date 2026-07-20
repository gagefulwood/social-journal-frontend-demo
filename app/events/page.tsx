"use client";

import { Suspense, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Plus,
  RotateCw,
} from "lucide-react";

import {
  CalendarBrowser,
  currentMonthKey,
  MomentsBrowser,
  TimelineBrowser,
} from "@/components/events/EventBrowserViews";
import {
  EventBrowserToolbar,
  type EventBrowserDisplay,
  type EventBrowserView,
} from "@/components/events/EventBrowserToolbar";
import type { EventBrowserFilters } from "@/components/events/EventFilterPopover";
import { Button } from "@/components/ui/button";
import { useEventTimelineSummary } from "@/hooks/useEvent";
import { useLookups } from "@/hooks/useLookups";
import type { EventListParams } from "@/lib/api/eventsApi";

const filterQueryKeys: Record<keyof EventBrowserFilters, string> = {
  contextCategory: "context_category",
  eventAfter: "event_after",
  eventBefore: "event_before",
  hasMood: "has_mood",
  impact: "impact",
  interactionMode: "interaction_mode",
  journaled: "journaled",
  ordering: "ordering",
  participants: "participants",
  tier: "tier",
};

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { contextCategories, isLoading: lookupsLoading } = useLookups();
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    refetch: retrySummary,
  } = useEventTimelineSummary();
  const view = parseView(searchParams.get("view"));
  const display = parseDisplay(searchParams.get("display"));
  const page = parsePage(searchParams.get("page"));
  const searchQuery = searchParams.get("search")?.trim() || "";
  const titleQuery = searchParams.get("title")?.trim() || "";
  const search = searchQuery || titleQuery;
  const month = parseMonth(
    searchParams.get("month"),
    searchParams.get("event_after"),
  );
  const filters = useMemo<EventBrowserFilters>(
    () => ({
      contextCategory: searchParams.get("context_category") ?? "",
      eventAfter: searchParams.get("event_after") ?? "",
      eventBefore: searchParams.get("event_before") ?? "",
      hasMood: parseBooleanFilter(searchParams.get("has_mood")),
      impact: parseImpact(searchParams.get("impact")),
      interactionMode: searchParams.get("interaction_mode") ?? "",
      journaled: parseJournaled(searchParams.get("journaled")),
      ordering: parseOrdering(searchParams.get("ordering")),
      participants: searchParams.get("participants") ?? "",
      tier: parseTier(searchParams.get("tier")),
    }),
    [searchParams],
  );
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasActiveCriteria =
    Boolean(search) ||
    Boolean(filters.contextCategory) ||
    Boolean(filters.eventAfter) ||
    Boolean(filters.eventBefore) ||
    Boolean(filters.hasMood) ||
    Boolean(filters.impact) ||
    Boolean(filters.interactionMode) ||
    Boolean(filters.journaled) ||
    Boolean(filters.participants) ||
    Boolean(filters.tier);
  const listParams = useMemo<EventListParams>(
    () => ({
      search: searchQuery || undefined,
      title: searchQuery ? undefined : titleQuery || undefined,
      event_after: filters.eventAfter || undefined,
      event_before: filters.eventBefore || undefined,
      context_category: filters.contextCategory || undefined,
      tier: filters.tier || undefined,
      impact: filters.impact || undefined,
      interaction_mode: filters.interactionMode || undefined,
      participants: filters.participants || undefined,
      journaled:
        filters.journaled === "" ? undefined : filters.journaled === "true",
      has_mood: filters.hasMood === "" ? undefined : filters.hasMood === "true",
      ordering: filters.ordering || undefined,
    }),
    [filters, searchQuery, titleQuery],
  );

  const updateQuery = useCallback(
    (
      updates: Record<string, string | null | undefined>,
      options: { replace?: boolean; resetPage?: boolean } = {},
    ) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }

      if (options.resetPage) {
        next.delete("page");
      }

      const query = next.toString();
      const href = query ? `${pathname}?${query}` : pathname;
      const navigate = options.replace ? router.replace : router.push;
      navigate(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const changeFilter = useCallback(
    <Key extends keyof EventBrowserFilters>(
      key: Key,
      value: EventBrowserFilters[Key],
    ) => {
      updateQuery(
        { [filterQueryKeys[key]]: value || null },
        { resetPage: true },
      );
    },
    [updateQuery],
  );

  const clearFilters = useCallback(() => {
    updateQuery(
      Object.fromEntries(
        Object.values(filterQueryKeys).map((key) => [key, null]),
      ),
      { resetPage: true },
    );
  }, [updateQuery]);

  const clearCriteria = useCallback(() => {
    updateQuery(
      {
        ...Object.fromEntries(
          Object.values(filterQueryKeys).map((key) => [key, null]),
        ),
        search: null,
        title: null,
      },
      { resetPage: true },
    );
  }, [updateQuery]);

  const changePage = useCallback(
    (nextPage: number) => {
      updateQuery({ page: nextPage > 1 ? String(nextPage) : null });
    },
    [updateQuery],
  );

  return (
    <main className="min-w-0 bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Events
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Browse the moments you&apos;ve shared and what&apos;s coming next.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <EventMetric
                icon={CalendarDays}
                value={
                  summaryLoading || summaryError || !summary
                    ? "—"
                    : String(summary.total_moments)
                }
                label="total events"
              />
              <EventMetric
                icon={Clock3}
                value={
                  summaryLoading || summaryError || !summary
                    ? "—"
                    : String(summary.upcoming)
                }
                label="upcoming"
              />
            </div>
            {summaryError && (
              <div
                role="alert"
                className="mt-3 flex max-w-xl flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2"
              >
                <AlertCircle
                  className="size-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <p className="min-w-0 flex-1 text-xs text-muted-foreground">
                  Event totals are temporarily unavailable. Your events are
                  still shown below.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  disabled={summaryLoading}
                  onClick={retrySummary}
                >
                  <RotateCw
                    className={summaryLoading ? "animate-spin" : undefined}
                    aria-hidden="true"
                  />
                  Retry totals
                </Button>
              </div>
            )}
          </div>

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/events/new">
              <Plus aria-hidden="true" />
              New event
            </Link>
          </Button>
        </header>

        <EventBrowserToolbar
          view={view}
          display={display}
          search={search}
          filters={filters}
          categories={contextCategories}
          lookupsLoading={lookupsLoading}
          activeFilterCount={activeFilterCount}
          onViewChange={(nextView) =>
            updateQuery({ view: nextView }, { resetPage: true })
          }
          onDisplayChange={(nextDisplay) =>
            updateQuery({ display: nextDisplay })
          }
          onSearchChange={(nextSearch) =>
            updateQuery(
              { search: nextSearch || null, title: null },
              { replace: true, resetPage: true },
            )
          }
          onFilterChange={changeFilter}
          onClearFilter={(key) => changeFilter(key, "" as never)}
          onClearFilters={clearFilters}
        />

        {view === "moments" && (
          <MomentsBrowser
            params={listParams}
            page={page}
            display={display}
            totalAccessible={summary?.total_moments ?? null}
            summaryLoading={summaryLoading}
            hasActiveCriteria={hasActiveCriteria}
            onPageChange={changePage}
            onClearCriteria={clearCriteria}
            onOpenCalendar={() =>
              updateQuery({ view: "calendar" }, { resetPage: true })
            }
          />
        )}

        {view === "calendar" && (
          <CalendarBrowser
            params={listParams}
            page={page}
            month={month}
            hasActiveCriteria={hasActiveCriteria}
            onPageChange={changePage}
            onClearCriteria={clearCriteria}
            onMonthChange={(nextMonth) =>
              updateQuery({ month: nextMonth }, { resetPage: true })
            }
          />
        )}

        {view === "timeline" && (
          <TimelineBrowser
            params={listParams}
            page={page}
            hasActiveCriteria={hasActiveCriteria}
            onPageChange={changePage}
            onClearCriteria={clearCriteria}
          />
        )}
      </div>
    </main>
  );
}

function EventMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof CalendarDays;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-xs">
      <Icon className="size-3.5 text-primary" aria-hidden="true" />
      <span className="font-semibold tabular-nums text-foreground">
        {value}
      </span>
      {label}
    </span>
  );
}

function EventsPageSkeleton() {
  return (
    <main className="min-w-0 bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="h-28 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        <div className="h-20 animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function parseView(value: string | null): EventBrowserView {
  return value === "calendar" || value === "timeline" ? value : "moments";
}

function parseDisplay(value: string | null): EventBrowserDisplay {
  return value === "list" ? "list" : "grid";
}

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseMonth(value: string | null, eventAfter: string | null) {
  if (value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return value;
  }

  if (eventAfter) {
    const dateOnlyMatch = /^(\d{4})-(0[1-9]|1[0-2])-\d{2}$/.exec(eventAfter);
    if (dateOnlyMatch) {
      return `${dateOnlyMatch[1]}-${dateOnlyMatch[2]}`;
    }

    const date = new Date(eventAfter);
    if (!Number.isNaN(date.getTime())) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
  }

  return currentMonthKey();
}

function parseJournaled(
  value: string | null,
): EventBrowserFilters["journaled"] {
  return value === "true" || value === "false" ? value : "";
}

function parseOrdering(value: string | null): EventBrowserFilters["ordering"] {
  return value === "event_timestamp" || value === "-event_timestamp"
    ? value
    : "";
}

function parseTier(value: string | null): EventBrowserFilters["tier"] {
  return value === "routine" || value === "milestone" ? value : "";
}

function parseImpact(value: string | null): EventBrowserFilters["impact"] {
  return value === "negative" || value === "neutral" || value === "positive"
    ? value
    : "";
}

function parseBooleanFilter(
  value: string | null,
): EventBrowserFilters["hasMood"] {
  return value === "true" || value === "false" ? value : "";
}
