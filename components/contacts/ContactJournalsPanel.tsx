"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpenText,
  ChartBar,
  Filter,
  NotebookTabs,
  PencilLine,
  Plus,
  Search,
} from "lucide-react";

import { contactName } from "@/components/contacts/contact-utils";
import { ContactTabHeader } from "@/components/contacts/ContactTabHeader";
import { ContactContentStack } from "@/components/contacts/surfaces/ContactContentStack";
import { ContactHelperStack } from "@/components/contacts/surfaces/ContactHelperStack";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import {
  NewJournalChooser,
  type NewJournalChooserOption,
} from "@/components/journals/chooser/NewJournalChooser";
import { JournalListRow } from "@/components/journals/hub/JournalList";
import {
  JOURNAL_FORMAT_OPTIONS,
  familyForHubView,
  formatJournalDate,
  getJournalResumeHref,
  isFormatCompatibleWithView,
  type JournalHubView,
} from "@/components/journals/hub/journalHubUtils";
import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { Button } from "@/components/ui/button";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useContactJournalSummary,
  useJournalFeed,
  useJournalFilterOptions,
} from "@/hooks/useJournal";
import { getJournalClassificationPresentation } from "@/lib/presentation/journalPresentation";
import type { Contact } from "@/types/contacts";
import type { JournalFormat, JournalListItem } from "@/types/journals";

const CONTACT_JOURNAL_PAGE_SIZE = 5;

type ContactJournalFilters = {
  event: string;
  format?: Exclude<JournalFormat, "legacy">;
  occurredAfter: string;
  occurredBefore: string;
};

const initialFilters: ContactJournalFilters = {
  event: "",
  format: undefined,
  occurredAfter: "",
  occurredBefore: "",
};

