"use client";

import Link from "next/link";
import { CalendarClock, NotebookPen, Star, Users } from "lucide-react";
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
import type { DashboardEvent } from "@/types/dashboard";

type DashboardEventListProps = WidgetStateProps & {
  title: string;
  description: string;
  events: DashboardEvent[];
  variant: "upcoming" | "recent";
};

export function DashboardEventList({
  title,
  description,
  events,
  variant,
  loading,
  error,
  onRetry,
}: DashboardEventListProps) {
  return (
    <DashboardWidgetShell
      title={title}
      description={description}
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-56"
      className="lg:col-span-6"
    >
      {events.length === 0 ? (
        <DashboardEmptyState
          icon={<CalendarClock className="size-5" />}
          title={
            variant === "upcoming"
              ? "No upcoming events"
              : "No recent events"
          }
          description={
            variant === "upcoming"
              ? "Scheduled future events will appear here."
              : "Past events from the last 30 days will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} variant={variant} />
          ))}
        </div>
      )}
    </DashboardWidgetShell>
  );
}

function EventRow({
  event,
  variant,
}: {
  event: DashboardEvent;
  variant: "upcoming" | "recent";
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/events/${event.id}`} className="min-w-0 flex-1">
          <p className="truncate font-medium transition group-hover:text-primary">
            {event.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(event.event_timestamp)}
          </p>
        </Link>
        {event.tier === "milestone" && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            <Star className="size-3" />
            Milestone
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {event.context_category && (
          <span className="rounded-md bg-muted px-2 py-1">
            {event.context_category.name}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
          <Users className="size-3" />
          {pluralize(event.participant_count, "participant")}
        </span>
        {variant === "recent" && (
          <span className="rounded-md bg-muted px-2 py-1">
            {event.journaled ? "Journaled" : "Unjournaled"}
          </span>
        )}
      </div>

      {variant === "recent" && !event.journaled && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
          <p className="text-sm text-muted-foreground">
            Capture the entry while the context is fresh.
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0 gap-2">
            <Link href={`/journals/new?event=${event.id}`}>
              <NotebookPen className="size-4" />
              Add entry
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
