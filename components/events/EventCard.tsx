"use client";

import Link from "next/link";
import type { EventListItem } from "@/types/events";
import {
  eventContextName,
  eventDate,
  eventTierLabel,
  eventTitle,
} from "@/components/events/event-utils";

type EventCardProps = {
  event: EventListItem;
};

export function EventCard({ event }: EventCardProps) {
  const title = eventTitle(event);
  const date = eventDate(event);
  const context = eventContextName(event);
  const tier = eventTierLabel(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs transition hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex min-h-36 flex-col justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-semibold">
              {title}
            </h2>
            <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {tier}
            </span>
          </div>

          {date && (
            <p className="truncate text-sm text-muted-foreground">{date}</p>
          )}

          <div className="space-y-1 text-sm text-muted-foreground">
            {context && <p className="truncate">{context}</p>}
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
          <span
            className={
              event.journaled
                ? "rounded-md bg-foreground px-2 py-0.5 font-medium text-background"
                : "rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground"
            }
          >
            {event.journaled ? "Journaled" : "Unjournaled"}
          </span>
        </div>
      </div>
    </Link>
  );
}

