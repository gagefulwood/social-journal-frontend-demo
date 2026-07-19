"use client";

import { Check, ChevronRight, MapPin, UsersRound } from "lucide-react";

import { eventDateOnly, eventTitle } from "@/components/events/event-utils";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { cn } from "@/lib/utils";
import type { EventListItem } from "@/types/events";

export type JournalEventPreview = EventListItem & {
  contextSummaryAvailable?: boolean;
};

type JournalEventOptionCardProps = {
  event: JournalEventPreview;
  selected: boolean;
  onToggle: () => void;
};

export function JournalEventOptionCard({
  event,
  selected,
  onToggle,
}: JournalEventOptionCardProps) {
  const title = eventTitle(event);
  const date = eventDateOnly(event);
  const presentation = getEventPresentation(event);
  const categoryPresentation =
    event.contextSummaryAvailable === false
      ? presentation.tier
      : presentation.semanticChip;
  const participantCount = event.participant_count || event.participants.length;

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={
        selected
          ? `${title}, selected. Clear related moment`
          : `Select related moment ${title}`
      }
      className={cn(
        "group flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left shadow-xs transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary/70 bg-primary/5 text-foreground ring-1 ring-primary/15"
          : "border-border/80 bg-card text-foreground hover:border-primary/30 hover:bg-muted/25",
      )}
      onClick={onToggle}
    >
      <EventIconTile presentation={presentation.icon} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold" title={title}>
          {title}
        </span>
        <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {date ? <span className="shrink-0">{date}</span> : null}
          {event.location_label ? (
            <span
              className="inline-flex min-w-0 max-w-full items-center gap-1"
              title={event.location_label}
            >
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.location_label}</span>
            </span>
          ) : null}
          {participantCount > 0 ? (
            <span
              className="inline-flex shrink-0 items-center gap-1"
              aria-label={`${participantCount} ${participantCount === 1 ? "participant" : "participants"}`}
            >
              <UsersRound className="size-3" aria-hidden="true" />
              {participantCount}
            </span>
          ) : null}
          <EventSemanticChip
            presentation={categoryPresentation}
            size="compact"
          />
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground group-hover:text-primary",
        )}
      >
        {selected ? (
          <Check className="size-4" strokeWidth={2.5} />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </span>
    </button>
  );
}
