"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarClock,
  ChevronRight,
  UsersRound,
} from "lucide-react";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { JournalStateIndicator } from "@/components/presentation/JournalStateIndicator";
import { Button } from "@/components/ui/button";
import {
  DashboardEmptyState,
  DashboardWidgetShell,
} from "@/components/dashboard/DashboardWidgetShell";
import {
  formatDateTime,
  pluralize,
  type WidgetStateProps,
} from "@/components/dashboard/dashboard-utils";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { getJournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import type { DashboardEvent } from "@/types/dashboard";

type DashboardEventListProps = WidgetStateProps & {
  description: string;
  events: DashboardEvent[];
  variant: "upcoming" | "recent";
};

export function DashboardEventList({
  description,
  events,
  variant,
  loading,
  error,
  onRetry,
}: DashboardEventListProps) {
  const isRecent = variant === "recent";
  const visibleEvents = isRecent ? events.slice(0, 3) : events;

  return (
    <DashboardWidgetShell
      title={isRecent ? "Recent moments" : "Coming up"}
      description={description}
      icon={
        isRecent ? (
          <CalendarClock aria-hidden="true" />
        ) : (
          <CalendarDays aria-hidden="true" />
        )
      }
      iconTone={isRecent ? "violet" : "indigo"}
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName={isRecent ? "h-96" : "h-52"}
      action={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1 text-primary"
        >
          <Link href={isRecent ? "/events" : "/events/calendar"}>
            {isRecent ? "View all" : "View calendar"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {visibleEvents.length === 0 ? (
        <DashboardEmptyState
          icon={<CalendarClock className="size-5" />}
          title={isRecent ? "No recent moments" : "No upcoming events"}
          description={
            isRecent
              ? "Past moments will appear here as you record them."
              : "Scheduled future events will appear here."
          }
        />
      ) : isRecent ? (
        <div className="space-y-1">
          {visibleEvents.map((event) => (
            <RecentMomentRow key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleEvents.map((event) => (
            <UpcomingMomentRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </DashboardWidgetShell>
  );
}

function RecentMomentRow({ event }: { event: DashboardEvent }) {
  const date = new Date(event.event_timestamp);
  const monthDay = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);
  const presentation = getEventPresentation(event);

  return (
    <div className="grid grid-cols-[3.6rem_minmax(0,1fr)] gap-3 py-3 first:pt-0 last:pb-0">
      <time
        dateTime={event.event_timestamp}
        className="pt-1 text-xs text-muted-foreground"
      >
        <span className="block font-medium text-foreground">{monthDay}</span>
        <span>{weekday}</span>
      </time>

      <div className="relative min-w-0 border-l border-border pl-5">
        <span
          aria-hidden="true"
          className="absolute -left-1.5 top-4 size-3 rounded-full border-2 border-card bg-primary/70"
        />
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 sm:grid-cols-[auto_minmax(0,1fr)_8.75rem] sm:items-start">
          <EventIconTile
            presentation={presentation.icon}
            size="standard"
            className="row-span-2"
          />

          <div className="min-w-0">
            <Link
              href={`/events/${event.id}`}
              className="block truncate rounded-sm font-medium outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            >
              {event.title}
            </Link>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {formatDateTime(event.event_timestamp)}
            </p>
            <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <span
                aria-hidden="true"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-foreground"
              >
                <UsersRound className="size-3" />
              </span>
              <span className="truncate">
                {pluralize(event.participant_count, "participant")}
              </span>
            </div>
          </div>

          <div className="col-start-2 flex min-w-0 items-start justify-between gap-2 sm:col-start-3 sm:row-span-2 sm:flex-col sm:items-end sm:justify-start sm:self-stretch">
            <EventSemanticChip presentation={presentation.semanticChip} />
            <DashboardJournalState event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingMomentRow({ event }: { event: DashboardEvent }) {
  const date = new Date(event.event_timestamp);
  const month = new Intl.DateTimeFormat(undefined, { month: "short" }).format(
    date,
  );
  const day = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(
    date,
  );
  const detail = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  const presentation = getEventPresentation(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group grid min-w-0 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border/80 bg-background p-2.5 outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <time
        dateTime={event.event_timestamp}
        className="flex min-h-12 flex-col items-center justify-center rounded-md bg-marker-violet text-marker-violet-foreground"
      >
        <span className="text-[10px] font-semibold uppercase">{month}</span>
        <span className="text-lg font-semibold leading-5">{day}</span>
      </time>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{event.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {detail}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <UsersRound className="size-3" />
          {pluralize(event.participant_count, "participant")}
        </p>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <EventSemanticChip
          presentation={presentation.semanticChip}
          size="compact"
        />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </div>
    </Link>
  );
}

function DashboardJournalState({ event }: { event: DashboardEvent }) {
  const presentation = getJournalStatePresentation(event.journaled);

  if (!event.journaled) {
    return (
      <Link
        href={`/journals/new?event=${event.id}`}
        aria-label={presentation.accessibleLabel}
        className="inline-flex max-w-full rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <JournalStateIndicator presentation={presentation} />
      </Link>
    );
  }

  return <JournalStateIndicator presentation={presentation} />;
}
