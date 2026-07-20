"use client";

import { Filter } from "lucide-react";

import { inclusiveTimestampBefore } from "@/components/events/event-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ContextCategory } from "@/types/lookups";

export type EventBrowserFilters = {
  contextCategory: string;
  eventAfter: string;
  eventBefore: string;
  hasMood: "" | "true" | "false";
  impact: "" | "negative" | "neutral" | "positive";
  interactionMode: string;
  journaled: "" | "true" | "false";
  ordering: "" | "event_timestamp" | "-event_timestamp";
  participants: string;
  tier: "" | "routine" | "milestone";
};

type EventFilterPopoverProps = {
  filters: EventBrowserFilters;
  categories: ContextCategory[];
  isLoading: boolean;
  activeFilterCount: number;
  onFilterChange: <Key extends keyof EventBrowserFilters>(
    key: Key,
    value: EventBrowserFilters[Key],
  ) => void;
  onClearFilters: () => void;
};

export function EventFilterPopover({
  filters,
  categories,
  isLoading,
  activeFilterCount,
  onFilterChange,
  onClearFilters,
}: EventFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-10">
          <Filter className="size-4" aria-hidden="true" />
          {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : "Filters"}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        collisionPadding={12}
        className="max-h-[var(--radix-popover-content-available-height)] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain"
      >
        <PopoverHeader>
          <PopoverTitle>Filter events</PopoverTitle>
          <PopoverDescription>
            Narrow the browser using saved Event details.
          </PopoverDescription>
        </PopoverHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <FilterRow label="From date" htmlFor="event-filter-after">
            <Input
              id="event-filter-after"
              type="date"
              className="h-10"
              value={dateInputValue(filters.eventAfter)}
              onChange={(event) =>
                onFilterChange(
                  "eventAfter",
                  event.target.value
                    ? localDateBoundary(event.target.value, "start")
                    : "",
                )
              }
            />
          </FilterRow>

          <FilterRow label="Through date" htmlFor="event-filter-before">
            <Input
              id="event-filter-before"
              type="date"
              className="h-10"
              value={dateInputValue(filters.eventBefore)}
              onChange={(event) =>
                onFilterChange(
                  "eventBefore",
                  event.target.value
                    ? localDateBoundary(event.target.value, "end")
                    : "",
                )
              }
            />
          </FilterRow>

          <FilterRow label="Category" htmlFor="event-filter-category">
            <select
              id="event-filter-category"
              value={filters.contextCategory}
              disabled={isLoading}
              className={selectClassName}
              onChange={(event) =>
                onFilterChange("contextCategory", event.target.value)
              }
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </FilterRow>

          <FilterRow label="Tier" htmlFor="event-filter-tier">
            <select
              id="event-filter-tier"
              value={filters.tier}
              className={selectClassName}
              onChange={(event) =>
                onFilterChange(
                  "tier",
                  event.target.value as EventBrowserFilters["tier"],
                )
              }
            >
              <option value="">All tiers</option>
              <option value="routine">Routine</option>
              <option value="milestone">Milestone</option>
            </select>
          </FilterRow>

          <FilterRow label="Impact" htmlFor="event-filter-impact">
            <select
              id="event-filter-impact"
              value={filters.impact}
              className={selectClassName}
              onChange={(event) =>
                onFilterChange(
                  "impact",
                  event.target.value as EventBrowserFilters["impact"],
                )
              }
            >
              <option value="">Any impact</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </FilterRow>

          <FilterRow label="Mood" htmlFor="event-filter-mood">
            <select
              id="event-filter-mood"
              value={filters.hasMood}
              className={selectClassName}
              onChange={(event) =>
                onFilterChange(
                  "hasMood",
                  event.target.value as EventBrowserFilters["hasMood"],
                )
              }
            >
              <option value="">Any mood state</option>
              <option value="true">Mood recorded</option>
              <option value="false">No mood recorded</option>
            </select>
          </FilterRow>

          <FilterRow label="Journal state" htmlFor="event-filter-journaled">
            <select
              id="event-filter-journaled"
              value={filters.journaled}
              className={selectClassName}
              onChange={(event) =>
                onFilterChange(
                  "journaled",
                  event.target.value as EventBrowserFilters["journaled"],
                )
              }
            >
              <option value="">All events</option>
              <option value="true">With a Journal</option>
              <option value="false">Without a Journal</option>
            </select>
          </FilterRow>

          <FilterRow label="Order" htmlFor="event-filter-ordering">
            <select
              id="event-filter-ordering"
              value={filters.ordering}
              className={selectClassName}
              onChange={(event) =>
                onFilterChange(
                  "ordering",
                  event.target.value as EventBrowserFilters["ordering"],
                )
              }
            >
              <option value="">Recommended for this view</option>
              <option value="-event_timestamp">Newest first</option>
              <option value="event_timestamp">Oldest first</option>
            </select>
          </FilterRow>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function dateInputValue(value: string) {
  const dateOnlyMatch = /^(\d{4}-\d{2}-\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    return dateOnlyMatch[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localDateBoundary(value: string, edge: "start" | "end") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const boundary =
    edge === "start"
      ? new Date(year, month, day)
      : new Date(year, month, day + 1);
  return edge === "start"
    ? boundary.toISOString()
    : inclusiveTimestampBefore(boundary);
}

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";
