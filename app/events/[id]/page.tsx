"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ChapterDetail } from "@/components/events/detail/ChapterDetail";
import { ChapterFormDialog } from "@/components/events/detail/ChapterFormDialog";
import { ChapterNavigator } from "@/components/events/detail/ChapterNavigator";
import { EventDetailShell } from "@/components/events/detail/EventDetailShell";
import { EventHero } from "@/components/events/detail/EventHero";
import { EventJournalPreview } from "@/components/events/detail/EventJournalPreview";
import { EventMediaCollection } from "@/components/events/detail/EventMediaCollection";
import { EventMediaSummary } from "@/components/events/detail/EventMediaSummary";
import { EventRelatedMoments } from "@/components/events/detail/EventRelatedMoments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsApi } from "@/lib/api/eventsApi";
import { useEvent, useEventChapter, useRelatedEvents } from "@/hooks/useEvent";
import type { ApiError } from "@/types/auth";
import type { ApiId } from "@/types/api";
import type {
  CreateEventChapterRequest,
  Event,
  EventChapterDetail,
  EventChapterHeader,
  EventMediaAttachment,
  LegacyChapterProjection,
} from "@/types/events";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = params.id;
  const { event, loading, error, refetch } = useEvent(eventId);
  const [relatedLimit, setRelatedLimit] = useState(2);
  const {
    relatedEvents,
    loading: relatedLoading,
    error: relatedError,
  } = useRelatedEvents(eventId, relatedLimit);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chapterDialog, setChapterDialog] = useState<{
    mode: "create" | "edit";
    chapter: EventChapterDetail | null;
  } | null>(null);
  const [chapterDeleteOpen, setChapterDeleteOpen] = useState(false);
  const [eventMediaOpen, setEventMediaOpen] = useState(false);
  const [eventMedia, setEventMedia] = useState<EventMediaAttachment[] | null>(
    null,
  );
  const [eventMediaLoading, setEventMediaLoading] = useState(false);
  const [eventMediaError, setEventMediaError] = useState<ApiError | null>(null);

  const chapters = useMemo(() => eventChapters(event), [event]);
  const requestedChapterId = searchParams.get("chapter");
  const activeHeader = useMemo(
    () => selectActiveHeader(chapters, requestedChapterId),
    [chapters, requestedChapterId],
  );
  const projection = useMemo(
    () =>
      activeHeader?.id == null
        ? (event?.legacy_chapter ?? synthesizeProjection(event))
        : null,
    [activeHeader?.id, event],
  );
  const {
    chapter,
    loading: chapterLoading,
    error: chapterError,
    refetch: refetchChapter,
    invalidate: invalidateChapter,
  } = useEventChapter(event?.id, activeHeader?.id, projection);
  const activeIndex = activeHeader
    ? chapters.findIndex((item) => idsMatch(item.id, activeHeader.id))
    : -1;
  const previousChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter =
    activeIndex >= 0 && activeIndex < chapters.length - 1
      ? chapters[activeIndex + 1]
      : null;

  useEffect(() => {
    if (
      !event ||
      event.chapter_mode !== "persisted" ||
      activeHeader?.id == null
    ) {
      return;
    }
    if (requestedChapterId === String(activeHeader.id)) return;
    const query = new URLSearchParams(searchParams.toString());
    query.set("chapter", String(activeHeader.id));
    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }, [
    activeHeader?.id,
    event,
    pathname,
    requestedChapterId,
    router,
    searchParams,
  ]);

  function selectChapter(header: EventChapterHeader) {
    const query = new URLSearchParams(searchParams.toString());
    if (header.id == null) query.delete("chapter");
    else query.set("chapter", String(header.id));
    const suffix = query.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
      scroll: false,
    });
  }

  async function confirmDelete() {
    if (!event || isDeleting) return;
    setIsDeleting(true);
    try {
      await eventsApi.remove(event.id);
      toast.success("Event deleted.");
      router.push("/events");
    } catch (requestError) {
      toast.error(errorMessage(requestError, "Unable to delete event."));
      setIsDeleting(false);
    }
  }

  async function saveChapter(data: CreateEventChapterRequest) {
    if (!event || !chapterDialog) return;
    let saved: EventChapterDetail;
    if (chapterDialog.mode === "create") {
      saved = await eventsApi.createChapter(event.id, data);
    } else if (chapterDialog.chapter?.id == null) {
      saved = await eventsApi.materializeLegacyChapter(event.id, data);
    } else {
      saved = await eventsApi.updateChapter(
        event.id,
        chapterDialog.chapter.id,
        data,
      );
    }
    invalidateChapter();
    await refetch();
    if (saved.id != null) {
      selectChapter(saved);
    }
    toast.success(
      chapterDialog.mode === "create" ? "Chapter added." : "Chapter updated.",
    );
  }

  async function deleteChapter() {
    if (!event || chapter?.id == null) return;
    try {
      await eventsApi.removeChapter(event.id, chapter.id);
      invalidateChapter();
      setEventMedia(null);
      setChapterDeleteOpen(false);
      const query = new URLSearchParams(searchParams.toString());
      query.delete("chapter");
      router.replace(query.size ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
      await refetch();
      toast.success(
        "Chapter deleted. Its Journals remain attached to the Event.",
      );
    } catch (requestError) {
      toast.error(errorMessage(requestError, "Unable to delete chapter."));
    }
  }

  async function reorderActiveChapter(offset: -1 | 1) {
    if (!event || activeHeader?.id == null || activeIndex < 0) return;
    const targetIndex = activeIndex + offset;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    const reordered = [...chapters];
    [reordered[activeIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[activeIndex],
    ];
    const chapterIds = reordered.flatMap((item) =>
      item.id == null ? [] : [item.id],
    );
    if (chapterIds.length !== reordered.length) return;
    try {
      await eventsApi.reorderChapters(event.id, chapterIds);
      invalidateChapter();
      await refetch();
      toast.success("Chapter order updated.");
    } catch (requestError) {
      toast.error(
        errorMessage(requestError, "Unable to update the chapter order."),
      );
    }
  }

  async function loadEventMedia() {
    if (!event || eventMediaLoading) return;
    setEventMediaLoading(true);
    setEventMediaError(null);
    try {
      setEventMedia(await eventsApi.listMedia(event.id));
    } catch (requestError) {
      setEventMediaError(requestError as ApiError);
    } finally {
      setEventMediaLoading(false);
    }
  }

  function openEventMedia() {
    setEventMediaOpen(true);
    if (eventMedia == null) void loadEventMedia();
    requestAnimationFrame(() => {
      document.getElementById("event-media-collection")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  async function eventMediaChanged(attachments: EventMediaAttachment[]) {
    setEventMedia(attachments);
    await refetch();
  }

  const actions = (
    <>
      <Button asChild variant="outline">
        <Link href="/events">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>
      </Button>
      <div className="ml-auto flex min-w-0 items-center gap-2">
        <Button asChild variant="outline">
          <Link
            href={`/events/${eventId}/edit`}
            aria-label="Edit event. Event timestamp remains read-only after creation."
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={!event || isDeleting}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete event?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes the Event, its chapters, media associations, and
                participant links. Stored media and attached Journals are kept;
                Journals will no longer reference this Event. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={() => void confirmDelete()}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );

  return (
    <EventDetailShell actions={actions}>
      {loading && <EventDetailSkeleton />}
      {error && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <h1 className="text-lg font-semibold">Unable to load event</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </section>
      )}
      {!loading && !error && !event && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-xs">
          <h1 className="text-lg font-semibold">Event not found</h1>
        </section>
      )}

      {event && (
        <>
          <EventHero
            event={event}
            contextCategory={event.context_category_summary ?? null}
            onAddMedia={openEventMedia}
          />
          <EventMediaSummary
            summary={event.media_summary}
            onAddMedia={openEventMedia}
            onViewCollection={openEventMedia}
          />
          <details
            id="event-media-collection"
            open={eventMediaOpen}
            className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4"
            onToggle={(toggleEvent) => {
              const open = toggleEvent.currentTarget.open;
              setEventMediaOpen(open);
              if (open && eventMedia == null) void loadEventMedia();
            }}
          >
            <summary className="cursor-pointer text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              Event media collection
            </summary>
            {eventMediaOpen && (
              <div className="mt-3">
                {eventMediaLoading && (
                  <p className="text-sm text-muted-foreground">
                    Loading collection…
                  </p>
                )}
                {eventMediaError && (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-destructive">
                      {eventMediaError.message}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => void loadEventMedia()}
                    >
                      Retry
                    </Button>
                  </div>
                )}
                {!eventMediaLoading && !eventMediaError && eventMedia && (
                  <EventMediaCollection
                    eventId={event.id}
                    eventAssetCount={event.media_summary?.total_count ?? 0}
                    chapters={chapters}
                    attachments={eventMedia}
                    onAttachmentsChange={(attachments) =>
                      void eventMediaChanged(attachments)
                    }
                    onOpenChapter={(chapter) => {
                      selectChapter(chapter);
                      setEventMediaOpen(false);
                      requestAnimationFrame(() => {
                        document
                          .getElementById("selected-chapter-panel")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      });
                    }}
                  />
                )}
              </div>
            )}
          </details>

          <ChapterNavigator
            event={event}
            contextCategory={event.context_category_summary ?? null}
            chapters={chapters}
            activeChapterId={activeHeader?.id ?? null}
            onSelect={selectChapter}
            onAddChapter={() =>
              setChapterDialog({ mode: "create", chapter: null })
            }
          />

          <ChapterDetail
            event={event}
            contextCategory={event.context_category_summary ?? null}
            chapter={chapter}
            loading={chapterLoading}
            error={chapterError}
            previousChapterTitle={previousChapter?.title}
            nextChapterTitle={nextChapter?.title}
            onPrevious={() => previousChapter && selectChapter(previousChapter)}
            onNext={() => nextChapter && selectChapter(nextChapter)}
            onRetry={() => void refetchChapter()}
            onEdit={() =>
              setChapterDialog({ mode: "edit", chapter: chapter ?? null })
            }
            onDelete={
              chapter?.id == null ? undefined : () => setChapterDeleteOpen(true)
            }
            onMoveEarlier={
              chapter?.id != null && activeIndex > 0
                ? () => void reorderActiveChapter(-1)
                : undefined
            }
            onMoveLater={
              chapter?.id != null && activeIndex < chapters.length - 1
                ? () => void reorderActiveChapter(1)
                : undefined
            }
            onMediaChange={() => {
              invalidateChapter();
              setEventMedia(null);
              void refetch();
            }}
          />

          <EventJournalPreview
            eventId={event.id}
            journals={event.journals}
            scope="event"
            defaultContactId={
              event.participants.length === 1
                ? event.participants[0].contact.id
                : null
            }
          />

          <EventRelatedMoments
            events={relatedEvents}
            loading={relatedLoading}
            error={relatedError}
            canExpand={relatedEvents.length >= 2 && relatedLimit < 10}
            onViewAll={() => setRelatedLimit(10)}
          />
        </>
      )}

      {chapterDialog && (
        <ChapterFormDialog
          open
          mode={chapterDialog.mode}
          chapter={chapterDialog.chapter}
          eventParticipants={
            event?.participants.map((participant) => participant.contact) ?? []
          }
          onOpenChange={(open) => {
            if (!open) setChapterDialog(null);
          }}
          onSubmit={saveChapter}
        />
      )}

      <AlertDialog open={chapterDeleteOpen} onOpenChange={setChapterDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              Chapter Journals stay attached to the Event without a chapter.
              Chapter media moves to the whole-Event collection. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void deleteChapter()}
            >
              Delete chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EventDetailShell>
  );
}

function EventDetailSkeleton() {
  return (
    <div aria-label="Loading Event detail" className="space-y-3">
      <Skeleton className="h-72 w-full rounded-lg sm:h-80" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

function eventChapters(event: Event | null): EventChapterHeader[] {
  if (!event) return [];
  if (event.chapter_mode === "persisted" && event.chapters?.length) {
    return [...event.chapters].sort(
      (left, right) => left.position - right.position,
    );
  }
  const projection = event.legacy_chapter ?? synthesizeProjection(event);
  return projection ? [projection] : [];
}

function synthesizeProjection(
  event: Event | null,
): LegacyChapterProjection | null {
  if (!event) return null;
  return {
    id: null,
    is_projection: true,
    title: event.title || "Moment",
    position: 0,
    start_timestamp: event.event_timestamp,
    end_timestamp: event.end_timestamp,
    location_label: event.location_label,
    effective_location_label: event.location_label,
    note: event.description,
    inherits_event_participants: true,
    effective_participants: event.participants.map(
      (participant) => participant.contact,
    ),
    media: [],
    journals: event.journals,
  };
}

function selectActiveHeader(
  chapters: EventChapterHeader[],
  requestedChapterId: string | null,
) {
  if (chapters.length === 0) return null;
  if (requestedChapterId) {
    const requested = chapters.find(
      (chapter) =>
        chapter.id != null && String(chapter.id) === requestedChapterId,
    );
    if (requested) return requested;
  }
  return chapters[0];
}

function idsMatch(left: ApiId | null, right: ApiId | null) {
  return left == null && right == null
    ? true
    : left != null && right != null && String(left) === String(right);
}

function errorMessage(error: unknown, fallback: string) {
  return (
    (error as { message?: string } | null)?.message ||
    (error instanceof Error ? error.message : fallback)
  );
}
