import Link from "next/link";
import { ChevronRight, Link2 } from "lucide-react";

import { RelatedMomentSignal } from "@/components/events/RelatedMomentSignal";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { Button } from "@/components/ui/button";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import type { ApiError } from "@/types/auth";
import type { EventRelatedItem } from "@/types/events";

type EventRelatedMomentsProps = {
  events: EventRelatedItem[];
  loading: boolean;
  error: ApiError | null;
  canExpand: boolean;
  onViewAll: () => void;
};

export function EventRelatedMoments({
  events,
  loading,
  error,
  canExpand,
  onViewAll,
}: EventRelatedMomentsProps) {
  return (
    <section
      aria-labelledby="related-moments-heading"
      className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4"
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <Link2 className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="related-moments-heading"
              className="text-base font-semibold"
            >
              Related moments
            </h2>
            <p className="text-xs text-muted-foreground">
              Based on recorded people and context.
            </p>
          </div>
        </div>
        {canExpand && (
          <Button type="button" size="sm" variant="ghost" onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>

      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {loading && (
          <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Loading related moments…
          </p>
        )}
        {!loading && error && (
          <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Related moments are unavailable.
          </p>
        )}
        {!loading && !error && events.length === 0 && (
          <p className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            No related moments yet.
          </p>
        )}
        {!loading &&
          !error &&
          events.map((event) => (
            <RelatedMomentCard key={event.id} event={event} />
          ))}
      </div>
    </section>
  );
}

function RelatedMomentCard({ event }: { event: EventRelatedItem }) {
  const presentation = getEventPresentation(event);
  return (
    <Link
      href={`/events/${event.id}`}
      className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-card p-3 outline-none transition-colors hover:border-primary/30 hover:bg-muted/25 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <EventIconTile presentation={presentation.icon} size="compact" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold group-hover:text-primary">
          {event.title.trim() || "Untitled event"}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {formatDate(event.event_timestamp)}
        </span>
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <RelatedMomentSignal event={event} />
        <ChevronRight
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
