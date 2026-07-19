"use client";

import { Filter, Search } from "lucide-react";

import { contactName } from "@/components/contacts/contact-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useContacts } from "@/hooks/useContacts";
import { useEvents } from "@/hooks/useEvent";
import type { JournalFormat } from "@/types/journals";

import {
  JOURNAL_FORMAT_OPTIONS,
  type JournalHubView,
} from "@/components/journals/hub/journalHubUtils";

export type JournalHubFilterValues = {
  contact: string;
  event: string;
  occurredAfter: string;
  occurredBefore: string;
  format?: Exclude<JournalFormat, "legacy">;
};

type JournalHubFiltersProps = {
  view: JournalHubView;
  search: string;
  filters: JournalHubFilterValues;
  activeFilterCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: <Key extends keyof JournalHubFilterValues>(
    key: Key,
    value: JournalHubFilterValues[Key],
  ) => void;
  onClearFilters: () => void;
};

export function JournalHubFilters({
  view,
  search,
  filters,
  activeFilterCount,
  onSearchChange,
  onFilterChange,
  onClearFilters,
}: JournalHubFiltersProps) {
  const { contacts, loading: contactsLoading } = useContacts({
    page_size: 100,
  });
  const { events, loading: eventsLoading } = useEvents({ page_size: 100 });
  const formatOptions = JOURNAL_FORMAT_OPTIONS.filter((option) => {
    if (view === "logs") {
      return option.family === "log";
    }

    if (view === "reflections") {
      return option.family === "reflection";
    }

    return true;
  });

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search journals</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          type="search"
          placeholder="Search journals"
          className="pl-9"
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="sm:shrink-0">
            <Filter aria-hidden="true" />
            {activeFilterCount > 0
              ? `Filters · ${activeFilterCount}`
              : "Filters"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
          <PopoverHeader>
            <PopoverTitle>Filter journals</PopoverTitle>
            <PopoverDescription>
              Narrow this view using saved Journal context.
            </PopoverDescription>
          </PopoverHeader>

          <div className="grid gap-4">
            <FilterField label="Contact">
              <select
                value={filters.contact}
                disabled={contactsLoading}
                className={selectClassName}
                onChange={(event) =>
                  onFilterChange("contact", event.target.value)
                }
              >
                <option value="">All contacts</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={String(contact.id)}>
                    {contactName(contact)}
                  </option>
                ))}
                {filters.contact &&
                  !contacts.some(
                    (contact) => String(contact.id) === filters.contact,
                  ) && (
                    <option value={filters.contact}>
                      Selected contact ({filters.contact})
                    </option>
                  )}
              </select>
            </FilterField>

            <FilterField label="Event">
              <select
                value={filters.event}
                disabled={eventsLoading}
                className={selectClassName}
                onChange={(event) =>
                  onFilterChange("event", event.target.value)
                }
              >
                <option value="">All events</option>
                {events.map((event) => (
                  <option key={event.id} value={String(event.id)}>
                    {event.title}
                  </option>
                ))}
                {filters.event &&
                  !events.some(
                    (event) => String(event.id) === filters.event,
                  ) && (
                    <option value={filters.event}>
                      Selected event ({filters.event})
                    </option>
                  )}
              </select>
            </FilterField>

            <FilterField label="Format or lens">
              <select
                value={filters.format ?? ""}
                className={selectClassName}
                onChange={(event) =>
                  onFilterChange(
                    "format",
                    event.target.value
                      ? (event.target.value as Exclude<JournalFormat, "legacy">)
                      : undefined,
                  )
                }
              >
                <option value="">All formats and lenses</option>
                <optgroup label="Logs">
                  {formatOptions
                    .filter((option) => option.family === "log")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Reflections">
                  {formatOptions
                    .filter((option) => option.family === "reflection")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              </select>
            </FilterField>

            <div className="grid gap-3 sm:grid-cols-2">
              <FilterField label="Occurred after">
                <Input
                  type="date"
                  value={filters.occurredAfter}
                  onChange={(event) =>
                    onFilterChange("occurredAfter", event.target.value)
                  }
                />
              </FilterField>
              <FilterField label="Occurred before">
                <Input
                  type="date"
                  value={filters.occurredBefore}
                  min={filters.occurredAfter || undefined}
                  onChange={(event) =>
                    onFilterChange("occurredBefore", event.target.value)
                  }
                />
              </FilterField>
            </div>

            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";
