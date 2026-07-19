"use client";

import Link from "next/link";
import { ChevronRight, NotebookTabs, Plus, UserRound } from "lucide-react";

import {
  NewJournalChooser,
  type NewJournalChooserOption,
} from "@/components/journals/chooser/NewJournalChooser";
import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { JournalStatusIndicator } from "@/components/presentation/JournalStatusIndicator";
import { Button } from "@/components/ui/button";
import {
  getJournalClassificationPresentation,
  getJournalFamilyPresentation,
  getJournalStatusPresentation,
} from "@/lib/presentation/journalPresentation";
import type {
  Event,
  EventLogSummary,
  EventReflectionSummary,
} from "@/types/events";

const EVENT_JOURNAL_PREVIEW_LIMIT = 4;

type EventJournalSummary = EventLogSummary | EventReflectionSummary;

export function EventJournalsBand({ event }: { event: Event }) {
  const totalCount = event.journals.log_count + event.journals.reflection_count;
  const defaultContactId =
    event.participants.length === 1 ? event.participants[0].contact.id : null;

  function getOptionHref(option: NewJournalChooserOption) {
    const context = new URLSearchParams({ event: String(event.id) });
    if (defaultContactId != null) {
      context.set("contact", String(defaultContactId));
    }
    return `${option.href}?${context.toString()}`;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
            <NotebookTabs className="size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Attached Journals
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {totalCount === 0
                ? "No Logs or Reflections are attached to this event yet."
                : `${totalCount} ${totalCount === 1 ? "Journal" : "Journals"} attached to this event.`}
            </p>
          </div>
        </div>

        <NewJournalChooser
          getOptionHref={getOptionHref}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <Plus aria-hidden="true" />
              New journal
            </Button>
          }
        />
      </div>

      <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-2">
        <EventJournalFamilyGroup
          family="log"
          entries={event.journals.logs}
          totalCount={event.journals.log_count}
          eventId={event.id}
        />
        <EventJournalFamilyGroup
          family="reflection"
          entries={event.journals.reflections}
          totalCount={event.journals.reflection_count}
          eventId={event.id}
        />
      </div>
    </section>
  );
}

function EventJournalFamilyGroup({
  family,
  entries,
  totalCount,
  eventId,
}: {
  family: "log" | "reflection";
  entries: EventJournalSummary[];
  totalCount: number;
  eventId: Event["id"];
}) {
  const familyPresentation = getJournalFamilyPresentation(family);
  const visibleEntries = entries.slice(0, EVENT_JOURNAL_PREVIEW_LIMIT);
  const familyLabel = family === "log" ? "Logs" : "Reflections";
  const view = family === "log" ? "logs" : "reflections";

  return (
    <section className="min-w-0 rounded-md border border-border/80 bg-background/60">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2.5">
        <JournalSemanticChip presentation={familyPresentation} size="compact" />
        <span className="text-xs tabular-nums text-muted-foreground">
          {totalCount}
        </span>
      </div>

      {totalCount === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">
          No {familyLabel.toLowerCase()} attached.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border/70">
            {visibleEntries.map((entry) => (
              <EventJournalRow
                key={`${entry.family}-${entry.id}`}
                entry={entry}
              />
            ))}
          </ul>
          {totalCount > visibleEntries.length && (
            <div className="border-t border-border/70 px-3 py-2">
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link href={`/journals?view=${view}&event=${eventId}`}>
                  View all {totalCount} {familyLabel.toLowerCase()}
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EventJournalRow({ entry }: { entry: EventJournalSummary }) {
  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation(entry.family, entry.format);
  const statusPresentation = getJournalStatusPresentation(entry.status);
  const timestamp = entry.occurred_at ?? entry.updated_timestamp;
  const title = entry.title.trim() || `Untitled ${primaryPresentation.label}`;
  const href = `/journals/${entry.family === "log" ? "logs" : "reflections"}/${entry.id}`;

  return (
    <li>
      <Link
        href={href}
        className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3 py-3 outline-none transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        <JournalIconTile presentation={primaryPresentation} size="compact" />
        <span className="min-w-0">
          <span className="line-clamp-2 text-sm font-medium leading-5 text-foreground group-hover:text-primary">
            {title}
          </span>
          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{familyPresentation.label}</span>
            {formatPresentation && (
              <>
                <span aria-hidden="true">?</span>
                <span>{formatPresentation.label}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={timestamp}>
              {formatJournalTimestamp(timestamp)}
            </time>
            {entry.primary_contact && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  title={entry.primary_contact.display_name}
                  className="inline-flex min-w-0 max-w-40 items-center gap-1"
                >
                  <UserRound className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {entry.primary_contact.display_name}
                  </span>
                </span>
              </>
            )}
          </span>
          <JournalStatusIndicator
            presentation={statusPresentation}
            size="compact"
            className="mt-1.5"
          />
        </span>
        <ChevronRight
          className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function formatJournalTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}