export function ContactJournalsPanel({ contact }: { contact: Contact }) {
  const displayName = contactName(contact);
  const [view, setView] = useState<JournalHubView>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ContactJournalFilters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const family = familyForHubView(view);
  const format = isFormatCompatibleWithView(filters.format, view)
    ? filters.format
    : undefined;

  const mainFeed = useJournalFeed({
    page,
    page_size: CONTACT_JOURNAL_PAGE_SIZE,
    related_contact: contact.id,
    family,
    status: view === "drafts" ? "draft" : "completed",
    format,
    search: debouncedSearch || undefined,
    event: filters.event || undefined,
    occurred_after: filters.occurredAfter || undefined,
    occurred_before: filters.occurredBefore || undefined,
    ordering: view === "drafts" ? "-updated_timestamp" : "-occurred_at",
  });
  const journalSummary = useContactJournalSummary(contact.id);
  const filterOptions = useJournalFilterOptions({
    enabled: filtersOpen,
    relatedContact: contact.id,
  });

  const completedCount = journalSummary.data?.completed_count ?? 0;
  const logCount = journalSummary.data?.log_count ?? 0;
  const reflectionCount = journalSummary.data?.reflection_count ?? 0;
  const draftCount = journalSummary.data?.draft_count ?? 0;
  const countsLoading = journalSummary.loading;
  const inventoryError = journalSummary.error;
  const lastCompleted = journalSummary.data?.latest_completed;
  const lastCompletedDate = lastCompleted
    ? (lastCompleted.occurred_at ?? lastCompleted.completed_at)
    : null;
  const activeFilterCount = [
    filters.event,
    filters.format,
    filters.occurredAfter,
    filters.occurredBefore,
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0 || Boolean(debouncedSearch);
  const totalPages = Math.max(
    1,
    Math.ceil((mainFeed.data?.count ?? 0) / CONTACT_JOURNAL_PAGE_SIZE),
  );
  const formatOptions = useMemo(
    () =>
      JOURNAL_FORMAT_OPTIONS.filter((option) => {
        if (view === "logs") return option.family === "log";
        if (view === "reflections") return option.family === "reflection";
        return true;
      }),
    [view],
  );

  function changeView(nextView: string) {
    const normalized = nextView as JournalHubView;
    setView(normalized);
    setPage(1);
    if (!isFormatCompatibleWithView(filters.format, normalized)) {
      setFilters((current) => ({ ...current, format: undefined }));
    }
  }

  function changeFilter<Key extends keyof ContactJournalFilters>(
    key: Key,
    value: ContactJournalFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setFilters(initialFilters);
    setPage(1);
  }

  function chooserHref(option: NewJournalChooserOption) {
    const context = new URLSearchParams({ contact: String(contact.id) });
    return `${option.href}?${context.toString()}`;
  }

  return (
    <div
      data-testid="contact-journals-panel"
      className="grid min-w-0 max-w-full gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:grid-rows-[minmax(0,1fr)] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,330px)]"
    >
      <ContactContentStack className="max-w-full xl:h-full">
        <ContactTabHeader
          headingId="contact-journals-heading"
          icon={NotebookTabs}
          title={`Journals with ${displayName}`}
          subtitle="Logs and reflections connected to this relationship."
          metadata={
            <JournalMetrics
              loading={countsLoading}
              completedCount={completedCount}
              draftCount={draftCount}
              lastCompletedDate={lastCompletedDate}
            />
          }
          actions={
            <NewJournalChooser
              open={chooserOpen}
              onOpenChange={setChooserOpen}
              getOptionHref={chooserHref}
              trigger={
                <Button type="button">
                  <Plus aria-hidden="true" />
                  New journal
                </Button>
              }
            />
          }
        />

        <div className="min-w-0 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-y-contain xl:pr-1">
          <ContactSectionCard className="min-w-0">
            <ContactSectionHeader
              headingId="contact-journal-entries-heading"
              icon={BookOpenText}
              title="Journal entries"
              subtitle="A private record of what you tracked and reflected on."
              action={
                <Button asChild variant="link" size="sm">
                  <Link href="/journals">View all journals</Link>
                </Button>
              }
            />

            <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">
                  Search journals with {displayName}
                </span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={search}
                  placeholder="Search journals"
                  className="pl-9"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <ContactJournalFilterPopover
                view={view}
                filters={filters}
                open={filtersOpen}
                activeFilterCount={activeFilterCount}
                formatOptions={formatOptions}
                events={filterOptions.data?.events ?? []}
                eventsLoading={filterOptions.loading}
                onOpenChange={setFiltersOpen}
                onChange={changeFilter}
                onClear={clearFilters}
              />
            </div>

            <Tabs value={view} onValueChange={changeView} className="mt-3">
              <TabsList className="max-w-full justify-start overflow-x-auto">
                <InventoryTab
                  value="all"
                  label="All"
                  count={completedCount}
                  loading={countsLoading}
                />
                <InventoryTab
                  value="logs"
                  label="Logs"
                  count={logCount}
                  loading={countsLoading}
                />
                <InventoryTab
                  value="reflections"
                  label="Reflections"
                  count={reflectionCount}
                  loading={countsLoading}
                />
                <InventoryTab
                  value="drafts"
                  label="Drafts"
                  count={draftCount}
                  loading={countsLoading}
                />
              </TabsList>
            </Tabs>

            <ContactJournalFeed
              contact={contact}
              displayName={displayName}
              view={view}
              entries={mainFeed.entries}
              loading={mainFeed.loading}
              error={mainFeed.error}
              totalCount={mainFeed.data?.count ?? 0}
              page={page}
              totalPages={totalPages}
              hasFilters={hasFilters}
              inventoryEmpty={
                !countsLoading && completedCount === 0 && draftCount === 0
              }
              onRetry={mainFeed.refetch}
              onClearFilters={clearFilters}
              onCreate={() => setChooserOpen(true)}
              onPageChange={setPage}
            />
          </ContactSectionCard>
        </div>
      </ContactContentStack>

      <ContactHelperStack
        asChild
        className="xl:h-full xl:min-h-0 xl:self-stretch xl:overflow-y-auto xl:overscroll-y-contain"
      >
        <aside aria-label="Contact Journal helpers">
          <ContinueWritingCard
            drafts={journalSummary.data?.drafts ?? []}
            totalCount={draftCount}
            loading={journalSummary.loading}
            error={journalSummary.error}
            onRetry={journalSummary.refetch}
            onViewAll={() => changeView("drafts")}
          />
          <JournalSnapshotCard
            completedCount={completedCount}
            logCount={logCount}
            reflectionCount={reflectionCount}
            lastCompletedDate={lastCompletedDate}
            loading={countsLoading}
            error={inventoryError}
            onRetry={journalSummary.refetch}
          />
        </aside>
      </ContactHelperStack>
    </div>
  );
}

function JournalMetrics({
  loading,
  completedCount,
  draftCount,
  lastCompletedDate,
}: {
  loading: boolean;
  completedCount: number;
  draftCount: number;
  lastCompletedDate: string | null;
}) {
  if (loading) {
    return <Skeleton className="h-5 w-48" />;
  }

  const metrics = [
    completedCount > 0
      ? `${completedCount} ${completedCount === 1 ? "entry" : "entries"}`
      : null,
    draftCount > 0
      ? `${draftCount} ${draftCount === 1 ? "draft" : "drafts"}`
      : null,
    lastCompletedDate
      ? `Last written · ${formatJournalDate(lastCompletedDate)}`
      : null,
  ].filter(Boolean) as string[];

  if (!metrics.length) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
      {metrics.map((metric, index) => (
        <span key={metric} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true">|</span> : null}
          {metric}
        </span>
      ))}
    </p>
  );
}

