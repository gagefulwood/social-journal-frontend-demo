"use client";

import { useEffect, useRef } from "react";
import { Grid2X2, List, Search, X } from "lucide-react";

import {
  EventFilterPopover,
  type EventBrowserFilters,
} from "@/components/events/EventFilterPopover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ContextCategory } from "@/types/lookups";

export type EventBrowserView = "moments" | "calendar" | "timeline";
export type EventBrowserDisplay = "grid" | "list";

type EventBrowserToolbarProps = {
  view: EventBrowserView;
  display: EventBrowserDisplay;
  search: string;
  filters: EventBrowserFilters;
  categories: ContextCategory[];
  lookupsLoading: boolean;
  activeFilterCount: number;
  onViewChange: (view: EventBrowserView) => void;
  onDisplayChange: (display: EventBrowserDisplay) => void;
  onSearchChange: (search: string) => void;
  onFilterChange: <Key extends keyof EventBrowserFilters>(
    key: Key,
    value: EventBrowserFilters[Key],
  ) => void;
  onClearFilter: (key: keyof EventBrowserFilters) => void;
  onClearFilters: () => void;
};

export function EventBrowserToolbar({
  view,
  display,
  search,
  filters,
  categories,
  lookupsLoading,
  activeFilterCount,
  onViewChange,
  onDisplayChange,
  onSearchChange,
  onFilterChange,
  onClearFilter,
  onClearFilters,
}: EventBrowserToolbarProps) {
  const chips = buildFilterChips(filters, categories);

  return (
    <section
      aria-label="Event browser controls"
      className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4"
    >
      <div className="grid min-w-0 gap-3 lg:grid-cols-[auto_minmax(12rem,1fr)_auto_auto] lg:items-center">
        <Tabs
          value={view}
          onValueChange={(value) => onViewChange(value as EventBrowserView)}
        >
          <TabsList className="grid w-full grid-cols-3 group-data-horizontal/tabs:h-10 sm:w-fit">
            <TabsTrigger value="moments">Moments</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>

        <SearchControl search={search} onSearchChange={onSearchChange} />

        <EventFilterPopover
          filters={filters}
          categories={categories}
          isLoading={lookupsLoading}
          activeFilterCount={activeFilterCount}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
        />

        {view === "moments" && (
          <div
            className="inline-flex h-10 w-fit items-center rounded-md border border-border bg-background p-1 shadow-xs lg:justify-self-end"
            role="group"
            aria-label="Event display"
          >
            <DisplayButton
              active={display === "grid"}
              label="Grid view"
              onClick={() => onDisplayChange("grid")}
            >
              <Grid2X2 aria-hidden="true" />
            </DisplayButton>
            <DisplayButton
              active={display === "list"}
              label="List view"
              onClick={() => onDisplayChange("list")}
            >
              <List aria-hidden="true" />
            </DisplayButton>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 border-t border-border/70 pt-3">
          <span className="text-xs font-medium text-muted-foreground">
            Active filters
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground outline-none transition-colors hover:bg-accent/80 focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={() => onClearFilter(chip.key)}
              aria-label={`Remove ${chip.label} filter`}
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={onClearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </section>
  );
}

function SearchControl({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (search: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== search) {
      inputRef.current.value = search;
    }
    if (searchTimer.current != null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
  }, [search]);

  useEffect(() => {
    return () => {
      if (searchTimer.current != null) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, []);

  function scheduleSearch(nextSearch: string) {
    if (searchTimer.current != null) {
      window.clearTimeout(searchTimer.current);
    }
    searchTimer.current = window.setTimeout(() => {
      onSearchChange(nextSearch.trim());
      searchTimer.current = null;
    }, 300);
  }

  function commitSearch() {
    if (searchTimer.current != null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    onSearchChange(inputRef.current?.value.trim() ?? "");
  }

  return (
    <form
      className="relative min-w-0"
      onSubmit={(event) => {
        event.preventDefault();
        commitSearch();
      }}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        type="search"
        defaultValue={search}
        placeholder="Search moments, people, or places"
        aria-label="Search events"
        className="h-10 bg-background pr-3 pl-9"
        onChange={(event) => scheduleSearch(event.target.value)}
        onBlur={commitSearch}
      />
    </form>
  );
}

function DisplayButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4",
        active
          ? "bg-accent text-accent-foreground shadow-xs"
          : "hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function buildFilterChips(
  filters: EventBrowserFilters,
  categories: ContextCategory[],
) {
  const chips: Array<{ key: keyof EventBrowserFilters; label: string }> = [];

  if (filters.eventAfter) {
    chips.push({
      key: "eventAfter",
      label: `From ${formatFilterDate(filters.eventAfter)}`,
    });
  }
  if (filters.eventBefore) {
    chips.push({
      key: "eventBefore",
      label: `Through ${formatFilterDate(filters.eventBefore)}`,
    });
  }
  if (filters.contextCategory) {
    const category = categories.find(
      (item) => String(item.id) === filters.contextCategory,
    );
    chips.push({
      key: "contextCategory",
      label: category?.name ?? `Category ${filters.contextCategory}`,
    });
  }
  if (filters.tier) {
    chips.push({
      key: "tier",
      label: filters.tier === "milestone" ? "Milestones" : "Routine",
    });
  }
  if (filters.journaled) {
    chips.push({
      key: "journaled",
      label:
        filters.journaled === "true" ? "With a Journal" : "Without a Journal",
    });
  }
  if (filters.impact) {
    chips.push({
      key: "impact",
      label: `${filters.impact[0].toUpperCase()}${filters.impact.slice(1)} impact`,
    });
  }
  if (filters.interactionMode) {
    chips.push({
      key: "interactionMode",
      label: `Interaction mode ${filters.interactionMode}`,
    });
  }
  if (filters.participants) {
    chips.push({
      key: "participants",
      label: "Participant filter",
    });
  }
  if (filters.hasMood) {
    chips.push({
      key: "hasMood",
      label: filters.hasMood === "true" ? "With mood" : "Without mood",
    });
  }
  if (filters.ordering) {
    chips.push({
      key: "ordering",
      label:
        filters.ordering === "event_timestamp"
          ? "Oldest first"
          : "Newest first",
    });
  }

  return chips;
}

function formatFilterDate(value: string) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(
        Number(dateOnlyMatch[1]),
        Number(dateOnlyMatch[2]) - 1,
        Number(dateOnlyMatch[3]),
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
