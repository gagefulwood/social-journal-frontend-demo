import type {ApiId } from "@/types/api";
import type { Event, EventListItem } from "@/types/events";
import type { ContextCategory } from "@/types/lookups";

export function eventTitle(event: Event | EventListItem) {
    return event.title || "Untitled Event";
}

/*export function eventDate(event: Event | EventListItem) {
    const date = new Date(event.event_timestamp);
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}*/

export function eventContext(event: Event | EventListItem) {
    return event.context_category || "No context provided";
}

