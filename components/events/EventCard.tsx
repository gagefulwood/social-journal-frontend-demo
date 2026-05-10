"use client";

import Link from "next/link";
import type { EventListItem } from "@/types/events";
import {
    eventTitle,
    eventContext,
} from "@/components/events/event-utils";

type EventCardProps = {
  event: EventListItem;
};

export function EventCard({ event }: EventCardProps) {
  const title = eventTitle(event);
  //const date = eventDate(event);
  const context = eventContext(event);

  return (
    <Link
        href={`/events/${event.id}`}
        className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs transition hover:border-foreground/20 hover:shadow-sm"
    >
        <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{title}</h2>
                        {/* {date && (
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                {date}
                            </p>
                        )} */}
                        {context && (
                            <p className="mt-2 truncate text-sm text-muted-foreground">
                                {event.context_category?.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </Link>
  );
}


