"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  SearchX,
} from "lucide-react";

import { EventCard } from "@/components/events/EventCard";
import { inclusiveTimestampBefore } from "@/components/events/event-utils";
import { EventGrid, EventPagination } from "@/components/events/EventGrid";
import type { EventBrowserDisplay } from "@/components/events/EventBrowserToolbar";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvent";
import { isDrfInvalidPageError } from "@/lib/api/errorGuards";
import type { EventListParams } from "@/lib/api/eventsApi";
import type { ApiError } from "@/types/auth";
import type { EventListItem } from "@/types/events";

const PAST_PAGE_SIZE = 6;
const BROWSE_PAGE_SIZE = 12;

type SharedBrowserProps = {
  params: EventListParams;
  page: number;
  hasActiveCriteria: boolean;
  onPageChange: (page: number) => void;
  onClearCriteria: () => void;
};

type MomentsBrowserProps = SharedBrowserProps & {
  display: EventBrowserDisplay;
  totalAccessible: number | null;
  summaryLoading: boolean;
  onOpenCalendar: () => void;
};

export function MomentsBrowser({
  params,
  page,
  display,
  totalAccessible,
  summaryLoading,
  hasActiveCriteria,
  onPageChange,
  onClearCriteria,
  onOpenCalendar,
}: MomentsBrowserProps) {
  const [timeBoundary] = useState(() => new Date().toISOString());
  const upcomingAfter = laterBoundary(
    params.event_after,
    exclusiveLowerBoundary(timeBoundary),
  );
  const upcomingBefore = params.event_before;
  const pastAfter = params.event_after;
  const pastBefore = earlierBoundary(params.event_before, timeBoundary);
  const upcoming = useEvents({
    ...params,
    page: 1,
    page_size: 2,
    event_after: upcomingAfter,
    event_before: upcomingBefore,
    ordering: "event_timestamp",
  });
  const past = useEvents({
    ...params,
    page,
    page_size: PAST_PAGE_SIZE,
    event_after: pastAfter,
    event_before: pastBefore,
    ordering: params.ordering || "-event_timestamp",
  });
  const allLoaded = !upcoming.loading && !past.loading && !summaryLoading;
  const noResults = upcoming.events.length === 0 && past.events.length === 0;
  const noErrors = !upcoming.error && !past.error;
  const listQueriesProveEmptyAccount =
    !hasActiveCriteria &&
    upcoming.data != null &&
    past.data != null &&
    upcoming.data.count === 0 &&
    past.data.count === 0;

  if (
    allLoaded &&
    noResults &&
    noErrors &&
    !hasActiveCriteria &&
    (totalAccessible === 0 || listQueriesProveEmptyAccount)
  ) {
    return (
      <BrowserEmptyState
        icon={CalendarDays}
        title="No moments yet"
        description="Create an event to begin remembering the moments that matter."
        action={
          <Button asChild>
            <Link href="/events/new">
              <Plus aria-hidden="true" />
              Create event
            </Link>
          </Button>
        }
      />
    );
  }

  if (allLoaded && noResults && noErrors && hasActiveCriteria) {
    return (
      <BrowserEmptyState
        icon={SearchX}
        title="No events match these filters"
        description="Try a broader search or clear the current filters."
        action={
          <Button type="button" variant="outline" onClick={onClearCriteria}>
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <ComingUpSection
        events={upcoming.events}
        loading={upcoming.loading}
        error={upcoming.error?.message ?? null}
        onRetry={upcoming.refetch}
        onOpenCalendar={onOpenCalendar}
      />

      <section aria-labelledby="past-moments-heading" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="past-moments-heading"
              className="text-lg font-semibold text-foreground"
            >
              Past moments
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              The moments you have already shared.
            </p>
          </div>
          {!past.loading && !past.error && (
            <span className="text-sm tabular-nums text-muted-foreground">
              {past.data?.count ?? 0} total
            </span>
          )}
        </div>

        <EventGrid
          events={past.events}
          loading={past.loading}
          error={past.error}
          page={page}
          pageSize={PAST_PAGE_SIZE}
          totalCount={past.data?.count ?? 0}
          display={display}
          onPageChange={onPageChange}
          onRetry={past.refetch}
          emptyState={
            <BrowserEmptyState
              compact
              icon={Clock3}
              title="No past moments in this view"
              description={
                hasActiveCriteria
                  ? "Adjust the filters to include more of your history."
                  : "Upcoming events will move here after they happen."
              }
            />
          }
        />
      </section>
    </div>
  );
}

type CalendarBrowserProps = SharedBrowserProps & {
  month: string;
  onMonthChange: (month: string) => void;
};

export function CalendarBrowser({
  params,
  page,
  month,
  hasActiveCriteria,
  onPageChange,
  onMonthChange,
  onClearCriteria,
}: CalendarBrowserProps) {
  const range = calendarMonthRange(month);
  const query = useEvents({
    ...params,
    page,
    page_size: BROWSE_PAGE_SIZE,
    event_after: laterBoundary(params.event_after, range.start),
    event_before: earlierBoundary(params.event_before, range.end),
    ordering: params.ordering || "event_timestamp",
  });
  useCorrectedPage(
    page,
    BROWSE_PAGE_SIZE,
    query.data?.count ?? 0,
    query.loading,
    query.error,
    onPageChange,
  );
  const recoveringInvalidPage =
    page > 1 && isDrfInvalidPageError(query.error) && !query.loading;
  const groups = groupEventsByDay(query.events);

  return (
    <section aria-labelledby="calendar-view-heading" className="min-w-0">
      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Calendar
          </p>
          <h2
            id="calendar-view-heading"
            className="mt-0.5 text-lg font-semibold"
          >
            {range.label}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMonthChange(currentMonthKey())}
          >
            This month
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      {query.loading || recoveringInvalidPage ? (
        <BrowserSkeleton rows={6} />
      ) : query.error ? (
        <BrowserError message={query.error.message} onRetry={query.refetch} />
      ) : query.events.length === 0 ? (
        <BrowserEmptyState
          icon={CalendarDays}
          title={`No events in ${range.label}`}
          description={
            hasActiveCriteria
              ? "No events in this month match the current filters."
              : "Choose another month or create a new event."
          }
          action={
            hasActiveCriteria ? (
              <Button type="button" variant="outline" onClick={onClearCriteria}>
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/events/new">Create event</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-5">
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            {groups.map((group) => (
              <section
                key={group.key}
                className="min-w-0 rounded-lg border border-border bg-card shadow-xs"
              >
                <div className="flex items-baseline justify-between gap-3 border-b border-border/70 px-4 py-3">
                  <h3 className="font-semibold text-foreground">
                    {group.label}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {group.events.length}{" "}
                    {group.events.length === 1 ? "event" : "events"}
                  </span>
                </div>
                <div className="grid gap-2 p-2">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} variant="list" />
                  ))}
                </div>
              </section>
            ))}
          </div>
          <EventPagination
            page={page}
            pageSize={BROWSE_PAGE_SIZE}
            totalCount={query.data?.count ?? 0}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

export function TimelineBrowser({
  params,
  page,
  hasActiveCriteria,
  onPageChange,
  onClearCriteria,
}: SharedBrowserProps) {
  const query = useEvents({
    ...params,
    page,
    page_size: BROWSE_PAGE_SIZE,
    ordering: params.ordering || "-event_timestamp",
  });
  useCorrectedPage(
    page,
    BROWSE_PAGE_SIZE,
    query.data?.count ?? 0,
    query.loading,
    query.error,
    onPageChange,
  );
  const recoveringInvalidPage =
    page > 1 && isDrfInvalidPageError(query.error) && !query.loading;

  return (
    <section aria-labelledby="timeline-view-heading" className="min-w-0">
      <div className="mb-4">
        <h2 id="timeline-view-heading" className="text-lg font-semibold">
          Event timeline
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          A chronological view of what happened and what is ahead.
        </p>
      </div>

      {query.loading || recoveringInvalidPage ? (
        <BrowserSkeleton rows={6} />
      ) : query.error ? (
        <BrowserError message={query.error.message} onRetry={query.refetch} />
      ) : query.events.length === 0 ? (
        <BrowserEmptyState
          icon={Clock3}
          title="No events on this timeline"
          description={
            hasActiveCriteria
              ? "No events match the current timeline filters."
              : "Create an event to start your timeline."
          }
          action={
            hasActiveCriteria ? (
              <Button type="button" variant="outline" onClick={onClearCriteria}>
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href="/events/new">Create event</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-5">
          <ol className="relative grid min-w-0 gap-3 before:absolute before:top-4 before:bottom-4 before:left-[4.4rem] before:w-px before:bg-border sm:before:left-[7.4rem]">
            {query.events.map((event) => (
              <TimelineEvent key={event.id} event={event} />
            ))}
          </ol>
          <EventPagination
            page={page}
            pageSize={BROWSE_PAGE_SIZE}
            totalCount={query.data?.count ?? 0}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

function ComingUpSection({
  events,
  loading,
  error,
  onRetry,
  onOpenCalendar,
}: {
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenCalendar: () => void;
}) {
  if (!loading && !error && events.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="coming-up-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="coming-up-heading" className="text-lg font-semibold">
            Coming up
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            The next moments on your horizon.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenCalendar}
        >
          View calendar
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="h-28 animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none" />
          <div className="h-28 animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none" />
        </div>
      ) : error ? (
        <BrowserError compact message={error} onRetry={onRetry} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {events.slice(0, 2).map((event) => (
            <EventCard key={event.id} event={event} variant="upcoming" />
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineEvent({ event }: { event: EventListItem }) {
  const date = new Date(event.event_timestamp);
  const valid = !Number.isNaN(date.getTime());

  return (
    <li className="relative grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-4 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <time
        dateTime={event.event_timestamp}
        className="pt-4 text-right text-xs leading-5 text-muted-foreground sm:text-sm"
      >
        {valid ? (
          <>
            <span className="block font-medium text-foreground">
              {new Intl.DateTimeFormat(undefined, {
                month: "short",
                day: "numeric",
              }).format(date)}
            </span>
            <span>
              {new Intl.DateTimeFormat(undefined, {
                hour: "numeric",
                minute: "2-digit",
              }).format(date)}
            </span>
          </>
        ) : (
          "Date unavailable"
        )}
      </time>
      <span
        aria-hidden="true"
        className="absolute top-5 left-[4.1rem] size-2.5 rounded-full border-2 border-card bg-primary sm:left-[7.1rem]"
      />
      <EventCard event={event} variant="list" />
    </li>
  );
}

function BrowserEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-border bg-card text-center ${compact ? "p-6" : "p-8 sm:p-10"}`}
    >
      <span className="mx-auto flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-base font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function BrowserError({
  message,
  onRetry,
  compact = false,
}: {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-destructive/25 bg-destructive/5 ${compact ? "p-4" : "p-6"}`}
    >
      <p className="font-medium text-foreground">Unable to load events</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button
        className="mt-3"
        type="button"
        variant="outline"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  );
}

function BrowserSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function groupEventsByDay(events: EventListItem[]) {
  const groups = new Map<string, EventListItem[]>();

  for (const event of events) {
    const date = new Date(event.event_timestamp);
    const key = Number.isNaN(date.getTime())
      ? "unavailable"
      : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    groups.set(key, [...(groups.get(key) ?? []), event]);
  }

  return [...groups.entries()].map(([key, groupedEvents]) => ({
    key,
    events: groupedEvents,
    label:
      key === "unavailable"
        ? "Date unavailable"
        : new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(new Date(groupedEvents[0].event_timestamp)),
  }));
}

function laterBoundary(left: string | undefined, right: string) {
  if (!left) return right;
  const leftTime = timestampMicroseconds(left);
  const rightTime = timestampMicroseconds(right);
  if (leftTime == null) return right;
  if (rightTime == null) return left;
  return leftTime >= rightTime ? left : right;
}

function earlierBoundary(left: string | undefined, right: string) {
  if (!left) return right;
  const leftTime = timestampMicroseconds(left);
  const rightTime = timestampMicroseconds(right);
  if (leftTime == null) return right;
  if (rightTime == null) return left;
  return leftTime <= rightTime ? left : right;
}

function timestampMicroseconds(value: string) {
  const milliseconds = Date.parse(value);
  if (Number.isNaN(milliseconds)) return null;

  const fractionalDigits =
    /\.(\d+)(?:Z|[+-]\d{2}:\d{2})$/.exec(value)?.[1] ?? "";
  const subMillisecondDigits = fractionalDigits.padEnd(6, "0").slice(3, 6);
  return milliseconds * 1_000 + Number(subMillisecondDigits || 0);
}

function useCorrectedPage(
  page: number,
  pageSize: number,
  totalCount: number,
  loading: boolean,
  error: ApiError | null,
  onPageChange: (page: number) => void,
) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const recoveringInvalidPage =
    page > 1 && isDrfInvalidPageError(error) && !loading;

  useEffect(() => {
    if (recoveringInvalidPage) {
      onPageChange(1);
      return;
    }

    if (!loading && !error && totalCount > 0 && page > totalPages) {
      onPageChange(totalPages);
    }
  }, [
    error,
    loading,
    onPageChange,
    page,
    recoveringInvalidPage,
    totalCount,
    totalPages,
  ]);
}

function exclusiveLowerBoundary(value: string) {
  if (Number.isNaN(Date.parse(value))) {
    return value;
  }

  // The captured boundary has millisecond precision, while Django/Postgres
  // timestamps retain six fractional digits. Appending 001 advances it by the
  // smallest representable interval without leaving a gap between sections.
  const millisecondBoundary = /^(.*\.\d{3})Z$/.exec(value);
  return millisecondBoundary ? `${millisecondBoundary[1]}001Z` : value;
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function calendarMonthRange(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth();
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 1);

  return {
    start: startDate.toISOString(),
    end: inclusiveTimestampBefore(endDate),
    label: new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(startDate),
  };
}

function shiftMonth(month: string, offset: number) {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth();
  const shifted = new Date(year, monthIndex + offset, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}
