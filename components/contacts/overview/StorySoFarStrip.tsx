import type { KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Coffee,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { formatDate } from "@/components/contacts/contact-utils";
import type { ContactOverviewModel } from "./contact-overview-utils";

type StorySoFarStripProps = {
  model: ContactOverviewModel;
  loading?: boolean;
  onViewTimeline: () => void;
};

export function StorySoFarStrip({
  model,
  loading = false,
  onViewTimeline,
}: StorySoFarStripProps) {
  const eventCount = model.storySoFarEvents.length;

  return (
    <SurfaceCard asChild className="p-4">
      <section>
        {loading ? (
          <div className="grid gap-2.5 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : eventCount === 1 ? (
          <LatestSharedMoment
            event={model.storySoFarEvents[0]}
            onViewTimeline={onViewTimeline}
          />
        ) : eventCount === 2 ? (
          <TwoMomentStrip events={model.storySoFarEvents} />
        ) : eventCount > 2 ? (
          <FullStoryStrip model={model} onViewTimeline={onViewTimeline} />
        ) : (
          <>
            <h2 className="text-lg font-semibold">Our Story So Far</h2>
            <div className="mt-4">
              <ContactOverviewEmptyState
                icon={<CalendarClock className="size-4" />}
                title={model.storySoFarEmptyState ?? "No shared moments yet"}
                copy="Add events to build this story."
              />
            </div>
          </>
        )}
      </section>
    </SurfaceCard>
  );
}

function LatestSharedMoment({
  event,
  onViewTimeline,
}: {
  event: ContactOverviewModel["storySoFarEvents"][number] | undefined;
  onViewTimeline: () => void;
}) {
  if (!event) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewTimeline();
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Latest shared moment</h2>
      <section
        role="button"
        tabIndex={0}
        className="group mt-4 flex w-full flex-col gap-3 rounded-lg border border-transparent p-2 text-left outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-muted/20 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 motion-reduce:hover:translate-y-0 sm:flex-row sm:items-center"
        onClick={onViewTimeline}
        onKeyDown={handleKeyDown}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <MapPin className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            {formatDate(event.eventTimestamp)}
            {event.locationLabel && (
              <>
                <span className="mx-2">·</span>
                {event.locationLabel}
              </>
            )}
          </p>
          <p className="mt-1 line-clamp-2 text-base font-semibold">
            {event.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {event.journaled
              ? "Journaled moment"
              : "A recorded moment together."}
          </p>
        </div>
        <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-primary-strong transition-colors group-hover:bg-muted/20">
          View Timeline
          <ArrowRight className="size-4" />
        </span>
      </section>
    </div>
  );
}

function TwoMomentStrip({
  events,
}: {
  events: ContactOverviewModel["storySoFarEvents"];
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Our Story So Far</h2>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group flex items-start gap-3 rounded-lg border border-border/80 bg-background/70 p-3 transition-colors hover:bg-muted/20"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              {event.tier === "milestone" ? (
                <Star className="size-5 text-primary-strong" />
              ) : (
                <MapPin className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {formatDate(event.eventTimestamp)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold group-hover:text-primary-strong">
                {event.title}
              </p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {event.locationLabel ||
                  (event.journaled ? "Journaled" : "Not journaled")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FullStoryStrip({
  model,
  onViewTimeline,
}: {
  model: ContactOverviewModel;
  onViewTimeline: () => void;
}) {
  const visibleEvents = model.storySoFarEvents.slice(0, 4);

  return (
    <div>
      <SectionHeader
        title="Our Story So Far"
        description={`Shared moments recorded with ${model.displayName}.`}
        action={
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-primary-strong outline-none transition-colors hover:bg-muted/20 focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={onViewTimeline}
          >
            View Timeline
            <ArrowRight className="size-4" />
          </button>
        }
      />

      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="pointer-events-none absolute left-8 right-8 top-5 hidden border-t border-dashed border-border md:block" />
        {visibleEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group relative rounded-lg border border-transparent bg-transparent p-1.5 text-center transition-colors hover:bg-muted/20"
          >
            <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground ring-5 ring-background">
              {event.tier === "milestone" ? (
                <Star className="size-4 text-primary-strong" />
              ) : event.locationLabel ? (
                <MapPin className="size-4" />
              ) : event.journaled ? (
                <MessageCircle className="size-4" />
              ) : (
                <Coffee className="size-4" />
              )}
            </div>
            <p className="mt-2 text-xs font-medium leading-4 text-muted-foreground">
              {event.dateLabel}
            </p>
            <p className="mx-auto mt-0.5 line-clamp-2 max-w-28 text-sm font-semibold leading-5 group-hover:text-primary">
              {event.title}
            </p>
            <div className="mt-0.5 flex min-h-4 justify-center gap-1.5 text-xs text-muted-foreground">
              {event.locationLabel ? (
                <span className="truncate">{event.locationLabel}</span>
              ) : (
                <span>{event.journaled ? "Journaled" : "Not journaled"}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
