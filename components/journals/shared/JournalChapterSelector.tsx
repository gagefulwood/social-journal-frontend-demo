"use client";

import { useEffect, useId, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { eventsApi } from "@/lib/api/eventsApi";
import type { ApiId } from "@/types/api";
import type { Event } from "@/types/events";

type JournalChapterSelectorProps = {
  eventId: ApiId | null;
  chapterId: ApiId | null;
  onChapterChange: (chapterId: ApiId | null) => void;
};

type EventLoadState = {
  eventId: string;
  event: Event | null;
  error: string | null;
};

export function JournalChapterSelector({
  eventId,
  chapterId,
  onChapterChange,
}: JournalChapterSelectorProps) {
  const id = useId();
  const [loadState, setLoadState] = useState<EventLoadState | null>(null);
  const eventKey = eventId == null ? null : String(eventId);

  useEffect(() => {
    let active = true;
    if (eventId == null) return;

    void eventsApi
      .get(eventId)
      .then((response) => {
        if (active) {
          setLoadState({
            eventId: String(eventId),
            event: response,
            error: null,
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setLoadState({
            eventId: String(eventId),
            event: null,
            error:
              (requestError as { message?: string })?.message ||
              "Chapter context is unavailable.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [eventId]);

  if (eventId == null) return null;

  const currentState = loadState?.eventId === eventKey ? loadState : null;
  const event = currentState?.event ?? null;
  const error = currentState?.error ?? null;
  const loading = currentState == null;

  if (loading && !event) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        Loading Journal perspective…
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex flex-wrap items-center gap-2" role="alert">
        <p className="text-sm text-destructive">{error}</p>
        {chapterId != null && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onChapterChange(null)}
          >
            Use Event perspective
          </Button>
        )}
      </div>
    );
  }

  const chapters = event?.chapters ?? [];
  const selectedChapterExists = chapters.some(
    (chapter) => chapter.id != null && String(chapter.id) === String(chapterId),
  );

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="inline-flex items-center gap-2">
        <BookOpen className="size-4 text-primary" aria-hidden="true" />
        Journal perspective
      </Label>
      <select
        id={id}
        value={selectedChapterExists ? String(chapterId) : "event"}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        onChange={(changeEvent) =>
          onChapterChange(
            changeEvent.target.value === "event"
              ? null
              : changeEvent.target.value,
          )
        }
      >
        <option value="event">Event perspective</option>
        {chapters.flatMap((chapter) =>
          chapter.id == null
            ? []
            : [
                <option key={String(chapter.id)} value={String(chapter.id)}>
                  Chapter: {chapter.title || "Untitled chapter"}
                </option>,
              ],
        )}
      </select>
      <p className="text-xs text-muted-foreground">
        {chapters.length > 0
          ? "Choose whether this Journal belongs to the whole Event or one chapter."
          : "This Event has no saved chapters, so the Journal uses the Event perspective."}
      </p>
    </div>
  );
}
