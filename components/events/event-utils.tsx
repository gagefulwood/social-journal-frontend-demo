import type { Event, EventListItem } from "@/types/events";

export function eventTitle(event: Event | EventListItem) {
  return event.title || "Untitled Event";
}

export function eventDate(event: Event | EventListItem) {
  const date = new Date(event.event_timestamp);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function eventContextName(event: EventListItem) {
  return event.context_category?.name ?? null;
}

export function eventTierLabel(event: Event | EventListItem) {
  return event.tier === "milestone" ? "Milestone" : "Routine";
}
