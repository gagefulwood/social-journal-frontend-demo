import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, MapPinned, Plus } from "lucide-react";
import { formatDate } from "@/components/contacts/contact-utils";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { Button } from "@/components/ui/button";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import type { ApiError } from "@/types/auth";
import type {
  ContactOverviewModel,
  StorySoFarEvent,
} from "./contact-overview-utils";

type StorySoFarStripProps = {
  model: ContactOverviewModel;
  loading?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  onViewTimeline: () => void;
};

export function StorySoFarStrip({
  model,
  loading = false,
  error = null,
  onRetry,
  onViewTimeline,
}: StorySoFarStripProps) {
  const events = model.storySoFarEvents;

  return (
    <ContactSectionCard asChild density="featured" className="xl:shrink-0">
      <section aria-labelledby="overview-story-title">
        <StorySectionHeader
          onViewTimeline={events.length > 0 ? onViewTimeline : undefined}
        />

        {loading ? (
          <StoryTimelineSkeleton />
        ) : error ? (
          <StoryTimelineError message={error.message} onRetry={onRetry} />
        ) : events.length > 0 ? (
          <StoryMiniTimeline events={events} />
        ) : (
          <EmptyStoryTimeline contactId={model.contactId} />
        )}
      </section>
    </ContactSectionCard>
  );
}

function StoryMiniTimeline({
  events,
}: {
  events: ContactOverviewModel["storySoFarEvents"];
}) {
  // The count is data-driven so the connector ends at the actual first and last markers.
  const timelineStyle = {
    "--story-connector-inset": `${50 / events.length}%`,
  } as CSSProperties;
  const timelineGridStyle = {
    gridTemplateColumns: `repeat(${events.length}, minmax(9rem, 1fr))`,
  } as CSSProperties;

  return (
    <div
      aria-label="Recent shared moments timeline"
      className="mt-4 overflow-x-auto overscroll-x-contain pb-2 outline-none focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50"
      tabIndex={0}
    >
      <div className="relative min-w-max sm:min-w-full" style={timelineStyle}>
        {events.length > 1 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-5 right-[var(--story-connector-inset)] left-[var(--story-connector-inset)] h-px bg-border"
          />
        )}
        <ol className="relative grid list-none p-0" style={timelineGridStyle}>
          {events.map((event) => (
            <li key={event.id} className="min-w-0 px-2">
              <StoryMomentNode event={event} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function StoryMomentNode({ event }: { event: StorySoFarEvent }) {
  const presentation = getEventPresentation({
    context_category: event.contextCategoryName
      ? { name: event.contextCategoryName }
      : null,
    interaction_mode: event.interactionModeName
      ? { name: event.interactionModeName }
      : null,
    tier: event.tier,
    title: event.title,
  });
  const detail = [event.locationLabel, event.contextCategoryName]
    .filter(Boolean)
    .join(" · ");
  const accessibleDetail = detail ? `, ${detail}` : "";

  return (
    <Link
      href={`/events/${event.id}`}
      aria-label={`View ${presentation.icon.label}: ${event.title}, ${formatDate(event.eventTimestamp)}${accessibleDetail}`}
      className="group relative z-10 flex min-w-0 flex-col items-center text-center outline-none focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <EventIconTile
        presentation={presentation.icon}
        size="standard"
        className="rounded-full ring-4 ring-card transition-opacity group-hover:opacity-80"
      />
      <time
        dateTime={event.eventTimestamp}
        className="mt-2 text-xs font-medium leading-4 text-muted-foreground"
      >
        {formatDate(event.eventTimestamp)}
      </time>
      <span className="mt-0.5 line-clamp-2 max-w-full text-sm font-semibold leading-5 group-hover:text-primary">
        {event.title}
      </span>
      {detail && (
        <span className="mt-0.5 line-clamp-1 max-w-full text-xs leading-4 text-muted-foreground">
          {detail}
        </span>
      )}
    </Link>
  );
}

function StoryTimelineSkeleton() {
  return (
    <div className="relative mt-4 grid grid-cols-3">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-5 right-[16.6667%] left-[16.6667%] h-px bg-border"
      />
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="relative z-10 px-2 text-center">
          <div className="mx-auto size-10 animate-pulse rounded-full bg-muted ring-4 ring-card motion-reduce:animate-none" />
          <div className="mx-auto mt-2 h-3 w-14 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="mx-auto mt-1 h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

function EmptyStoryTimeline({
  contactId,
}: {
  contactId: ContactOverviewModel["contactId"];
}) {
  return (
    <div className="relative mt-4 py-2">
      <div className="pointer-events-none absolute top-[1.625rem] right-8 left-8 hidden border-t border-dashed border-border sm:block" />
      <div className="relative mx-auto max-w-72 text-center">
        <Link
          href={`/events/new?contact=${contactId}`}
          aria-label="Log a moment"
          className="mx-auto flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground ring-5 ring-card outline-none transition-colors hover:bg-accent/80 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Plus className="size-4" />
        </Link>
        <p className="mt-2 text-xs font-medium leading-4 text-muted-foreground">
          Start here
        </p>
        <p className="mx-auto mt-0.5 max-w-72 text-sm font-semibold leading-5">
          No shared moments yet. Log a moment to start building this story.
        </p>
      </div>
    </div>
  );
}

function StoryTimelineError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
      <p className="font-medium">Unable to load shared moments.</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          className="mt-3"
          type="button"
          variant="outline"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

function StorySectionHeader({
  onViewTimeline,
}: {
  onViewTimeline?: () => void;
}) {
  return (
    <ContactSectionHeader
      headingId="overview-story-title"
      title="Our story so far"
      subtitle="Key moments in your relationship."
      icon={MapPinned}
      iconTone="violet"
      action={
        onViewTimeline ? (
          <Button
            type="button"
            variant="ghost"
            className="h-9 px-0 text-primary-strong"
            onClick={onViewTimeline}
          >
            View timeline
            <ArrowRight className="size-4" />
          </Button>
        ) : null
      }
    />
  );
}
