"use client";

import { useEffect, useEffectEvent, useId, useMemo, useState } from "react";
import {
  ChevronRight,
  CircleAlert,
  Loader2,
  PencilLine,
  Plus,
  Search,
  UserRoundPlus,
  UserRoundX,
  X,
} from "lucide-react";

import { idsMatch } from "@/components/contacts/contact-utils";
import { JournalContactOptionCard } from "@/components/journals/shared/JournalContactOptionCard";
import {
  JournalEventOptionCard,
  type JournalEventPreview,
} from "@/components/journals/shared/JournalEventOptionCard";
import { JournalSelectedContextSummary } from "@/components/journals/shared/JournalSelectedContextSummary";
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
import { useDebounce } from "@/hooks/useDebounce";
import { contactsApi } from "@/lib/api/contactsApi";
import { eventsApi } from "@/lib/api/eventsApi";
import { cn } from "@/lib/utils";
import type { ApiId, PaginatedResponse } from "@/types/api";
import type { ContactListItem } from "@/types/contacts";
import type { Event } from "@/types/events";

type JournalRelatedContextSelectorProps = {
  eventValue: ApiId | null;
  onEventChange: (value: ApiId | null) => void;
  contactValue: ApiId | ApiId[] | null;
  onContactChange: (value: ApiId | ApiId[] | null) => void;
  contactMultiple?: boolean;
  eventLabel?: string;
  eventDescription?: string;
  contactLabel?: string;
  contactDescription?: string;
  collapseSelected?: boolean;
  className?: string;
};

type EventPage = PaginatedResponse<JournalEventPreview>;

const PAGE_SIZE = 5;

export function JournalRelatedContextSelector({
  eventValue,
  onEventChange,
  contactValue,
  onContactChange,
  contactMultiple = false,
  eventLabel = "Related moment",
  eventDescription,
  contactLabel = "Related contact",
  contactDescription,
  collapseSelected = false,
  className,
}: JournalRelatedContextSelectorProps) {
  return (
    <div className={cn("grid min-w-0 gap-4 lg:grid-cols-2", className)}>
      <JournalRelatedEventSelector
        value={eventValue}
        onChange={onEventChange}
        label={eventLabel}
        description={eventDescription}
        collapseSelected={collapseSelected}
      />
      <JournalRelatedContactSelector
        value={contactValue}
        onChange={onContactChange}
        multiple={contactMultiple}
        label={contactLabel}
        description={contactDescription}
        collapseSelected={collapseSelected}
      />
    </div>
  );
}

