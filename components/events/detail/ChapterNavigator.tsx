"use client";

import { useRef } from "react";
import { Clock3, MapPin, Plus, UsersRound } from "lucide-react";

import { EventParticipantAvatar } from "@/components/events/detail/EventParticipantAvatar";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { Button } from "@/components/ui/button";
import { getMediaAltText } from "@/components/media/media-utils";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { Event, EventChapterHeader } from "@/types/events";
import type { ContextCategory } from "@/types/lookups";

type ChapterNavigatorProps = {
  event: Event;
  contextCategory: ContextCategory | null;
  chapters: EventChapterHeader[];
  activeChapterId: ApiId | null;
  onSelect: (chapter: EventChapterHeader) => void;
  onAddChapter: () => void;
};

export function ChapterNavigator({
  event,
  contextCategory,
  chapters,
  activeChapterId,
  onSelect,
  onAddChapter,
}: ChapterNavigatorProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectAt(index: number) {
    const chapter = chapters[index];
    if (!chapter) return;
    onSelect(chapter);
    itemRefs.current[index]?.focus();
    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  return (
    <section aria-labelledby="chapter-navigator-heading" className="min-w-0">
      <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="chapter-navigator-heading" className="text-sm font-semibold">
            How this moment unfolded
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {chapters.length === 1
              ? "One chapter"
              : `${chapters.length} ordered chapters`}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddChapter}
        >
          <Plus aria-hidden="true" />
          Add chapter
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Event chapters"
        aria-orientation="horizontal"
        className="flex max-w-full snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2"
      >
        {chapters.map((chapter, index) => {
          const selected = idsMatch(chapter.id, activeChapterId);
          return (
            <button
              key={
                chapter.id == null ? "legacy-projection" : String(chapter.id)
              }
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="selected-chapter-panel"
              tabIndex={selected ? 0 : -1}
              className={cn(
                "group grid min-h-16 w-[min(22rem,82vw)] shrink-0 snap-start grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left shadow-xs outline-none transition-colors",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/15"
                  : "border-border hover:border-primary/30 hover:bg-muted/20",
              )}
              onClick={() => onSelect(chapter)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  selectAt((index + 1) % chapters.length);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  selectAt((index - 1 + chapters.length) % chapters.length);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  selectAt(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  selectAt(chapters.length - 1);
                }
              }}
            >
              <ChapterThumbnail
                event={event}
                contextCategory={contextCategory}
                chapter={chapter}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {chapter.title || "Untitled chapter"}
                </span>
                <span className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-3" aria-hidden="true" />
                    {formatChapterTime(chapter, event)}
                  </span>
                  {chapterLocation(chapter, event) && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin className="size-3 shrink-0" aria-hidden="true" />
                      <span className="max-w-36 truncate">
                        {chapterLocation(chapter, event)}
                      </span>
                    </span>
                  )}
                </span>
              </span>
              <ChapterParticipantPreview chapter={chapter} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ChapterThumbnail({
  event,
  contextCategory,
  chapter,
}: {
  event: Event;
  contextCategory: ContextCategory | null;
  chapter: EventChapterHeader;
}) {
  const mediaSource = useRefreshableMediaUrl(chapter.thumbnail?.media_asset);
  if (
    mediaSource.url &&
    chapter.thumbnail &&
    !mediaSource.isRefreshing &&
    !mediaSource.failed
  ) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={mediaSource.revision}
        src={mediaSource.url}
        alt={getMediaAltText(chapter.thumbnail)}
        className="size-11 rounded-md bg-muted object-cover"
        onError={mediaSource.refreshAfterError}
      />
    );
  }
  return (
    <EventIconTile
      presentation={
        getEventPresentation({
          ...event,
          context_category: contextCategory ?? event.context_category,
        }).icon
      }
      size="standard"
    />
  );
}

function ChapterParticipantPreview({
  chapter,
}: {
  chapter: EventChapterHeader;
}) {
  const first = chapter.participant_preview?.[0];
  if (first) {
    return <EventParticipantAvatar contact={first} size="sm" linked={false} />;
  }
  if ((chapter.participant_count ?? 0) > 0) {
    return (
      <span
        className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-label={`${chapter.participant_count} participants`}
      >
        <UsersRound className="size-4" aria-hidden="true" />
      </span>
    );
  }
  return null;
}

function formatChapterTime(chapter: EventChapterHeader, event: Event) {
  const value =
    chapter.start_timestamp ??
    chapter.effective_start_timestamp ??
    event.event_timestamp;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function chapterLocation(chapter: EventChapterHeader, event: Event) {
  return (
    chapter.effective_location_label ??
    chapter.location_label ??
    event.location_label ??
    ""
  );
}

function idsMatch(left: ApiId | null, right: ApiId | null) {
  return left == null && right == null
    ? true
    : left != null && right != null && String(left) === String(right);
}
