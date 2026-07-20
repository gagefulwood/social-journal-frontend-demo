"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MoreVertical,
  Pencil,
  Quote,
  Smile,
  Trash2,
} from "lucide-react";

import { EventParticipantAvatar } from "@/components/events/detail/EventParticipantAvatar";
import {
  ChapterMediaCarousel,
  ChapterMediaEmpty,
} from "@/components/events/detail/ChapterMediaCarousel";
import { ChapterSupportingMedia } from "@/components/events/detail/ChapterSupportingMedia";
import { EventJournalPreview } from "@/components/events/detail/EventJournalPreview";
import { getMediaKind, getMediaStatus } from "@/components/media/media-utils";
import { MediaUploadQueue } from "@/components/media/MediaUploadQueue";
import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { moodPolarityToneClass } from "@/lib/presentation/moodPolarityPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/auth";
import type { ContactListItem } from "@/types/contacts";
import type {
  Event,
  EventChapterDetail,
  EventMediaAttachment,
} from "@/types/events";
import type { ContextCategory } from "@/types/lookups";
import type {
  EventImpactKey,
  InteractionModeKey,
  SemanticPresentation,
} from "@/lib/presentation/types";

type ChapterDetailProps = {
  event: Event;
  contextCategory: ContextCategory | null;
  chapter: EventChapterDetail | null;
  loading: boolean;
  error: ApiError | null;
  previousChapterTitle?: string | null;
  nextChapterTitle?: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onMoveEarlier?: () => void;
  onMoveLater?: () => void;
  onMediaChange: (attachments: EventMediaAttachment[]) => void;
};

