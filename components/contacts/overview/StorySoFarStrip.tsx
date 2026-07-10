import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  Footprints,
  MapPinned,
  MessageCircleMore,
  Plus,
  Star,
  Video,
} from "lucide-react";
import { formatDate } from "@/components/contacts/contact-utils";
import { IconBadge, type IconBadgeTone } from "@/components/ui/icon-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import type {
  ContactOverviewModel,
  StorySoFarEvent,
} from "./contact-overview-utils";

type StorySoFarStripProps = {
  model: ContactOverviewModel;
  loading?: boolean;
  onViewTimeline: () => void;
};

type StoryMomentPresentation = {
  icon: typeof CalendarDays;
  label: string;
  tone: IconBadgeTone;
};

export function StorySoFarStrip({
  model,
  loading = false,
  onViewTimeline,
}: StorySoFarStripProps) {
  const events = model.storySoFarEvents;

  return (
    <SurfaceCard asChild className="p-4">
      <section>
        <StorySectionHeader
          onViewTimeline={events.length > 0 ? onViewTimeline : undefined}
        />

        {loading ? (
          <StoryTimelineSkeleton />
        ) : events.length > 0 ? (
          <StoryMiniTimeline events={events} />
        ) : (
          <EmptyStoryTimeline contactId={model.contactId} />
        )}
      </section>
    </SurfaceCard>
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
      <div
        className="relative min-w-max sm:min-w-full"
        style={timelineStyle}
      >
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
  const presentation = getStoryMomentPresentation(event);
  const EventIcon = presentation.icon;
  const detail = [event.locationLabel, event.contextCategoryName]
    .filter(Boolean)
    .join(" · ");
  const accessibleDetail = detail ? `, ${detail}` : "";

  return (
    <Link
      href={`/events/${event.id}`}
      aria-label={`View ${presentation.label}: ${event.title}, ${formatDate(event.eventTimestamp)}${accessibleDetail}`}
      className="group relative z-10 flex min-w-0 flex-col items-center text-center outline-none focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <IconBadge
        tone={presentation.tone}
        size="md"
        shape="circle"
        className="ring-4 ring-card transition-colors group-hover:bg-accent group-hover:text-accent-foreground"
      >
        <EventIcon aria-hidden="true" />
      </IconBadge>
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

function getStoryMomentPresentation(
  event: StorySoFarEvent,
): StoryMomentPresentation {
  if (event.tier === "milestone") {
    return { icon: Star, label: "Milestone", tone: "violet" };
  }

  const searchable = [event.title, event.contextCategoryName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(coffee|cafe|conversation|catch-up|catch up)/.test(searchable)) {
    return { icon: Coffee, label: "Coffee or conversation", tone: "warning" };
  }

  if (/(video|remote|virtual|zoom|call)/.test(searchable)) {
    return { icon: Video, label: "Remote moment", tone: "info" };
  }

  if (/(hike|walk|trail|park|outdoor)/.test(searchable)) {
    return { icon: Footprints, label: "Outdoor moment", tone: "teal" };
  }

  if (/(social|friend|family)/.test(searchable)) {
    return { icon: MessageCircleMore, label: "Shared moment", tone: "violet" };
  }

  return { icon: CalendarDays, label: "Moment", tone: "indigo" };
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
          <div className="mx-auto size-10 animate-pulse rounded-full bg-muted ring-4 ring-card" />
          <div className="mx-auto mt-2 h-3 w-14 animate-pulse rounded bg-muted" />
          <div className="mx-auto mt-1 h-4 w-24 animate-pulse rounded bg-muted" />
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
    <div className="relative mt-4 min-h-28 py-2">
      <div className="pointer-events-none absolute top-[1.625rem] right-8 left-8 hidden border-t border-dashed border-border sm:block" />
      <div className="relative mx-auto max-w-40 text-center">
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
        <p className="mx-auto mt-0.5 max-w-32 text-sm font-semibold leading-5">
          No shared moments yet
        </p>
        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
          Add the first moment.
        </p>
      </div>
    </div>
  );
}

function StorySectionHeader({
  onViewTimeline,
}: {
  onViewTimeline?: () => void;
}) {
  return (
    <SectionHeader
      title="Our Story So Far"
      description="Key moments in your relationship."
      icon={
        <IconBadge tone="accent" size="lg" shape="circle">
          <MapPinned className="size-5" />
        </IconBadge>
      }
      action={
        onViewTimeline ? (
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-primary-strong outline-none transition-colors hover:bg-muted/20 focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={onViewTimeline}
          >
            View Timeline
            <ArrowRight className="size-4" />
          </button>
        ) : null
      }
    />
  );
}
