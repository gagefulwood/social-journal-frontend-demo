"use client";

import { useState } from "react";
import {
  CalendarDays,
  ImagePlus,
  MapPin,
  Play,
  UsersRound,
} from "lucide-react";

import { contactName } from "@/components/contacts/contact-utils";
import { EventParticipantAvatar } from "@/components/events/detail/EventParticipantAvatar";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { JournalStateIndicator } from "@/components/presentation/JournalStateIndicator";
import { Button } from "@/components/ui/button";
import { CroppedMediaImage } from "@/components/media/CroppedMediaImage";
import {
  formatMediaDuration,
  getMediaAltText,
  getMediaContentType,
  getMediaDuration,
  getMediaKind,
  getMediaObjectPosition,
  getMediaStatus,
  getMediaUrl,
} from "@/components/media/media-utils";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { getJournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import { cn } from "@/lib/utils";
import type { Event, EventMediaAttachment } from "@/types/events";
import type { ContextCategory } from "@/types/lookups";

type EventHeroProps = {
  event: Event;
  contextCategory: ContextCategory | null;
  onAddMedia: () => void;
};

export function EventHero({
  event,
  contextCategory,
  onAddMedia,
}: EventHeroProps) {
  const media = boundedHeroMedia(event);
  return media.length > 0 ? (
    <RichEventHero
      event={event}
      contextCategory={contextCategory}
      media={media}
    />
  ) : (
    <NoMediaEventHero
      event={event}
      contextCategory={contextCategory}
      onAddMedia={onAddMedia}
    />
  );
}

function RichEventHero({
  event,
  contextCategory,
  media,
}: {
  event: Event;
  contextCategory: ContextCategory | null;
  media: EventMediaAttachment[];
}) {
  const [primary, ...supporting] = media;

  return (
    <section
      aria-labelledby="event-title"
      className={cn(
        "grid min-w-0 gap-2 overflow-hidden rounded-lg bg-foreground p-2 shadow-sm lg:h-[22rem]",
        supporting.length > 0
          ? "lg:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]"
          : "lg:grid-cols-1",
      )}
    >
      <div className="relative min-h-72 overflow-hidden rounded-md sm:min-h-80 lg:min-h-0">
        <HeroMediaFrame attachment={primary} priority />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-black/5" />
        <HeroIdentity
          event={event}
          contextCategory={contextCategory}
          className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6"
          mutedClassName="text-white/85"
          chipClassName="border-white/25 bg-white/90"
        />
      </div>

      {supporting.length > 0 && (
        <div
          className={cn(
            "hidden min-h-0 gap-2 md:grid",
            supporting.length === 1 ? "lg:grid-rows-1" : "lg:grid-rows-2",
          )}
        >
          {supporting.slice(0, 2).map((attachment) => (
            <div
              key={attachment.id}
              className="relative min-h-0 overflow-hidden rounded-md"
            >
              <HeroMediaFrame attachment={attachment} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function NoMediaEventHero({
  event,
  contextCategory,
  onAddMedia,
}: EventHeroProps) {
  const participants = event.participants.slice(0, 3);
  const primaryParticipant = participants[0];

  return (
    <section
      aria-labelledby="event-title"
      className="relative isolate min-h-64 overflow-hidden rounded-lg border border-primary/15 bg-card shadow-sm"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgb(113 84 200 / .13) 0 2px, transparent 3px), radial-gradient(circle at 88% 24%, rgb(74 133 207 / .12) 0 2px, transparent 3px), linear-gradient(120deg, rgb(238 233 255 / .75), transparent 42%, rgb(252 237 224 / .45))",
          backgroundSize: "24px 24px, 30px 30px, auto",
        }}
      />
      <div className="grid min-h-64 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.8fr)] lg:items-center">
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <EventIconTile
            presentation={
              getEventPresentation({
                ...event,
                context_category: contextCategory ?? event.context_category,
              }).icon
            }
            size="standard"
            className="mt-1 size-14 rounded-full sm:size-20 [&_svg]:size-8 sm:[&_svg]:size-10"
          />
          <HeroIdentity event={event} contextCategory={contextCategory} />
        </div>

        <aside className="min-w-0 border-t border-border/80 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-7">
          {primaryParticipant ? (
            <div className="flex min-w-0 items-center gap-4">
              <EventParticipantAvatar
                participant={primaryParticipant}
                size="lg"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {event.participants.length === 1
                    ? "Shared with"
                    : `${event.participants.length} participants`}
                </p>
                <p className="mt-0.5 truncate font-semibold text-foreground">
                  {event.participants.length === 1
                    ? contactName(primaryParticipant.contact)
                    : participantNames(event)}
                </p>
                {event.participants.length === 1 &&
                  primaryParticipant.contact.relation_name && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {primaryParticipant.contact.relation_name}
                    </p>
                  )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <UsersRound className="size-5" aria-hidden="true" />
              No participants attached
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={onAddMedia}
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            Add photos or video
          </Button>
        </aside>
      </div>
    </section>
  );
}

function HeroIdentity({
  event,
  contextCategory,
  className,
  mutedClassName,
  chipClassName,
}: {
  event: Event;
  contextCategory: ContextCategory | null;
  className?: string;
  mutedClassName?: string;
  chipClassName?: string;
}) {
  const presentation = getEventPresentation({
    ...event,
    context_category: contextCategory ?? event.context_category,
  });
  const journalState = getJournalStatePresentation(event.journaled);

  return (
    <div className={cn("min-w-0", className)}>
      <h1
        id="event-title"
        className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl"
      >
        {event.title.trim() || "Untitled event"}
      </h1>
      <div
        className={cn(
          "mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm",
          mutedClassName ?? "text-muted-foreground",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <time dateTime={event.event_timestamp}>
            {formatEventDateTime(event.event_timestamp, event.end_timestamp)}
          </time>
        </span>
        {event.location_label && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location_label}</span>
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <EventSemanticChip
          presentation={presentation.semanticChip}
          className={chipClassName}
        />
        <JournalStateIndicator
          presentation={journalState}
          className={mutedClassName}
        />
      </div>
    </div>
  );
}

function HeroMediaFrame({
  attachment,
  priority = false,
}: {
  attachment: EventMediaAttachment;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const mediaSource = useRefreshableMediaUrl(attachment.media_asset);
  const url = mediaSource.url;
  const kind = getMediaKind(attachment);
  const duration = formatMediaDuration(getMediaDuration(attachment));

  if (!url || mediaSource.failed) {
    return (
      <div className="flex size-full min-h-32 items-center justify-center bg-muted text-sm text-muted-foreground">
        Media unavailable
      </div>
    );
  }

  return (
    <div className="relative size-full min-h-32 bg-muted">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted motion-reduce:animate-none" />
      )}
      {kind === "video" ? (
        <video
          key={mediaSource.revision}
          controls
          preload="metadata"
          aria-label={getMediaAltText(attachment)}
          className={cn(
            "size-full object-cover transition-opacity motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition: getMediaObjectPosition(attachment) }}
          onLoadedMetadata={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            mediaSource.refreshAfterError();
          }}
        >
          <source src={url} type={getMediaContentType(attachment)} />
        </video>
      ) : (
        <CroppedMediaImage
          key={mediaSource.revision}
          src={url}
          alt={getMediaAltText(attachment)}
          loading={priority ? "eager" : "lazy"}
          crop={attachment.crops?.find(
            (crop) => crop.crop_kind === "event_cover",
          )}
          sourceWidth={attachment.media_asset?.width}
          sourceHeight={attachment.media_asset?.height}
          cropMode="desktop"
          objectPosition={getMediaObjectPosition(attachment)}
          className={cn(
            "transition-opacity motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            mediaSource.refreshAfterError();
          }}
        />
      )}
      {kind === "video" && duration && (
        <span className="pointer-events-none absolute top-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
          <Play className="size-3" aria-hidden="true" />
          {duration}
        </span>
      )}
    </div>
  );
}

function boundedHeroMedia(event: Event) {
  const summary = event.media_summary;
  if (!summary) return [];
  const candidates = [summary.cover, ...(summary.previews ?? [])].filter(
    (item): item is EventMediaAttachment => Boolean(item),
  );
  const seen = new Set<string>();
  return candidates
    .filter((attachment) => {
      const key = String(attachment.id);
      if (
        seen.has(key) ||
        getMediaStatus(attachment) !== "ready" ||
        !["image", "video"].includes(getMediaKind(attachment)) ||
        !getMediaUrl(attachment)
      ) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}

function formatEventDateTime(startValue: string, endValue: string | null) {
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return "Date unavailable";
  const date = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(start);
  const startTime = formatTime(start);
  const end = endValue ? new Date(endValue) : null;
  const endTime = end && !Number.isNaN(end.getTime()) ? formatTime(end) : null;
  return endTime
    ? `${date} · ${startTime}–${endTime}`
    : `${date} · ${startTime}`;
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function participantNames(event: Event) {
  const names = event.participants
    .slice(0, 2)
    .map((participant) => contactName(participant.contact));
  const remaining = Math.max(0, event.participants.length - names.length);
  return remaining > 0 ? `${names.join(", ")} +${remaining}` : names.join(", ");
}
