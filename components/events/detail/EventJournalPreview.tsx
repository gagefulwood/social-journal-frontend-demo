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
import type { ApiId } from "@/types/api";
import type {
  EventJournalsSummary,
  EventLogSummary,
  EventReflectionSummary,
} from "@/types/events";

const PREVIEW_LIMIT = 4;

type EventJournalPreviewProps = {
  eventId: ApiId;
  journals: EventJournalsSummary;
  scope: "chapter" | "event";
  chapterId?: ApiId | null;
  defaultContactId?: ApiId | null;
};

type JournalPreview = EventLogSummary | EventReflectionSummary;

export function EventJournalPreview({
  eventId,
  journals,
  scope,
  chapterId = null,
  defaultContactId = null,
}: EventJournalPreviewProps) {
  const total = journals.log_count + journals.reflection_count;
  const heading =
    scope === "chapter" ? "Journal perspective" : "Event perspective";

  function optionHref(option: NewJournalChooserOption) {
    const query = new URLSearchParams({ event: String(eventId) });
    if (scope === "chapter" && chapterId != null) {
      query.set("chapter", String(chapterId));
    }
    if (defaultContactId != null) {
      query.set("contact", String(defaultContactId));
    }
    return `${option.href}?${query.toString()}`;
  }

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            <NotebookTabs className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{heading}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {scope === "chapter"
                ? total === 0
                  ? "No Journals are attached to this chapter yet."
                  : `${total} ${total === 1 ? "Journal" : "Journals"} attached to this chapter.`
                : total === 0
                  ? "No whole-Event Journals yet."
                  : `${total} whole-Event ${total === 1 ? "Journal remains" : "Journals remain"} separate from the selected chapter.`}
            </p>
          </div>
        </div>
        <NewJournalChooser
          getOptionHref={optionHref}
          trigger={
            <Button type="button" size="sm" variant="outline">
              <Plus aria-hidden="true" />
              {total > 0 ? "Add another journal" : "New journal"}
            </Button>
          }
        />
      </div>

      <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-2">
        <JournalFamilyGroup
          family="log"
          entries={journals.logs}
          total={journals.log_count}
          eventId={eventId}
          scope={scope}
          chapterId={chapterId}
        />
        <JournalFamilyGroup
          family="reflection"
          entries={journals.reflections}
          total={journals.reflection_count}
          eventId={eventId}
          scope={scope}
          chapterId={chapterId}
        />
      </div>
    </section>
  );
}

function JournalFamilyGroup({
  family,
  entries,
  total,
  eventId,
  scope,
  chapterId,
}: {
  family: "log" | "reflection";
  entries: JournalPreview[];
  total: number;
  eventId: ApiId;
  scope: "chapter" | "event";
  chapterId: ApiId | null;
}) {
  const familyPresentation = getJournalFamilyPresentation(family);
  const visible = entries.slice(0, PREVIEW_LIMIT);
  const familyLabel = family === "log" ? "Logs" : "Reflections";
  const view = family === "log" ? "logs" : "reflections";
  const viewAllHref = journalHubHref({
    eventId,
    chapterId,
    scope,
    view,
  });

  return (
    <section className="min-w-0 overflow-hidden rounded-md border border-border/80 bg-background/60">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2.5">
        <JournalSemanticChip presentation={familyPresentation} size="compact" />
        <span className="text-xs tabular-nums text-muted-foreground">
          {total}
        </span>
      </div>
      {total === 0 ? (
        <p className="px-3 py-4 text-sm text-muted-foreground">
          No {familyLabel.toLowerCase()} attached.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border/70">
            {visible.map((entry) => (
              <JournalRow key={`${entry.family}-${entry.id}`} entry={entry} />
            ))}
          </ul>
          {total > visible.length && (
            <div className="border-t border-border/70 px-3 py-2">
              <Button asChild variant="link" size="sm" className="h-auto px-0">
                <Link href={viewAllHref}>
                  View all {total} {familyLabel.toLowerCase()}
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function JournalRow({ entry }: { entry: JournalPreview }) {
  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation(entry.family, entry.format);
  const status = getJournalStatusPresentation(entry.status);
  const timestamp = entry.occurred_at ?? entry.updated_timestamp;
  const title = entry.title.trim() || `Untitled ${primaryPresentation.label}`;
  const href = `/journals/${entry.family === "log" ? "logs" : "reflections"}/${entry.id}`;
  const summary = entry.summary?.trim() || entry.excerpt?.trim() || "";

  return (
    <li>
      <Link
        href={href}
        className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-3 py-3 outline-none transition-colors hover:bg-muted/30 focus-visible:bg-muted/30 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        <JournalIconTile presentation={primaryPresentation} size="compact" />
        <span className="min-w-0">
          <span className="line-clamp-2 text-sm leading-5 font-medium text-foreground group-hover:text-primary">
            {title}
          </span>
          {summary && (
            <span className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">
              {summary}
            </span>
          )}
          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>{familyPresentation.label}</span>
            {formatPresentation && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatPresentation.label}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={timestamp}>{formatTimestamp(timestamp)}</time>
            {entry.primary_contact && (
              <span
                title={entry.primary_contact.display_name}
                className="inline-flex min-w-0 max-w-40 items-center gap-1"
              >
                <UserRound className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {entry.primary_contact.display_name}
                </span>
              </span>
            )}
          </span>
          <JournalStatusIndicator
            presentation={status}
            size="compact"
            className="mt-1.5"
          />
        </span>
        <ChevronRight
          className="mt-2 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function journalHubHref({
  eventId,
  chapterId,
  scope,
  view,
}: {
  eventId: ApiId;
  chapterId: ApiId | null;
  scope: "chapter" | "event";
  view: string;
}) {
  const query = new URLSearchParams({
    view,
    event: String(eventId),
    chapter:
      scope === "chapter" && chapterId != null ? String(chapterId) : "event",
  });
  return `/journals?${query.toString()}`;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  }).format(date);
}
