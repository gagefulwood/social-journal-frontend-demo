"use client";

import { ArrowUpRight } from "lucide-react";

import { MediaTile } from "@/components/media/MediaTile";
import { MediaUploadQueue } from "@/components/media/MediaUploadQueue";
import {
  getMediaAltText,
  getMediaFilename,
  getMediaKind,
  getMediaPreviewUrl,
} from "@/components/media/media-utils";
import { Button } from "@/components/ui/button";
import type { ApiId } from "@/types/api";
import type { EventChapterHeader, EventMediaAttachment } from "@/types/events";

type EventMediaCollectionProps = {
  eventId: ApiId;
  eventAssetCount: number;
  chapters: EventChapterHeader[];
  attachments: EventMediaAttachment[];
  onAttachmentsChange: (attachments: EventMediaAttachment[]) => void;
  onOpenChapter: (chapter: EventChapterHeader) => void;
};

export function EventMediaCollection({
  eventId,
  eventAssetCount,
  chapters,
  attachments,
  onAttachmentsChange,
  onOpenChapter,
}: EventMediaCollectionProps) {
  const wholeEventMedia = attachments.filter(
    (attachment) => attachment.chapter_id == null,
  );
  const chapterGroups = chapters.flatMap((chapter) => {
    if (chapter.id == null) return [];
    const media = attachments.filter(
      (attachment) =>
        attachment.chapter_id != null &&
        String(attachment.chapter_id) === String(chapter.id),
    );
    return media.length > 0 ? [{ chapter, media }] : [];
  });

  function updateWholeEventMedia(nextWholeEventMedia: EventMediaAttachment[]) {
    const chapterMedia = attachments.filter(
      (attachment) => attachment.chapter_id != null,
    );
    onAttachmentsChange([...nextWholeEventMedia, ...chapterMedia]);
  }

  return (
    <div className="space-y-5">
      <section aria-labelledby="whole-event-media-heading">
        <div className="mb-3">
          <h3 id="whole-event-media-heading" className="text-sm font-semibold">
            Event cover and supporting media
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            These items shape the Event header and can be reordered here.
          </p>
        </div>
        <MediaUploadQueue
          eventId={eventId}
          eventAssetCount={eventAssetCount}
          attachments={wholeEventMedia}
          onAttachmentsChange={updateWholeEventMedia}
        />
      </section>

      {chapterGroups.length > 0 && (
        <section
          aria-labelledby="chapter-media-collection-heading"
          className="border-t border-border pt-4"
        >
          <h3
            id="chapter-media-collection-heading"
            className="text-sm font-semibold"
          >
            Chapter media
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The complete collection is shown here. Open a chapter to change its
            order, crop, or attachments without mixing scopes.
          </p>

          <div className="mt-3 space-y-4">
            {chapterGroups.map(({ chapter, media }) => (
              <section
                key={String(chapter.id)}
                aria-labelledby={`collection-chapter-${chapter.id}`}
              >
                <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                  <h4
                    id={`collection-chapter-${chapter.id}`}
                    className="min-w-0 truncate text-sm font-medium"
                  >
                    {chapter.title || "Untitled chapter"}
                  </h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenChapter(chapter)}
                  >
                    Open chapter
                    <ArrowUpRight aria-hidden="true" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {media.map((attachment) => (
                    <MediaTile
                      key={attachment.id}
                      name={getMediaFilename(attachment)}
                      kind={getMediaKind(attachment)}
                      previewUrl={getMediaPreviewUrl(attachment)}
                      mediaAsset={attachment.media_asset}
                      altText={getMediaAltText(attachment)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