export function ChapterDetail({
  event,
  contextCategory,
  chapter,
  loading,
  error,
  previousChapterTitle,
  nextChapterTitle,
  onPrevious,
  onNext,
  onRetry,
  onEdit,
  onDelete,
  onMoveEarlier,
  onMoveLater,
  onMediaChange,
}: ChapterDetailProps) {
  const [mediaManagerOpen, setMediaManagerOpen] = useState(false);
  const [mediaOverride, setMediaOverride] = useState<{
    chapterKey: string;
    attachments: EventMediaAttachment[];
  } | null>(null);

  if (loading) return <ChapterDetailSkeleton />;
  if (error) {
    return (
      <section className="rounded-lg border border-border bg-card p-5 shadow-xs">
        <h2 className="font-semibold">Unable to load this chapter</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      </section>
    );
  }
  if (!chapter) return null;

  const chapterKey = chapter.id == null ? "projection" : String(chapter.id);
  const media =
    mediaOverride?.chapterKey === chapterKey
      ? mediaOverride.attachments
      : (chapter.media ?? []);
  function changeMedia(attachments: EventMediaAttachment[]) {
    setMediaOverride({ chapterKey, attachments });
    onMediaChange(attachments);
  }
  const imageCount = media.filter(
    (item) =>
      getMediaStatus(item) === "ready" && getMediaKind(item) === "image",
  ).length;
  const participants = chapterParticipants(chapter, event);
  const defaultContactId =
    participants.length === 1 ? participants[0].id : null;
  const note = (chapter.note ?? chapter.description ?? "").trim();
  const isProjection = chapter.is_projection === true || chapter.id == null;

  return (
    <section
      id="selected-chapter-panel"
      role="tabpanel"
      aria-labelledby="selected-chapter-heading"
      className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm sm:p-4"
    >
      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {participants[0] && (
            <EventParticipantAvatar contact={participants[0]} size="md" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {participantSummary(participants)}
            </p>
            <h2
              id="selected-chapter-heading"
              className="mt-0.5 text-xl leading-7 font-semibold break-words [overflow-wrap:anywhere]"
            >
              {chapter.title || "Untitled chapter"}
            </h2>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {formatChapterRange(chapter, event)}
              </span>
              {chapterLocation(chapter, event) && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {chapterLocation(chapter, event)}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Actions for ${chapter.title || "chapter"}`}
            >
              <MoreVertical aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil aria-hidden="true" />
              {isProjection ? "Edit and create chapter" : "Edit chapter"}
            </DropdownMenuItem>
            {onMoveEarlier && !isProjection && (
              <DropdownMenuItem onSelect={onMoveEarlier}>
                <ArrowUp aria-hidden="true" />
                Move earlier
              </DropdownMenuItem>
            )}
            {onMoveLater && !isProjection && (
              <DropdownMenuItem onSelect={onMoveLater}>
                <ArrowDown aria-hidden="true" />
                Move later
              </DropdownMenuItem>
            )}
            {onDelete && !isProjection && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash2 aria-hidden="true" />
                  Delete chapter
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div
        className={cn(
          "mt-4 grid min-w-0 gap-4",
          imageCount > 0 &&
            "xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.82fr)]",
          imageCount === 0 &&
            "lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.75fr)]",
        )}
      >
        <div className="min-w-0">
          {imageCount > 0 ? (
            <ChapterMediaCarousel attachments={media} />
          ) : (
            <ChapterNote
              note={note}
              event={event}
              contextCategory={contextCategory}
              featured
            />
          )}
        </div>

        <div className="min-w-0 space-y-4">
          {imageCount > 0 && (
            <ChapterNote
              note={note}
              event={event}
              contextCategory={contextCategory}
            />
          )}
          <ChapterSupportingMedia attachments={media} />
          {imageCount === 0 && (
            <ChapterMediaEmpty onAddMedia={() => setMediaManagerOpen(true)} />
          )}
        </div>
      </div>

      <details
        open={mediaManagerOpen}
        className="mt-4 rounded-md border border-border bg-muted/15 p-3"
        onToggle={(event) => setMediaManagerOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          Manage chapter media
        </summary>
        {isProjection ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Create the projected chapter before attaching chapter-specific
              media.
            </p>
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              Create this chapter
            </Button>
          </div>
        ) : (
          <MediaUploadQueue
            eventId={event.id}
            chapterId={chapter.id}
            eventAssetCount={event.media_summary?.total_count}
            attachments={media}
            onAttachmentsChange={changeMedia}
            className="mt-3"
          />
        )}
      </details>

      {!isProjection && chapter.id != null && chapter.journals && (
        <div className="mt-4">
          <EventJournalPreview
            eventId={event.id}
            journals={chapter.journals}
            scope="chapter"
            chapterId={chapter.id}
            defaultContactId={defaultContactId}
          />
        </div>
      )}

      <nav
        aria-label="Adjacent chapters"
        className="mt-4 flex min-w-0 flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <Button
          type="button"
          variant="outline"
          disabled={!previousChapterTitle}
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden="true" />
          <span className="max-w-56 truncate">
            {previousChapterTitle
              ? `Previous: ${previousChapterTitle}`
              : "Previous chapter"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!nextChapterTitle}
          className="sm:ml-auto"
          onClick={onNext}
        >
          <span className="max-w-56 truncate">
            {nextChapterTitle ? `Next: ${nextChapterTitle}` : "Next chapter"}
          </span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </nav>
    </section>
  );
}

function ChapterNote({
  note,
  event,
  contextCategory,
  featured = false,
}: {
  note: string;
  event: Event;
  contextCategory: ContextCategory | null;
  featured?: boolean;
}) {
  return (
    <section
      aria-labelledby="chapter-note-heading"
      className={cn(
        "relative overflow-hidden rounded-lg border border-primary/15 bg-accent/35 p-4",
        featured && "min-h-56 sm:p-5",
      )}
    >
      <Quote
        className="absolute top-3 right-3 size-10 text-primary/15"
        aria-hidden="true"
      />
      <h3
        id="chapter-note-heading"
        className="text-sm font-semibold text-primary"
      >
        Chapter note
      </h3>
      <p
        className={cn(
          "mt-2 whitespace-pre-wrap text-sm leading-6",
          note ? "text-foreground" : "text-muted-foreground",
          featured && "text-base leading-7",
        )}
      >
        {note || "No note recorded for this chapter."}
      </p>
      <ChapterSemanticSignals event={event} contextCategory={contextCategory} />
    </section>
  );
}

function ChapterSemanticSignals({
  event,
  contextCategory,
}: {
  event: Event;
  contextCategory: ContextCategory | null;
}) {
  const presentation = getEventPresentation({
    ...event,
    context_category: contextCategory ?? event.context_category,
  });
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {event.mood && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium",
            moodPolarityToneClass(event.mood.polarity),
          )}
        >
          <Smile className="size-3.5" aria-hidden="true" />
          {event.mood.name}
        </span>
      )}
      {event.impact && <SemanticSignal presentation={presentation.impact} />}
      {event.interaction_mode && (
        <SemanticSignal presentation={presentation.interactionMode} />
      )}
    </div>
  );
}

function SemanticSignal({
  presentation,
}: {
  presentation: SemanticPresentation<EventImpactKey | InteractionModeKey>;
}) {
  const tokens = resolvePresentationTokenClasses(presentation.tokens);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ring-1",
        tokens.surface,
        tokens.foreground,
        tokens.border,
        tokens.emphasis,
      )}
    >
      {renderPresentationIcon(presentation.icon, {
        className: "size-3.5",
        "aria-hidden": true,
      })}
      {presentation.label}
    </span>
  );
}

function ChapterDetailSkeleton() {
  return (
    <section
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
      aria-label="Loading chapter"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <Skeleton className="mt-4 aspect-video min-h-64 w-full rounded-lg" />
    </section>
  );
}

function chapterParticipants(chapter: EventChapterDetail, event: Event) {
  return (
    chapter.effective_participants ??
    event.participants.map((participant) => participant.contact)
  );
}

function participantSummary(participants: ContactListItem[]) {
  if (participants.length === 0) return "You";
  const names = participants
    .slice(0, 2)
    .map((contact) =>
      [contact.first_name, contact.last_name].filter(Boolean).join(" "),
    );
  const remaining = Math.max(0, participants.length - names.length);
  return `You + ${names.join(", ")}${remaining ? ` +${remaining}` : ""}`;
}

function formatChapterRange(chapter: EventChapterDetail, event: Event) {
  const startValue =
    chapter.effective_start_timestamp ??
    chapter.start_timestamp ??
    event.event_timestamp;
  const endValue =
    chapter.effective_end_timestamp ??
    chapter.end_timestamp ??
    event.end_timestamp;
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return "Time unavailable";
  const startLabel = formatTime(start);
  const end = endValue ? new Date(endValue) : null;
  return end && !Number.isNaN(end.getTime())
    ? `${startLabel}–${formatTime(end)}`
    : startLabel;
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function chapterLocation(chapter: EventChapterDetail, event: Event) {
  return (
    chapter.effective_location_label ??
    chapter.location_label ??
    event.location_label ??
    ""
  );
}
