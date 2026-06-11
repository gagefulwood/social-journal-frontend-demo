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
    <section className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-md bg-muted"
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
        <FullStoryStrip model={model} />
      ) : (
        <>
          <h2 className="text-lg font-semibold">Our Story So Far</h2>
          <div className="mt-5">
            <ContactOverviewEmptyState
              icon={<CalendarClock className="size-4" />}
              title={model.storySoFarEmptyState ?? "No shared moments yet"}
              copy="Add events to build this story."
            />
          </div>
        </>
      )}
    </section>
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
        className="group mt-5 flex w-full flex-col gap-4 rounded-lg border border-transparent p-2 text-left outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 motion-reduce:hover:translate-y-0 sm:flex-row sm:items-center"
        onClick={onViewTimeline}
        onKeyDown={handleKeyDown}
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <MapPin className="size-6" />
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
        <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium text-violet-700 transition-colors group-hover:bg-violet-50">
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
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group flex items-start gap-3 rounded-lg border border-border/80 bg-background/70 p-4 transition-colors hover:bg-violet-50/50"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
              {event.tier === "milestone" ? (
                <Star className="size-5 text-amber-700" />
              ) : (
                <MapPin className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {formatDate(event.eventTimestamp)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold group-hover:text-violet-700">
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

function FullStoryStrip({ model }: { model: ContactOverviewModel }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Our Story So Far</h2>
          <p className="text-sm text-muted-foreground">
            Shared moments recorded with {model.displayName}.
          </p>
        </div>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-5">
        <div className="pointer-events-none absolute left-10 right-10 top-7 hidden border-t border-dashed border-violet-200 md:block" />
        {model.storySoFarEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group relative rounded-lg border border-transparent bg-transparent p-2 text-center transition-colors hover:bg-muted/40"
          >
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-8 ring-background">
              {event.tier === "milestone" ? (
                <Star className="size-6 text-amber-700" />
              ) : event.locationLabel ? (
                <MapPin className="size-6" />
              ) : event.journaled ? (
                <MessageCircle className="size-6" />
              ) : (
                <Coffee className="size-6" />
              )}
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {event.dateLabel}
            </p>
            <p className="mx-auto mt-1 line-clamp-2 max-w-28 text-sm font-semibold group-hover:text-primary">
              {event.title}
            </p>
            <div className="mt-1 flex min-h-5 justify-center gap-1.5 text-xs text-muted-foreground">
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
