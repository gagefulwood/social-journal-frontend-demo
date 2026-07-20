"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  UsersRound,
} from "lucide-react";

import {
  contactInitials,
  contactName,
} from "@/components/contacts/contact-utils";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { JournalStateIndicator } from "@/components/presentation/JournalStateIndicator";
import { resolveMediaUrl } from "@/lib/media/resolveMediaUrl";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { getJournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import { cn } from "@/lib/utils";
import type { EventListItem, EventParticipant } from "@/types/events";

export type EventCardVariant = "grid" | "list" | "upcoming";

type EventCardProps = {
  event: EventListItem;
  variant?: EventCardVariant;
};

export function EventCard({ event, variant = "grid" }: EventCardProps) {
  if (variant === "upcoming") {
    return <UpcomingEventCard event={event} />;
  }

  if (variant === "list") {
    return <EventListCard event={event} />;
  }

  return <EventGridCard event={event} />;
}

function EventGridCard({ event }: { event: EventListItem }) {
  const presentation = getEventPresentation(event);
  const journalPresentation = getJournalStatePresentation(event.journaled);
  const date = eventDateParts(event.event_timestamp);
  const description = event.description.trim();

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xs outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none"
    >
      <div className="flex min-h-24 items-start justify-between gap-4 border-b border-border/70 bg-muted/25 p-4">
        <EventIconTile presentation={presentation.icon} size="standard" />
        <EventSemanticChip
          presentation={presentation.semanticChip}
          size="compact"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 break-words text-base font-semibold leading-6 text-foreground [overflow-wrap:anywhere] group-hover:text-primary">
          {event.title.trim() || "Untitled event"}
        </h3>

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <time dateTime={event.event_timestamp}>{date.full}</time>
        </div>

        {event.location_label && (
          <p
            title={event.location_label}
            className="mt-1.5 flex min-w-0 items-center gap-2 text-sm text-muted-foreground"
          >
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{event.location_label}</span>
          </p>
        )}

        {description && (
          <p className="mt-3 line-clamp-2 break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">
            {description}
          </p>
        )}

        <div className="mt-auto flex min-w-0 items-end justify-between gap-3 border-t border-border/70 pt-4">
          <EventParticipantSummary event={event} />
          <JournalStateIndicator
            presentation={journalPresentation}
            size="compact"
          />
        </div>
      </div>
    </Link>
  );
}

function EventListCard({ event }: { event: EventListItem }) {
  const presentation = getEventPresentation(event);
  const journalPresentation = getJournalStatePresentation(event.journaled);
  const date = eventDateParts(event.event_timestamp);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-xs outline-none transition-colors hover:border-primary/30 hover:bg-muted/15 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:items-center sm:gap-4 sm:p-4"
    >
      <EventIconTile presentation={presentation.icon} size="standard" />

      <span className="min-w-0">
        <span className="line-clamp-2 break-words text-sm font-semibold leading-5 text-foreground group-hover:text-primary sm:text-base sm:leading-6">
          {event.title.trim() || "Untitled event"}
        </span>
        <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          <time dateTime={event.event_timestamp}>{date.full}</time>
          {event.location_label && (
            <span
              title={event.location_label}
              className="inline-flex min-w-0 max-w-72 items-center gap-1"
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location_label}</span>
            </span>
          )}
        </span>
        <span className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <EventSemanticChip
            presentation={presentation.semanticChip}
            size="compact"
          />
          <JournalStateIndicator
            presentation={journalPresentation}
            size="compact"
          />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <UsersRound className="size-3.5" aria-hidden="true" />
            {event.participant_count}
          </span>
        </span>
      </span>

      <ChevronRight
        className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none sm:mt-0"
        aria-hidden="true"
      />
    </Link>
  );
}

function UpcomingEventCard({ event }: { event: EventListItem }) {
  const presentation = getEventPresentation(event);
  const date = eventDateParts(event.event_timestamp);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-border bg-card p-3 shadow-xs outline-none transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-4"
    >
      <time
        dateTime={event.event_timestamp}
        className="flex min-h-16 flex-col items-center justify-center rounded-lg bg-accent text-center text-accent-foreground"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {date.month}
        </span>
        <span className="text-2xl font-semibold leading-7">{date.day}</span>
      </time>

      <span className="min-w-0">
        <span className="flex min-w-0 items-start gap-2">
          <EventIconTile
            presentation={presentation.icon}
            size="compact"
            className="hidden sm:flex"
          />
          <span className="min-w-0">
            <span className="line-clamp-2 break-words text-sm font-semibold leading-5 text-foreground group-hover:text-primary sm:text-base sm:leading-6">
              {event.title.trim() || "Untitled event"}
            </span>
            <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {date.time}
              </span>
              {event.location_label && (
                <span
                  title={event.location_label}
                  className="inline-flex min-w-0 max-w-52 items-center gap-1"
                >
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{event.location_label}</span>
                </span>
              )}
            </span>
          </span>
        </span>

        <span className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
          <EventSemanticChip
            presentation={presentation.semanticChip}
            size="compact"
          />
          <EventParticipantSummary event={event} compact />
        </span>
      </span>

      <ChevronRight
        className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );
}

function EventParticipantSummary({
  event,
  compact = false,
}: {
  event: EventListItem;
  compact?: boolean;
}) {
  const visibleParticipants = event.participants.slice(0, compact ? 2 : 3);
  const overflow = Math.max(
    0,
    event.participant_count - visibleParticipants.length,
  );

  if (event.participant_count === 0) {
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        <UsersRound className="size-3.5 shrink-0" aria-hidden="true" />
        No participants
      </span>
    );
  }

  return (
    <span
      className="inline-flex min-w-0 items-center gap-2"
      aria-label={`${event.participant_count} ${event.participant_count === 1 ? "participant" : "participants"}`}
    >
      <span className="flex -space-x-2" aria-hidden="true">
        {visibleParticipants.map((participant) => (
          <ParticipantAvatar key={participant.id} participant={participant} />
        ))}
        {overflow > 0 && (
          <span className="inline-flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-foreground">
            +{overflow}
          </span>
        )}
      </span>
      <span
        className={cn("text-xs text-muted-foreground", compact && "sr-only")}
      >
        {event.participant_count === 1
          ? "1 participant"
          : `${event.participant_count} participants`}
      </span>
    </span>
  );
}

function ParticipantAvatar({ participant }: { participant: EventParticipant }) {
  const name = contactName(participant.contact);
  const imageUrl = resolveMediaUrl(participant.contact.profile_picture?.url);

  if (imageUrl) {
    return (
      <span
        role="img"
        aria-label={participant.contact.profile_picture?.alt_text || name}
        className="size-7 shrink-0 rounded-full border-2 border-card bg-muted bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-card bg-accent text-[10px] font-semibold text-accent-foreground">
      {contactInitials(participant.contact)}
    </span>
  );
}

function eventDateParts(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      day: "—",
      full: "Date unavailable",
      month: "Date",
      time: "Time unavailable",
    };
  }

  return {
    day: new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date),
    full: new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
    month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
}
