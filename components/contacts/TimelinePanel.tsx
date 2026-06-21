"use client";

import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  Filter,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Phone,
  Search,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { eventsApi, type EventListParams } from "@/lib/api/eventsApi";
import { cn } from "@/lib/utils";
import { useContactEvents } from "@/hooks/useContactEvents";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  EventImpact,
  EventListItem,
  EventTier,
  EventTimelineSummary,
} from "@/types/events";

const pageSize = 5;

type DateRangeFilter = "all" | "upcoming" | "past" | "this_month";
type HasMoodFilter = "any" | "yes" | "no";
type TierFilter = "all" | EventTier;

type TimelineRow = {
  key: string;
  label: string;
  showLabel: boolean;
  event: EventListItem;
};

type TimelineStat = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  className: string;
};

export function TimelinePanel() {
  const params = useParams<{ id: string }>();
  const contactId = params.id;
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [hasMood, setHasMood] = useState<HasMoodFilter>("any");
  const [contextCategory, setContextCategory] = useState("all");
  const [extraEvents, setExtraEvents] = useState<EventListItem[]>([]);
  const [loadedPage, setLoadedPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [summary, setSummary] = useState<EventTimelineSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(Boolean(contactId));
  const [summaryError, setSummaryError] = useState<ApiError | null>(null);
  const [nowMs] = useState(() => new Date().getTime());
  const debouncedSearch = useDebounce(search, 300);
  const { contextCategories, isLoading: lookupsLoading } = useLookups();

  const dateParams = useMemo(
    () => buildDateRangeParams(dateRange),
    [dateRange],
  );

  const baseQueryParams = useMemo<ContactEventQueryParams>(
    () => ({
      search: debouncedSearch || undefined,
      event_after: dateParams.event_after,
      event_before: dateParams.event_before,
      tier: tier === "all" ? undefined : tier,
      context_category:
        contextCategory === "all" ? undefined : contextCategory,
      has_mood:
        hasMood === "any" ? undefined : hasMood === "yes",
    }),
    [
      contextCategory,
      dateParams.event_after,
      dateParams.event_before,
      debouncedSearch,
      hasMood,
      tier,
    ],
  );

  const activeFilterCount = [
    dateRange !== "all",
    tier !== "all",
    hasMood !== "any",
    contextCategory !== "all",
  ].filter(Boolean).length;

  const {
    data,
    events,
    loading,
    error,
    refetch,
  } = useContactEvents(contactId, {
    ...baseQueryParams,
    page: 1,
    page_size: pageSize,
  });

  useEffect(() => {
    let isActive = true;

    async function loadSummary() {
      if (!contactId) {
        setSummary(null);
        setSummaryLoading(false);
        return;
      }

      setSummaryLoading(true);
      setSummaryError(null);

      try {
        const response = await eventsApi.timelineSummary({
          ...baseQueryParams,
          participants: String(contactId),
        });
        if (isActive) {
          setSummary(response);
        }
      } catch (err) {
        if (isActive) {
          setSummaryError(err as ApiError);
        }
      } finally {
        if (isActive) {
          setSummaryLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      isActive = false;
    };
  }, [baseQueryParams, contactId]);

  const timelineEvents = useMemo(
    () => mergeEvents(events, extraEvents),
    [events, extraEvents],
  );
  const timelineRows = useMemo(
    () => buildTimelineRows(timelineEvents),
    [timelineEvents],
  );
  const resultCount = data?.count ?? summary?.total_moments ?? 0;
  const hasResults = timelineEvents.length > 0;
  const canLoadMore =
    Boolean(data?.next) && !loading && !loadingMore && !reachedEnd;
  const isInitialLoading = loading && !hasResults;

  function resetLocalPagination() {
    setExtraEvents([]);
    setLoadedPage(1);
    setReachedEnd(false);
  }

  function handleClearFilters() {
    setSearch("");
    setDateRange("all");
    setTier("all");
    setHasMood("any");
    setContextCategory("all");
    resetLocalPagination();
  }

  async function handleLoadMore() {
    if (!contactId || loadingMore || reachedEnd) {
      return;
    }

    const nextPage = loadedPage + 1;
    setLoadingMore(true);

    try {
      const response = await eventsApi.list({
        ...baseQueryParams,
        page: nextPage,
        page_size: pageSize,
        participants: String(contactId),
      });
      setExtraEvents((currentEvents) =>
        mergeEvents(currentEvents, response.results),
      );
      setLoadedPage(nextPage);
      setReachedEnd(!response.next);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(280px,330px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(310px,360px)]">
      <section className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-7">
              Relationship Timeline
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Shared moments recorded through events.
            </p>
          </div>

          <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(220px,1fr)_auto] lg:w-[460px]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                placeholder="Search timeline"
                className="h-9 pl-9"
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetLocalPagination();
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-9 bg-background"
              onClick={handleClearFilters}
              disabled={
                !search &&
                activeFilterCount === 0 &&
                !loading &&
                !summaryLoading
              }
            >
              <Filter className="size-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-4">
          {error && (
            <TimelineState
              icon={CalendarClock}
              title="Unable to load timeline"
              message={error.message}
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void refetch()}
                >
                  Try again
                </Button>
              }
            />
          )}

          {!error && isInitialLoading && <TimelineSkeleton />}

          {!error && !isInitialLoading && !hasResults && (
            <TimelineState
              icon={CalendarDays}
              title={
                activeFilterCount > 0 || search
                  ? "No matching moments"
                  : "No shared moments yet"
              }
              message={
                activeFilterCount > 0 || search
                  ? "Clear the current filters to return to the full timeline."
                  : "Log a moment to start building this story."
              }
              action={
                activeFilterCount > 0 || search ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}

          {!error && hasResults && (
            <div className="relative">
              <div className="absolute bottom-6 left-[5.375rem] top-6 hidden w-px bg-border sm:block" />
              <div className="space-y-3">
                {timelineRows.map((row) => (
                  <div
                    key={row.key}
                    className="grid gap-2 sm:grid-cols-[4.75rem_1.25rem_minmax(0,1fr)] sm:gap-0"
                  >
                    <div className="hidden pr-2 pt-4 text-right sm:block">
                      {row.showLabel && (
                        <p className="whitespace-pre-line text-xs font-medium uppercase leading-4 text-muted-foreground">
                          {row.label}
                        </p>
                      )}
                    </div>
                    <div className="relative hidden min-h-[5.5rem] justify-center sm:flex">
                      <span className="z-10 mt-5 size-2.5 rounded-full bg-primary-strong ring-4 ring-card" />
                    </div>
                    <div className="min-w-0 sm:pl-3">
                      {row.showLabel && (
                        <p className="mb-2 whitespace-pre-line text-xs font-medium uppercase leading-4 text-muted-foreground sm:hidden">
                          {row.label}
                        </p>
                      )}
                      <TimelineItem event={row.event} nowMs={nowMs} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!error && hasResults && (
          <div className="mt-3">
            {canLoadMore ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full bg-background"
                onClick={() => void handleLoadMore()}
              >
                {loadingMore ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Load more
              </Button>
            ) : (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-center text-sm text-muted-foreground">
                Showing {timelineEvents.length} of {resultCount} moments
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="grid gap-3 xl:self-start">
        <TimelineGlance
          loading={summaryLoading}
          error={summaryError}
          summary={summary}
        />

        <TimelineFilters
          activeFilterCount={activeFilterCount}
          contextCategory={contextCategory}
          contextCategories={contextCategories}
          dateRange={dateRange}
          hasMood={hasMood}
          loading={loading || lookupsLoading}
          resultCount={resultCount}
          tier={tier}
          onClear={handleClearFilters}
          onContextCategoryChange={(value) => {
            setContextCategory(value);
            resetLocalPagination();
          }}
          onDateRangeChange={(value) => {
            setDateRange(value);
            resetLocalPagination();
          }}
          onHasMoodChange={(value) => {
            setHasMood(value);
            resetLocalPagination();
          }}
          onTierChange={(value) => {
            setTier(value);
            resetLocalPagination();
          }}
        />
      </aside>
    </div>
  );
}

type ContactEventQueryParams = Omit<
  EventListParams,
  "page" | "page_size" | "participants"
>;

function TimelineItem({
  event,
  nowMs,
}: {
  event: EventListItem;
  nowMs: number;
}) {
  const isUpcoming = new Date(event.event_timestamp).getTime() > nowMs;
  const participantsText = participantSummary(event);
  const iconWellClassName = interactionModeWellClass(
    event.interaction_mode?.name,
  );
  const contextText =
    event.location_label ||
    event.interaction_mode?.name ||
    event.context_category?.name ||
    "";
  const contextIcon = event.location_label
    ? <MapPin className="size-3.5" />
    : event.interaction_mode
      ? interactionModeIcon(event.interaction_mode.name, "size-3.5")
      : <CalendarDays className="size-3.5" />;
  const hasSignals = Boolean(event.mood) || Boolean(event.impact);
  const hasRightMeta = isUpcoming || hasSignals;

  return (
    <article className="rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-primary/30 sm:p-4">
      <div className="grid gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-md",
            iconWellClassName,
          )}
        >
          {interactionModeIcon(event.interaction_mode?.name, "size-5")}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-sm font-semibold leading-5 sm:text-base">
              {event.title || "Untitled event"}
            </h3>
            <TierBadge tier={event.tier} />
          </div>

          <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
            {contextText && (
              <span className="inline-flex items-center gap-1">
                {contextIcon}
                {contextText}
              </span>
            )}
            {participantsText && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {participantsText}
              </span>
            )}
          </div>

          {event.description && (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex items-start justify-end gap-2">
          {hasRightMeta && (
            <div className="grid min-w-[7rem] gap-2 md:justify-items-start">
              {isUpcoming && (
                <div className="grid gap-1">
                  <StatusBadge label="Upcoming" />
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(event.event_timestamp)}
                  </span>
                </div>
              )}
              {hasSignals && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {event.mood && (
                    <TimelineSignal
                      label="Mood"
                      value={`${event.mood.emoji_icon} ${event.mood.name}`}
                      className="text-foreground"
                      indicatorClassName={moodDotClass(
                        event.mood.name,
                        event.mood.polarity,
                      )}
                    />
                  )}
                  {event.impact && (
                    <TimelineSignal
                      label="Impact"
                      value={impactLabel(event.impact)}
                      className={impactTextClass(event.impact)}
                      icon={impactIcon(event.impact)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Open actions for ${event.title || "event"}`}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`}>View event</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

function TimelineSignal({
  className,
  icon: Icon,
  indicatorClassName,
  label,
  value,
}: {
  className: string;
  icon?: ComponentType<{ className?: string }>;
  indicatorClassName?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 inline-flex items-center gap-1 text-sm", className)}>
        {Icon ? (
          <Icon className="size-4" />
        ) : (
          <span
            className={cn(
              "size-2 rounded-full",
              indicatorClassName ?? "bg-muted-foreground",
            )}
          />
        )}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function TimelineGlance({
  error,
  loading,
  summary,
}: {
  error: ApiError | null;
  loading: boolean;
  summary: EventTimelineSummary | null;
}) {
  const stats = buildStats(summary);

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Timeline at a Glance</h2>
        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="min-h-[4.25rem] rounded-md border border-border bg-background p-2.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md",
                    stat.className,
                  )}
                >
                  <stat.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-semibold leading-none text-foreground">
                    {loading && !summary ? "-" : stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineFilters({
  activeFilterCount,
  contextCategory,
  contextCategories,
  dateRange,
  hasMood,
  loading,
  resultCount,
  tier,
  onClear,
  onContextCategoryChange,
  onDateRangeChange,
  onHasMoodChange,
  onTierChange,
}: {
  activeFilterCount: number;
  contextCategory: string;
  contextCategories: { id: ApiId; name: string }[];
  dateRange: DateRangeFilter;
  hasMood: HasMoodFilter;
  loading: boolean;
  resultCount: number;
  tier: TierFilter;
  onClear: () => void;
  onContextCategoryChange: (value: string) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
  onHasMoodChange: (value: HasMoodFilter) => void;
  onTierChange: (value: TierFilter) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-primary-strong"
          disabled={activeFilterCount === 0 && !loading}
          onClick={onClear}
        >
          Clear all
        </Button>
      </div>

      <div className="mt-3 grid gap-3">
        <FilterField label="Date range">
          <select
            aria-label="Date range"
            value={dateRange}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onDateRangeChange(event.target.value as DateRangeFilter)
            }
          >
            <option value="all">All time</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="this_month">This month</option>
          </select>
        </FilterField>

        <FilterField label="Event tier">
          <div className="grid gap-2">
            <FilterCheckButton
              checked={tier === "all" || tier === "routine"}
              label="Routine"
              onClick={() => onTierChange(tier === "routine" ? "all" : "routine")}
            />
            <FilterCheckButton
              checked={tier === "all" || tier === "milestone"}
              label="Milestone"
              onClick={() =>
                onTierChange(tier === "milestone" ? "all" : "milestone")
              }
            />
            <FilterCheckButton
              checked={dateRange !== "past"}
              label="Upcoming"
              tone="success"
              onClick={() =>
                onDateRangeChange(dateRange === "past" ? "all" : "past")
              }
            />
          </div>
        </FilterField>

        <FilterField label="Has mood">
          <select
            aria-label="Has mood"
            value={hasMood}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) =>
              onHasMoodChange(event.target.value as HasMoodFilter)
            }
          >
            <option value="any">Any</option>
            <option value="yes">With mood</option>
            <option value="no">No mood</option>
          </select>
        </FilterField>

        <FilterField label="Context category">
          <select
            aria-label="Context category"
            value={contextCategory}
            disabled={loading}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            onChange={(event) => onContextCategoryChange(event.target.value)}
          >
            <option value="all">All categories</option>
            {contextCategories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </FilterField>

        <Button type="button" variant="outline" className="h-9 bg-background">
          <Filter className="size-4" />
          Show {resultCount} results
        </Button>
      </div>
    </section>
  );
}

function FilterField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {children}
    </div>
  );
}

function FilterCheckButton({
  checked,
  label,
  onClick,
  tone = "primary",
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
  tone?: "primary" | "success";
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        !checked && "text-muted-foreground hover:text-foreground",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-sm border",
          checked && tone === "success"
            ? "border-success-muted bg-success-muted text-success"
            : checked
              ? "border-primary bg-accent text-primary-strong"
              : "border-border bg-background text-transparent",
        )}
      >
        <Check className="size-3.5" />
      </span>
      {label}
    </button>
  );
}

function TimelineState({
  action,
  icon: Icon,
  message,
  title,
}: {
  action?: ReactNode;
  icon: ComponentType<{ className?: string }>;
  message: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-background p-4"
        >
          <div className="flex gap-3">
            <div className="size-11 animate-pulse rounded-md bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TierBadge({ tier }: { tier: EventTier }) {
  const isMilestone = tier === "milestone";

  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase leading-4",
        isMilestone
          ? "border-marker-violet bg-marker-violet text-marker-violet-foreground"
          : "border-marker-indigo bg-marker-indigo text-marker-indigo-foreground",
      )}
    >
      {isMilestone ? "Milestone" : "Routine"}
    </span>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-info-muted bg-info-muted px-2 py-0.5 text-[11px] font-medium leading-4 text-info">
      {label}
    </span>
  );
}

function buildStats(summary: EventTimelineSummary | null): TimelineStat[] {
  return [
    {
      label: "Total moments",
      value: summary?.total_moments ?? 0,
      icon: CalendarDays,
      className: "bg-marker-violet text-marker-violet-foreground",
    },
    {
      label: "Upcoming",
      value: summary?.upcoming ?? 0,
      icon: CalendarCheck2,
      className: "bg-success-muted text-success",
    },
    {
      label: "Routine",
      value: summary?.routine ?? 0,
      icon: CalendarCheck2,
      className: "bg-marker-fuchsia text-marker-fuchsia-foreground",
    },
    {
      label: "Milestone",
      value: summary?.milestone ?? 0,
      icon: CalendarClock,
      className: "bg-marker-violet text-marker-violet-foreground",
    },
    {
      label: "This month",
      value: summary?.this_month ?? 0,
      icon: CalendarDays,
      className: "bg-info-muted text-info",
    },
    {
      label: "With mood",
      value: summary?.with_mood ?? 0,
      icon: Heart,
      className: "bg-marker-rose text-marker-rose-foreground",
    },
  ];
}

function buildDateRangeParams(dateRange: DateRangeFilter) {
  if (dateRange === "upcoming") {
    return { event_after: "now" };
  }

  if (dateRange === "past") {
    return { event_before: "now" };
  }

  if (dateRange === "this_month") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      event_after: start.toISOString(),
      event_before: end.toISOString(),
    };
  }

  return {};
}

function buildTimelineRows(events: EventListItem[]): TimelineRow[] {
  let previousDateKey = "";

  return events.map((event) => {
    const date = new Date(event.event_timestamp);
    const dateKey = date.toISOString().slice(0, 10);
    const showLabel = dateKey !== previousDateKey;
    previousDateKey = dateKey;

    return {
      key: String(event.id),
      label: formatRailDate(date),
      showLabel,
      event,
    };
  });
}

function formatRailDate(value: Date) {
  const monthDay = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(value);
  const year = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
  }).format(value);

  return `${monthDay}\n${year}`;
}

function mergeEvents(
  currentEvents: EventListItem[],
  nextEvents: EventListItem[],
) {
  const seenIds = new Set(currentEvents.map((event) => String(event.id)));
  const uniqueNextEvents = nextEvents.filter(
    (event) => !seenIds.has(String(event.id)),
  );
  return [...currentEvents, ...uniqueNextEvents];
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function participantSummary(event: EventListItem) {
  if (event.participants.length === 0) {
    return event.participant_count > 0
      ? `${event.participant_count} participants`
      : "";
  }

  const names = event.participants
    .map((participant) =>
      [participant.contact.first_name, participant.contact.last_name]
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean);

  if (names.length === 0) {
    return `${event.participant_count} participants`;
  }

  if (names.length <= 2) {
    return `With ${names.join(", ")}`;
  }

  return `With ${names.slice(0, 2).join(", ")} +${names.length - 2}`;
}

function interactionModeIcon(modeName: string | undefined, className: string) {
  const normalized = modeName?.toLowerCase() ?? "";

  if (normalized.includes("video")) {
    return <Video className={className} />;
  }

  if (normalized.includes("phone") || normalized.includes("call")) {
    return <Phone className={className} />;
  }

  if (normalized.includes("email")) {
    return <Mail className={className} />;
  }

  if (normalized.includes("text") || normalized.includes("message")) {
    return <MessageSquare className={className} />;
  }

  if (
    normalized.includes("in person") ||
    normalized.includes("meet") ||
    normalized.includes("plan")
  ) {
    return <CalendarDays className={className} />;
  }

  return <Users className={className} />;
}

function interactionModeWellClass(modeName: string | undefined) {
  const normalized = modeName?.toLowerCase() ?? "";

  if (normalized.includes("video")) {
    return "bg-marker-indigo text-marker-indigo-foreground";
  }

  if (normalized.includes("phone") || normalized.includes("call")) {
    return "bg-marker-teal text-marker-teal-foreground";
  }

  if (normalized.includes("email")) {
    return "bg-marker-fuchsia text-marker-fuchsia-foreground";
  }

  if (normalized.includes("text") || normalized.includes("message")) {
    return "bg-marker-rose text-marker-rose-foreground";
  }

  if (
    normalized.includes("in person") ||
    normalized.includes("meet") ||
    normalized.includes("plan")
  ) {
    return "bg-marker-violet text-marker-violet-foreground";
  }

  if (normalized.includes("social")) {
    return "bg-marker-fuchsia text-marker-fuchsia-foreground";
  }

  return "bg-muted text-muted-foreground";
}

function impactLabel(impact: EventImpact) {
  if (impact === "positive") {
    return "Positive";
  }

  if (impact === "negative") {
    return "Negative";
  }

  if (impact === "neutral") {
    return "Neutral";
  }

  return "";
}

function impactTextClass(impact: EventImpact) {
  if (impact === "positive") {
    return "text-success";
  }

  if (impact === "negative") {
    return "text-destructive";
  }

  return "text-muted-foreground";
}

function impactIcon(impact: EventImpact) {
  if (impact === "positive") {
    return TrendingUp;
  }

  if (impact === "negative") {
    return TrendingUp;
  }

  return Minus;
}

type MoodDotClass =
  | "bg-mood-happy"
  | "bg-mood-content"
  | "bg-mood-neutral"
  | "bg-mood-anxious"
  | "bg-mood-sad"
  | "bg-mood-angry";

function moodDotClass(name: string, polarity: string): MoodDotClass {
  const normalizedName = name.trim().toLowerCase();

  if (normalizedName.includes("happy")) {
    return "bg-mood-happy";
  }

  if (normalizedName.includes("content")) {
    return "bg-mood-content";
  }

  if (normalizedName.includes("anxious")) {
    return "bg-mood-anxious";
  }

  if (normalizedName.includes("sad")) {
    return "bg-mood-sad";
  }

  if (normalizedName.includes("angry")) {
    return "bg-mood-angry";
  }

  if (polarity === "positive") {
    return "bg-mood-content";
  }

  if (polarity === "negative") {
    return "bg-mood-sad";
  }

  return "bg-mood-neutral";
}