function JournalRelatedEventSelector({
  value,
  onChange,
  label,
  description,
  collapseSelected,
}: {
  value: ApiId | null;
  onChange: (value: ApiId | null) => void;
  label: string;
  description?: string;
  collapseSelected: boolean;
}) {
  const inputId = useId();
  const descriptionId = useId();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [response, setResponse] = useState<EventPage | null>(null);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const [errorRequestKey, setErrorRequestKey] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] =
    useState<JournalEventPreview | null>(null);
  const [unavailableEventId, setUnavailableEventId] = useState<string | null>(
    null,
  );
  const [changingSelection, setChangingSelection] = useState(false);
  const requestKey = JSON.stringify([debouncedSearch, page, retryKey]);
  const readCurrentValue = useEffectEvent(() => value);
  const loading = loadedRequestKey !== requestKey;
  const status = loading
    ? "loading"
    : errorRequestKey === requestKey
      ? "error"
      : "ready";

  const selectedForValue =
    value != null && selectedEvent && idsMatch(selectedEvent.id, value)
      ? selectedEvent
      : null;

  useEffect(() => {
    let active = true;

    void eventsApi
      .list({
        search: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
        ordering: "-event_timestamp",
      })
      .then((nextResponse) => {
        if (!active) return;
        const nextPage: EventPage = {
          ...nextResponse,
          results: nextResponse.results.map((event) => ({
            ...event,
            contextSummaryAvailable: true,
          })),
        };
        setResponse(nextPage);
        setErrorRequestKey(null);

        const selectedId = readCurrentValue();
        const match = nextPage.results.find((event) =>
          idsMatch(event.id, selectedId),
        );
        if (match) {
          setSelectedEvent(match);
          setUnavailableEventId(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setErrorRequestKey(requestKey);
      })
      .finally(() => {
        if (active) setLoadedRequestKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, page, requestKey]);

  useEffect(() => {
    if (value == null) return;
    if (selectedForValue) return;

    let active = true;

    void eventsApi
      .get(value)
      .then(async (event) => {
        try {
          const matchingPage = await eventsApi.list({
            title: event.title,
            page_size: 10,
            ordering: "-event_timestamp",
          });
          const matchingSummary = matchingPage.results.find((candidate) =>
            idsMatch(candidate.id, value),
          );
          return matchingSummary
            ? { ...matchingSummary, contextSummaryAvailable: true }
            : eventDetailToPreview(event);
        } catch {
          return eventDetailToPreview(event);
        }
      })
      .then((event) => {
        if (!active) return;
        setSelectedEvent(event);
        setUnavailableEventId(null);
      })
      .catch(() => {
        if (!active) return;
        setSelectedEvent(null);
        setUnavailableEventId(String(value));
      });

    return () => {
      active = false;
    };
  }, [selectedForValue, value]);

  const isSearching = search !== debouncedSearch;
  const currentResponse = status === "ready" && !isSearching ? response : null;
  const visibleResults = currentResponse?.results ?? [];
  const selectedInResults = visibleResults.some((event) =>
    idsMatch(event.id, value),
  );
  const showSelectedSummary =
    collapseSelected && value != null && !changingSelection;

  return (
    <div className="min-w-0 space-y-2">
      <div className="space-y-1">
        <Label htmlFor={showSelectedSummary ? undefined : inputId}>
          {label}
        </Label>
        {description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {showSelectedSummary ? (
        <JournalSelectedContextSummary
          ariaLabel={`Selected ${label.toLowerCase()}`}
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangingSelection(true)}
              >
                <PencilLine aria-hidden="true" />
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
              >
                <X aria-hidden="true" />
                Remove
              </Button>
            </>
          }
        >
          {selectedForValue ? (
            <JournalEventOptionCard
              event={selectedForValue}
              selected
              onToggle={() => onChange(null)}
            />
          ) : unavailableEventId === String(value) ? (
            <UnavailableContextCard
              kind="moment"
              onClear={() => onChange(null)}
            />
          ) : (
            <SelectedPreviewLoading label="Loading selected moment…" />
          )}
        </JournalSelectedContextSummary>
      ) : (
        <>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={inputId}
              value={search}
              aria-describedby={description ? descriptionId : undefined}
              className="h-10 bg-card pl-9"
              placeholder="Search moments"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div
            role="region"
            aria-label={`${label} results`}
            aria-busy={status === "loading" || isSearching}
            className="space-y-1.5"
          >
            {selectedForValue && !selectedInResults ? (
              <JournalEventOptionCard
                event={selectedForValue}
                selected
                onToggle={() => onChange(null)}
              />
            ) : value != null &&
              !selectedInResults &&
              unavailableEventId === String(value) ? (
              <UnavailableContextCard
                kind="moment"
                onClear={() => onChange(null)}
              />
            ) : value != null && !selectedInResults ? (
              <SelectedPreviewLoading label="Loading selected moment…" />
            ) : null}

            {status === "loading" || isSearching ? (
              <SearchLoadingState
                label={isSearching ? "Searching moments…" : "Loading moments…"}
              />
            ) : status === "error" ? (
              <SearchErrorState
                label="Moments could not be loaded."
                onRetry={() => setRetryKey((current) => current + 1)}
              />
            ) : visibleResults.length ? (
              <div role="list" className="space-y-1.5">
                {visibleResults.map((event) => (
                  <div role="listitem" key={event.id}>
                    <JournalEventOptionCard
                      event={event}
                      selected={idsMatch(event.id, value)}
                      onToggle={() => {
                        if (idsMatch(event.id, value)) {
                          onChange(null);
                          return;
                        }
                        setSelectedEvent(event);
                        setUnavailableEventId(null);
                        onChange(event.id);
                        if (collapseSelected) setChangingSelection(false);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <SearchEmptyState
                label={
                  value != null
                    ? "No other moments match this search."
                    : "No moments match this search."
                }
              />
            )}
          </div>

          <SearchFooter
            count={currentResponse?.count ?? 0}
            page={page}
            hasPrevious={Boolean(currentResponse?.previous)}
            hasNext={Boolean(currentResponse?.next)}
            loading={status === "loading" || isSearching}
            noun="moment"
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => current + 1)}
          />
          {collapseSelected && value != null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setChangingSelection(false)}
            >
              Keep selected moment
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

export type JournalRelatedContactSelectorProps = {
  value: ApiId | ApiId[] | null;
  onChange: (value: ApiId | ApiId[] | null) => void;
  multiple?: boolean;
  label?: string;
  description?: string;
  collapseSelected?: boolean;
  presentation?: "inline" | "popover";
  error?: string;
  disabled?: boolean;
};

export function JournalRelatedContactSelector({
  value,
  onChange,
  multiple = false,
  label = "Related contact",
  description,
  collapseSelected = false,
  presentation = "inline",
  error,
  disabled = false,
}: JournalRelatedContactSelectorProps) {
  const inputId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const ids = useMemo(
    () => (Array.isArray(value) ? value : value == null ? [] : [value]),
    [value],
  );
  const idsKey = ids.map(String).join("|");
  const readCurrentIds = useEffectEvent(() => ids);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [response, setResponse] =
    useState<PaginatedResponse<ContactListItem> | null>(null);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
  const [errorRequestKey, setErrorRequestKey] = useState<string | null>(null);
  const [selectedById, setSelectedById] = useState<
    Record<string, ContactListItem>
  >({});
  const [unavailableById, setUnavailableById] = useState<
    Record<string, boolean>
  >({});
  const [addingSelection, setAddingSelection] = useState(false);
  const [expandedSelection, setExpandedSelection] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const requestKey = JSON.stringify([debouncedSearch, page, retryKey]);
  const loading = loadedRequestKey !== requestKey;
  const status = loading
    ? "loading"
    : errorRequestKey === requestKey
      ? "error"
      : "ready";

  useEffect(() => {
    let active = true;

    void contactsApi
      .list({
        name: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      })
      .then((nextResponse) => {
        if (!active) return;
        setResponse(nextResponse);
        setErrorRequestKey(null);

        const selectedIds = readCurrentIds();
        const matches = nextResponse.results.filter((contact) =>
          selectedIds.some((id) => idsMatch(id, contact.id)),
        );
        if (matches.length) {
          cacheContacts(matches, setSelectedById);
          setUnavailableById((current) => {
            const next = { ...current };
            matches.forEach((contact) => delete next[String(contact.id)]);
            return next;
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setErrorRequestKey(requestKey);
      })
      .finally(() => {
        if (active) setLoadedRequestKey(requestKey);
      });

    return () => {
      active = false;
    };
  }, [debouncedSearch, page, requestKey]);

  useEffect(() => {
    const requestedIds = readCurrentIds();
    if (!requestedIds.length) return;

    let active = true;

    void Promise.allSettled(requestedIds.map((id) => contactsApi.get(id))).then(
      (results) => {
        if (!active) return;
        const loaded: ContactListItem[] = [];
        const unavailable: string[] = [];
        results.forEach((result, index) => {
          const requestedId = requestedIds[index];
          if (result.status === "fulfilled") {
            loaded.push(result.value);
          } else if (requestedId != null) {
            unavailable.push(String(requestedId));
          }
        });
        if (loaded.length) cacheContacts(loaded, setSelectedById);
        setUnavailableById((current) => {
          const next = { ...current };
          loaded.forEach((contact) => delete next[String(contact.id)]);
          unavailable.forEach((id) => {
            next[id] = true;
          });
          return next;
        });
      },
    );

    return () => {
      active = false;
    };
  }, [idsKey]);

  function toggle(contact: ContactListItem) {
    const hasContact = ids.some((id) => idsMatch(id, contact.id));
    if (!hasContact) {
      cacheContacts([contact], setSelectedById);
      setUnavailableById((current) => {
        const next = { ...current };
        delete next[String(contact.id)];
        return next;
      });
    }

    if (!multiple) {
      onChange(hasContact ? null : contact.id);
      if (!hasContact && collapseSelected) setAddingSelection(false);
      if (!hasContact && presentation === "popover") setPickerOpen(false);
      return;
    }

    const next = hasContact
      ? ids.filter((id) => !idsMatch(id, contact.id))
      : [...ids, contact.id];
    onChange(next.length ? next : null);
    if (!hasContact && collapseSelected && ids.length === 0) {
      setAddingSelection(false);
    }
  }

  function clearUnavailable(id: ApiId) {
    if (!multiple) {
      onChange(null);
      return;
    }
    const next = ids.filter((item) => !idsMatch(item, id));
    onChange(next.length ? next : null);
  }

  const isSearching = search !== debouncedSearch;
  const currentResponse = status === "ready" && !isSearching ? response : null;
  const visibleResults = currentResponse?.results ?? [];
  const selectedIdsInResults = new Set(
    visibleResults
      .filter((contact) => ids.some((id) => idsMatch(id, contact.id)))
      .map((contact) => String(contact.id)),
  );
  const showSelectedSummary =
    collapseSelected && ids.length > 0 && !addingSelection;
  const visibleSelectedIds = expandedSelection ? ids : ids.slice(0, 3);
  const hiddenSelectedCount = Math.max(0, ids.length - 3);
  const describedBy =
    [description ? descriptionId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const discovery = (
    <div className="min-w-0 space-y-2">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={inputId}
          value={search}
          aria-label={`Search ${label.toLowerCase()}`}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="h-10 bg-card pl-9"
          placeholder="Search contacts"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <div
        role="region"
        aria-label={`${label} results`}
        aria-busy={status === "loading" || isSearching}
        className="space-y-1.5"
      >
        {ids.map((id) => {
          if (selectedIdsInResults.has(String(id))) return null;
          const selected = selectedById[String(id)];
          if (selected) {
            return (
              <JournalContactOptionCard
                key={`selected-${id}`}
                contact={selected}
                selected
                onToggle={() => toggle(selected)}
              />
            );
          }
          if (unavailableById[String(id)]) {
            return (
              <UnavailableContextCard
                key={`unavailable-${id}`}
                kind="contact"
                onClear={() => clearUnavailable(id)}
              />
            );
          }
          return (
            <SelectedPreviewLoading
              key={`loading-${id}`}
              label="Loading selected contact…"
            />
          );
        })}

        {status === "loading" || isSearching ? (
          <SearchLoadingState
            label={isSearching ? "Searching contacts…" : "Loading contacts…"}
          />
        ) : status === "error" ? (
          <SearchErrorState
            label="Contacts could not be loaded."
            onRetry={() => setRetryKey((current) => current + 1)}
          />
        ) : visibleResults.length ? (
          <div role="list" className="space-y-1.5">
            {visibleResults.map((contact) => (
              <div role="listitem" key={contact.id}>
                <JournalContactOptionCard
                  contact={contact}
                  selected={ids.some((id) => idsMatch(id, contact.id))}
                  onToggle={() => toggle(contact)}
                />
              </div>
            ))}
          </div>
        ) : (
          <SearchEmptyState
            label={
              ids.length
                ? "No other contacts match this search."
                : "No contacts match this search."
            }
          />
        )}
      </div>

      <SearchFooter
        count={currentResponse?.count ?? 0}
        page={page}
        hasPrevious={Boolean(currentResponse?.previous)}
        hasNext={Boolean(currentResponse?.next)}
        loading={status === "loading" || isSearching}
        noun="contact"
        onPrevious={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => current + 1)}
      />
    </div>
  );

  if (presentation === "popover") {
    const selectedId = ids[0];
    const selectedContact =
      selectedId == null ? null : (selectedById[String(selectedId)] ?? null);
    const selectedUnavailable =
      selectedId != null && unavailableById[String(selectedId)];

    return (
      <div className="min-w-0 space-y-1.5">
        <div className="space-y-1">
          <Label>{label}</Label>
          {description ? (
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <Popover
          open={disabled ? false : pickerOpen}
          onOpenChange={(nextOpen) => {
            if (!disabled) setPickerOpen(nextOpen);
          }}
        >
          <PopoverTrigger asChild>
            {selectedContact ? (
              <JournalContactOptionCard
                contact={selectedContact}
                selected
                selectedAction={disabled ? "none" : "change"}
                disabled={disabled}
                onToggle={() => undefined}
              />
            ) : selectedUnavailable ? (
              <button
                type="button"
                disabled={disabled}
                aria-label={`${label}: Contact unavailable${error ? `. Error: ${error}` : ""}`}
                aria-describedby={describedBy}
                className={cn(
                  "flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg border border-primary/35 bg-primary/5 px-3 py-2.5 text-left shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  error && "border-destructive/55 bg-destructive/5",
                )}
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <UserRoundX className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    Contact unavailable
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Choose another saved contact.
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
              </button>
            ) : selectedId != null ? (
              <button
                type="button"
                disabled={disabled}
                aria-label={`${label}: Loading selected contact`}
                aria-describedby={describedBy}
                className="flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-left shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Loader2
                  className="size-5 shrink-0 animate-spin text-primary"
                  aria-hidden="true"
                />
                <span className="text-sm text-muted-foreground">
                  Loading selected contact…
                </span>
              </button>
            ) : (
              <button
                type="button"
                disabled={disabled}
                aria-label={`${label}: Choose a contact${error ? `. Error: ${error}` : ""}`}
                aria-describedby={describedBy}
                className={cn(
                  "group flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg border border-dashed border-border bg-card px-3 py-2.5 text-left shadow-xs outline-none transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  error &&
                    "border-destructive/55 bg-destructive/5 hover:border-destructive/70 hover:bg-destructive/5",
                )}
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-accent text-primary">
                  <UserRoundPlus className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">
                    Choose a contact
                  </span>
                  <span className="block text-xs leading-4 text-muted-foreground">
                    A saved contact is required to publish this item.
                  </span>
                </span>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
              </button>
            )}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            aria-label="Choose a contact"
            className="max-h-[min(34rem,var(--radix-popover-content-available-height))] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto p-3"
          >
            <PopoverHeader>
              <PopoverTitle>Choose a contact</PopoverTitle>
              <PopoverDescription>
                Search saved contacts. Five results are shown at a time.
              </PopoverDescription>
            </PopoverHeader>
            {discovery}
          </PopoverContent>
        </Popover>
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="space-y-1">
        <Label htmlFor={showSelectedSummary ? undefined : inputId}>
          {label}
        </Label>
        {description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {showSelectedSummary ? (
        <JournalSelectedContextSummary
          ariaLabel={`Selected ${label.toLowerCase()}`}
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddingSelection(true)}
              >
                {multiple ? (
                  <Plus aria-hidden="true" />
                ) : (
                  <PencilLine aria-hidden="true" />
                )}
                {multiple ? "Add person" : "Change"}
              </Button>
              {hiddenSelectedCount > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-expanded={expandedSelection}
                  onClick={() => setExpandedSelection((current) => !current)}
                >
                  {expandedSelection
                    ? "Show fewer"
                    : `+${hiddenSelectedCount} more`}
                </Button>
              ) : null}
            </>
          }
        >
          {visibleSelectedIds.map((id) => {
            const selected = selectedById[String(id)];
            if (selected) {
              return (
                <JournalContactOptionCard
                  key={`summary-${id}`}
                  contact={selected}
                  selected
                  onToggle={() => toggle(selected)}
                />
              );
            }
            if (unavailableById[String(id)]) {
              return (
                <UnavailableContextCard
                  key={`summary-unavailable-${id}`}
                  kind="contact"
                  onClear={() => clearUnavailable(id)}
                />
              );
            }
            return (
              <SelectedPreviewLoading
                key={`summary-loading-${id}`}
                label="Loading selected contact…"
              />
            );
          })}
        </JournalSelectedContextSummary>
      ) : (
        <>
          {discovery}
          {collapseSelected && ids.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddingSelection(false)}
            >
              Done adding people
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

function SearchFooter({
  count,
  page,
  hasPrevious,
  hasNext,
  loading,
  noun,
  onPrevious,
  onNext,
}: {
  count: number;
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  loading: boolean;
  noun: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex min-h-8 min-w-0 flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2 text-xs text-muted-foreground">
      <span className="min-w-0" aria-live="polite">
        {loading
          ? "Updating results…"
          : `${count} ${count === 1 ? noun : `${noun}s`}`}
      </span>
      <span className="flex min-w-0 flex-wrap items-center justify-end gap-1">
        {hasPrevious ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={loading}
            aria-label={`View previous ${noun} results`}
            onClick={onPrevious}
          >
            Previous
          </Button>
        ) : null}
        {page > 1 ? <span aria-hidden="true">Page {page}</span> : null}
        {hasNext ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-primary"
            disabled={loading}
            aria-label={`View more ${noun} results`}
            onClick={onNext}
          >
            View more
          </Button>
        ) : null}
      </span>
    </div>
  );
}

function SearchLoadingState({ label }: { label: string }) {
  return (
    <p
      role="status"
      className="flex min-h-16 items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </p>
  );
}

function SelectedPreviewLoading({ label }: { label: string }) {
  return (
    <p
      role="status"
      className="flex min-h-16 items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 text-sm text-muted-foreground"
    >
      <Loader2
        className="size-4 animate-spin text-primary"
        aria-hidden="true"
      />
      {label}
    </p>
  );
}

function SearchErrorState({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-16 items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">{label}</span>
      <Button type="button" variant="ghost" size="xs" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function SearchEmptyState({ label }: { label: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
      {label}
    </p>
  );
}

function UnavailableContextCard({
  kind,
  onClear,
}: {
  kind: "moment" | "contact";
  onClear: () => void;
}) {
  const label = kind === "moment" ? "Related moment" : "Related contact";
  return (
    <button
      type="button"
      aria-pressed="true"
      aria-label={`Clear unavailable ${kind}`}
      className="flex min-h-16 w-full items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5 text-left shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={onClear}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <UserRoundX className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label} unavailable</span>
        <span className="block text-xs text-muted-foreground">
          Clear this reference or choose another.
        </span>
      </span>
      <X className="size-4 shrink-0 text-primary" aria-hidden="true" />
    </button>
  );
}

function eventDetailToPreview(event: Event): JournalEventPreview {
  const participants = Array.isArray(event.participants)
    ? event.participants
    : [];
  return {
    ...event,
    context_category: null,
    participants,
    participant_count: participants.length,
    contextSummaryAvailable: event.context_category == null,
  };
}

function cacheContacts(
  contacts: ContactListItem[],
  setSelectedById: React.Dispatch<
    React.SetStateAction<Record<string, ContactListItem>>
  >,
) {
  setSelectedById((current) => {
    const next = { ...current };
    contacts.forEach((contact) => {
      next[String(contact.id)] = contact;
    });
    return next;
  });
}
