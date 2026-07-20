"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  Search,
  UserRoundPlus,
  X,
} from "lucide-react";

import {
  contactInitials,
  contactName,
} from "@/components/contacts/contact-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/useDebounce";
import { contactsApi } from "@/lib/api/contactsApi";
import { resolveMediaUrl } from "@/lib/media/resolveMediaUrl";
import type { ApiError } from "@/types/auth";
import type { ContactListItem, ContactListResponse } from "@/types/contacts";

const PAGE_SIZE = 5;

type EventParticipantSelectorProps = {
  value: string[];
  onChange: (value: string[]) => void;
  initialContacts?: ContactListItem[];
  error?: string;
};

function toContactCache(contacts: ContactListItem[]) {
  return Object.fromEntries(
    contacts.map((contact) => [String(contact.id), contact]),
  );
}

export function EventParticipantSelector({
  value,
  onChange,
  initialContacts = [],
  error,
}: EventParticipantSelectorProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 250);
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [response, setResponse] = useState<ContactListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [selectedById, setSelectedById] = useState<
    Record<string, ContactListItem>
  >(() => toContactCache(initialContacts));
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedCacheRef = useRef(selectedById);
  const unavailableIdsRef = useRef(unavailableIds);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedKey = value.join("|");
  const selectedIdsForHydration = useMemo(
    () => (selectedKey ? selectedKey.split("|") : []),
    [selectedKey],
  );

  useEffect(() => {
    selectedCacheRef.current = selectedById;
  }, [selectedById]);

  useEffect(() => {
    unavailableIdsRef.current = unavailableIds;
  }, [unavailableIds]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadPeople() {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setLoadError(null);

      try {
        const nextResponse = await contactsApi.list({
          name: debouncedSearch.trim() || undefined,
          page,
          page_size: PAGE_SIZE,
        });
        if (active) setResponse(nextResponse);
      } catch (nextError) {
        if (!active) return;
        setResponse(null);
        setLoadError(nextError as ApiError);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPeople();

    return () => {
      active = false;
    };
  }, [debouncedSearch, open, page, retryKey]);

  useEffect(() => {
    const missingIds = selectedIdsForHydration.filter(
      (id) =>
        !selectedCacheRef.current[id] && !unavailableIdsRef.current.has(id),
    );
    if (!missingIds.length) return;

    let active = true;
    void Promise.allSettled(missingIds.map((id) => contactsApi.get(id))).then(
      (results) => {
        if (!active) return;
        const loaded: ContactListItem[] = [];
        const unavailable: string[] = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            loaded.push(result.value);
          } else {
            unavailable.push(missingIds[index]);
          }
        });

        if (loaded.length) {
          setSelectedById((current) => ({
            ...current,
            ...toContactCache(loaded),
          }));
        }
        if (unavailable.length) {
          setUnavailableIds((current) => {
            const next = new Set(current);
            unavailable.forEach((id) => next.add(id));
            return next;
          });
        }
      },
    );

    return () => {
      active = false;
    };
  }, [selectedIdsForHydration]);

  function selectContact(contact: ContactListItem) {
    const id = String(contact.id);
    if (value.includes(id)) return;
    setSelectedById((current) => ({ ...current, [id]: contact }));
    onChange([...value, id]);
  }

  function removeContact(id: string) {
    onChange(value.filter((candidate) => candidate !== id));
  }

  const visibleResults = (response?.results ?? []).filter(
    (contact) => !value.includes(String(contact.id)),
  );
  const isSearching = search !== debouncedSearch;
  const isBusy = loading || isSearching;

  return (
    <div className="min-w-0 space-y-3">
      {value.length > 0 ? (
        <div className="grid min-w-0 gap-2 sm:grid-cols-2">
          {value.map((id) => {
            const contact = selectedById[id];

            if (contact) {
              return (
                <SelectedContactCard
                  key={id}
                  contact={contact}
                  onRemove={() => removeContact(id)}
                />
              );
            }

            return (
              <div
                key={id}
                className="flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-border/80 bg-background/50 px-3 py-2.5"
              >
                {unavailableIds.has(id) ? (
                  <CircleAlert
                    className="size-5 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                ) : (
                  <LoaderCircle
                    className="size-5 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {unavailableIds.has(id)
                    ? "Selected contact unavailable"
                    : "Loading selected contact…"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove unavailable contact"
                  onClick={() => removeContact(id)}
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-center">
          <UserRoundPlus
            className="mx-auto size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium">No one selected yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add any saved people who shared this moment.
          </p>
        </div>
      )}

      {error && (
        <p
          id="event-participants-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10"
            data-event-form-focus="participants"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "event-participants-error" : undefined}
          >
            <UserRoundPlus aria-hidden="true" />
            Add person
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          collisionPadding={12}
          className="max-h-[var(--radix-popover-content-available-height)] w-[min(28rem,calc(100vw-2rem))] gap-3 overflow-y-auto overscroll-contain p-3"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            window.requestAnimationFrame(() => searchInputRef.current?.focus());
          }}
        >
          <PopoverHeader>
            <PopoverTitle>Add people</PopoverTitle>
            <p className="text-xs text-muted-foreground">
              Search your saved contacts. Up to five results are shown at once.
            </p>
          </PopoverHeader>

          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={searchInputRef}
              type="search"
              value={search}
              aria-label="Search people to add"
              className="h-10 bg-card pl-9"
              placeholder="Search people"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div
            role="region"
            aria-label="People search results"
            aria-busy={isBusy}
            className="min-w-0 space-y-2"
          >
            {isBusy ? (
              <div className="flex min-h-20 items-center justify-center gap-2 rounded-lg border border-border/70 bg-muted/20 text-sm text-muted-foreground">
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {isSearching ? "Searching people…" : "Loading people…"}
              </div>
            ) : loadError ? (
              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3">
                <p className="text-sm font-medium">
                  People could not be loaded.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {loadError.message}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setRetryKey((current) => current + 1)}
                >
                  Try again
                </Button>
              </div>
            ) : visibleResults.length > 0 ? (
              visibleResults.map((contact) => (
                <ContactResultCard
                  key={contact.id}
                  contact={contact}
                  onSelect={() => selectContact(contact)}
                />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-5 text-center text-sm text-muted-foreground">
                {(response?.results.length ?? 0) > 0
                  ? "Everyone on this page is already selected."
                  : search.trim()
                    ? "No people match this search."
                    : "No saved people are available."}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {isBusy
                ? "Updating results…"
                : `${response?.count ?? 0} ${(response?.count ?? 0) === 1 ? "person" : "people"}`}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy || !response?.previous}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy || !response?.next}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SelectedContactCard({
  contact,
  onRemove,
}: {
  contact: ContactListItem;
  onRemove: () => void;
}) {
  const name = contactName(contact) || "Unnamed contact";

  return (
    <div className="flex min-h-16 min-w-0 items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5 ring-1 ring-primary/10">
      <ContactAvatar contact={contact} name={name} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold" title={name}>
          {name}
        </span>
        {contact.relation_name && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {contact.relation_name}
          </span>
        )}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}

function ContactResultCard({
  contact,
  onSelect,
}: {
  contact: ContactListItem;
  onSelect: () => void;
}) {
  const name = contactName(contact) || "Unnamed contact";

  return (
    <button
      type="button"
      className="group flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 text-left shadow-xs outline-none transition-colors hover:border-primary/30 hover:bg-muted/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={onSelect}
    >
      <ContactAvatar contact={contact} name={name} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold" title={name}>
          {name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[contact.relation_name, contact.occupation_name]
            .filter(Boolean)
            .join(" · ") || "Saved person"}
        </span>
      </span>
      <span className="shrink-0 text-xs font-medium text-primary">Add</span>
    </button>
  );
}

function ContactAvatar({
  contact,
  name,
}: {
  contact: ContactListItem;
  name: string;
}) {
  const imageUrl = resolveMediaUrl(contact.profile_picture?.url);

  if (imageUrl) {
    return (
      <span
        role="img"
        aria-label={
          contact.profile_picture?.alt_text || `${name} profile picture`
        }
        className="size-10 shrink-0 rounded-full border border-border/70 bg-muted bg-cover bg-center shadow-xs"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} initials`}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-accent text-sm font-semibold text-accent-foreground shadow-xs"
    >
      {contactInitials(contact)}
    </span>
  );
}
