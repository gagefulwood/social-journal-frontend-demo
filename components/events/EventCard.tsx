"use client";

import Link from "next/link";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { JournalStateIndicator } from "@/components/presentation/JournalStateIndicator";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { getJournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import type { EventListItem } from "@/types/events";
import { eventDate, eventTitle } from "@/components/events/event-utils";

type EventCardProps = {
  event: EventListItem;
};

export function EventCard({ event }: EventCardProps) {
  const title = eventTitle(event);
  const date = eventDate(event);
  const presentation = getEventPresentation(event);
  const journalPresentation = getJournalStatePresentation(event.journaled);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs transition hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex min-h-36 flex-col justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <EventIconTile presentation={presentation.icon} size="compact" />
              <h2 className="min-w-0 truncate text-base font-semibold">
                {title}
              </h2>
            </div>
            <EventSemanticChip
              presentation={presentation.semanticChip}
              size="compact"
            />
          </div>

          {date && (
            <p className="truncate text-sm text-muted-foreground">{date}</p>
          )}

          <div className="space-y-1 text-sm text-muted-foreground">
            {event.location_label && (
              <p className="truncate">{event.location_label}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {event.participant_count}{" "}
            {event.participant_count === 1 ? "participant" : "participants"}
          </span>
          <JournalStateIndicator
            presentation={journalPresentation}
            size="compact"
          />
        </div>
      </div>
    </Link>
  );
}