function InventoryTab({
  value,
  label,
  count,
  loading,
}: {
  value: JournalHubView;
  label: string;
  count: number;
  loading: boolean;
}) {
  return (
    <TabsTrigger value={value} className="gap-1.5">
      {label}
      <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground shadow-xs">
        {loading ? <span aria-label="Loading count">…</span> : count}
      </span>
    </TabsTrigger>
  );
}

type ContactJournalFeedProps = {
  contact: Contact;
  displayName: string;
  view: JournalHubView;
  entries: JournalListItem[];
  loading: boolean;
  error: { message: string } | null;
  totalCount: number;
  page: number;
  totalPages: number;
  hasFilters: boolean;
  inventoryEmpty: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
};

function ContactJournalFeed({
  contact,
  displayName,
  view,
  entries,
  loading,
  error,
  totalCount,
  page,
  totalPages,
  hasFilters,
  inventoryEmpty,
  onRetry,
  onClearFilters,
  onCreate,
  onPageChange,
}: ContactJournalFeedProps) {
  if (loading) {
    return <ContactJournalFeedSkeleton />;
  }

  if (error) {
    return (
      <EmptyActionBox
        className="mt-4"
        title="Unable to load these journals"
        copy={error.message}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!entries.length) {
    const title = hasFilters
      ? "No journals match these filters."
      : inventoryEmpty
        ? `No journals with ${displayName} yet`
        : view === "drafts"
          ? `No drafts with ${displayName} yet`
          : `No completed journals with ${displayName} yet`;
    const copy = hasFilters
      ? undefined
      : inventoryEmpty
        ? "Track a pattern or reflect on a moment you shared."
        : view === "drafts"
          ? "A draft appears after you add meaningful input."
          : "Try another Journal family or start a new entry.";

    return (
      <EmptyActionBox
        className="mt-4 bg-muted/15"
        title={title}
        copy={copy}
        action={
          hasFilters ? (
            <Button type="button" variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button type="button" onClick={onCreate}>
              <Plus aria-hidden="true" />
              New journal
            </Button>
          )
        }
      />
    );
  }

  return (
    <section className="mt-4" aria-label="Contact Journal results">
      <div className="overflow-hidden rounded-lg border border-border/80 bg-background divide-y divide-border/70">
        {entries.map((entry) => (
          <JournalListRow
            key={`${entry.family}-${entry.id}`}
            entry={entry}
            variant="compact"
            contactContext={{ id: contact.id, displayName }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {entries.length} of {totalCount}
        </p>
        {totalPages > 1 ? (
          <nav aria-label="Contact Journal pagination" className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="inline-flex min-h-8 items-center px-1 text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </nav>
        ) : null}
      </div>
    </section>
  );
}

function ContactJournalFeedSkeleton() {
  return (
    <div
      className="mt-4 overflow-hidden rounded-lg border border-border/80 divide-y divide-border/70"
      aria-label="Loading Contact Journals"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 p-3.5"
        >
          <Skeleton className="size-8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactJournalFilterPopover({
  view,
  filters,
  open,
  activeFilterCount,
  formatOptions,
  events,
  eventsLoading,
  onOpenChange,
  onChange,
  onClear,
}: {
  view: JournalHubView;
  filters: ContactJournalFilters;
  open: boolean;
  activeFilterCount: number;
  formatOptions: typeof JOURNAL_FORMAT_OPTIONS;
  events: Array<{ id: string | number; title: string }>;
  eventsLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: <Key extends keyof ContactJournalFilters>(
    key: Key,
    value: ContactJournalFilters[Key],
  ) => void;
  onClear: () => void;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="sm:shrink-0">
          <Filter aria-hidden="true" />
          {activeFilterCount ? `Filter · ${activeFilterCount}` : "Filter"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))]">
        <PopoverHeader>
          <PopoverTitle>Filter journals</PopoverTitle>
          <PopoverDescription>
            Narrow this relationship view using saved Journal context.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-4">
          <FilterField label="Related Event">
            <select
              value={filters.event}
              disabled={eventsLoading}
              className={selectClassName}
              onChange={(event) => onChange("event", event.target.value)}
            >
              <option value="">All related Events</option>
              {events.map((event) => (
                <option key={event.id} value={String(event.id)}>
                  {event.title}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Format or lens">
            <select
              value={filters.format ?? ""}
              className={selectClassName}
              onChange={(event) =>
                onChange(
                  "format",
                  event.target.value
                    ? (event.target.value as Exclude<JournalFormat, "legacy">)
                    : undefined,
                )
              }
            >
              <option value="">All formats and lenses</option>
              {view !== "reflections" ? (
                <optgroup label="Logs">
                  {formatOptions
                    .filter((option) => option.family === "log")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              ) : null}
              {view !== "logs" ? (
                <optgroup label="Reflections">
                  {formatOptions
                    .filter((option) => option.family === "reflection")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </optgroup>
              ) : null}
            </select>
          </FilterField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FilterField label="Occurred after">
              <Input
                type="date"
                value={filters.occurredAfter}
                onChange={(event) =>
                  onChange("occurredAfter", event.target.value)
                }
              />
            </FilterField>
            <FilterField label="Occurred before">
              <Input
                type="date"
                min={filters.occurredAfter || undefined}
                value={filters.occurredBefore}
                onChange={(event) =>
                  onChange("occurredBefore", event.target.value)
                }
              />
            </FilterField>
          </div>
          {activeFilterCount ? (
            <Button type="button" variant="ghost" onClick={onClear}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
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
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

function ContinueWritingCard({
  drafts,
  totalCount,
  loading,
  error,
  onRetry,
  onViewAll,
}: {
  drafts: JournalListItem[];
  totalCount: number;
  loading: boolean;
  error: { message: string } | null;
  onRetry: () => void;
  onViewAll: () => void;
}) {
  return (
    <ContactSectionCard density="compact">
      <ContactSectionHeader icon={PencilLine} title="Continue writing" />
      {loading ? (
        <div className="mt-3 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <div className="mt-3 rounded-md bg-muted/30 p-3 text-sm">
          <p className="text-muted-foreground">Drafts are unavailable.</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 px-0"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      ) : drafts.length ? (
        <div className="mt-3 divide-y divide-border/70">
          {drafts.map((draft) => (
            <ContactDraftPreview
              key={`${draft.family}-${draft.id}`}
              draft={draft}
            />
          ))}
          {totalCount > drafts.length ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="mt-2 px-0"
              onClick={onViewAll}
            >
              View all drafts
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          No unfinished writing for this relationship.
        </p>
      )}
    </ContactSectionCard>
  );
}

function ContactDraftPreview({ draft }: { draft: JournalListItem }) {
  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation(draft.family, draft.format);

  return (
    <article className="grid min-w-0 gap-2 py-3 first:pt-0">
      <div className="flex min-w-0 items-start gap-2.5">
        <JournalIconTile presentation={primaryPresentation} size="compact" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            <JournalSemanticChip
              presentation={familyPresentation}
              size="compact"
              showIcon={false}
            />
            {formatPresentation ? (
              <JournalSemanticChip
                presentation={formatPresentation}
                size="compact"
                showIcon={false}
              />
            ) : null}
          </div>
          <h3 className="mt-1.5 line-clamp-2 text-sm leading-5 font-semibold">
            {draft.title || `Untitled ${primaryPresentation.label}`}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">
            {formatWorkflowStep(
              draft.progress.current_step || draft.current_step,
            )}
            <span aria-hidden="true"> · </span>
            {formatRelativeJournalTime(draft.updated_timestamp)}
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="w-full">
        <Link href={getJournalResumeHref(draft)}>Continue</Link>
      </Button>
    </article>
  );
}

function JournalSnapshotCard({
  completedCount,
  logCount,
  reflectionCount,
  lastCompletedDate,
  loading,
  error,
  onRetry,
}: {
  completedCount: number;
  logCount: number;
  reflectionCount: number;
  lastCompletedDate: string | null;
  loading: boolean;
  error: { message: string } | null;
  onRetry: () => void;
}) {
  const logPercent = completedCount ? (logCount / completedCount) * 100 : 0;
  const reflectionPercent = completedCount
    ? (reflectionCount / completedCount) * 100
    : 0;

  return (
    <ContactSectionCard density="compact">
      <ContactSectionHeader icon={ChartBar} title="Journal snapshot" />
      {loading ? (
        <div className="mt-3 space-y-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <div className="mt-3 text-xs text-muted-foreground">
          <p>Snapshot unavailable.</p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 px-0"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-2xl font-semibold leading-none">
            {completedCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            completed entries
          </p>
          {completedCount > 0 ? (
            <>
              <div
                className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${logCount} Logs and ${reflectionCount} Reflections`}
              >
                <span
                  className="bg-warning"
                  style={{ width: `${logPercent}%` }}
                />
                <span
                  className="bg-primary"
                  style={{ width: `${reflectionPercent}%` }}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full bg-warning"
                    aria-hidden="true"
                  />
                  {logCount} Logs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {reflectionCount} Reflections
                </span>
              </div>
            </>
          ) : null}
          {lastCompletedDate ? (
            <p className="mt-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
              Most recent · {formatJournalDate(lastCompletedDate)}
            </p>
          ) : null}
        </div>
      )}
    </ContactSectionCard>
  );
}

function formatRelativeJournalTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Edited recently";
  const elapsedSeconds = Math.round((timestamp - Date.now()) / 1_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(elapsedSeconds) < 60)
    return formatter.format(elapsedSeconds, "second");
  const minutes = Math.round(elapsedSeconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  return formatter.format(days, "day");
}

function formatWorkflowStep(value: string) {
  const label = value.trim().replace(/[_-]+/g, " ");
  if (!label) return "In progress";
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}
