"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

import {
  getMediaAltText,
  getMediaCaption,
  getMediaKind,
  getMediaObjectPosition,
  getMediaStatus,
  getMediaUrl,
} from "@/components/media/media-utils";
import { Button } from "@/components/ui/button";
import { CroppedMediaImage } from "@/components/media/CroppedMediaImage";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import { cn } from "@/lib/utils";
import type { EventMediaAttachment } from "@/types/events";

export function ChapterMediaCarousel({
  attachments,
}: {
  attachments: EventMediaAttachment[];
}) {
  const images = attachments
    .filter(
      (attachment) =>
        getMediaStatus(attachment) === "ready" &&
        getMediaKind(attachment) === "image" &&
        Boolean(getMediaUrl(attachment)),
    )
    .sort(
      (left, right) =>
        Number(Boolean(right.is_cover)) - Number(Boolean(left.is_cover)),
    );
  const [requestedIndex, setRequestedIndex] = useState(0);
  if (images.length === 0) return null;
  const index = Math.min(requestedIndex, images.length - 1);
  const active = images[index];

  function move(offset: -1 | 1) {
    setRequestedIndex((index + offset + images.length) % images.length);
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Chapter photos"
      tabIndex={0}
      className="min-w-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
      }}
    >
      <div className="relative aspect-[4/3] min-h-64 overflow-hidden rounded-lg bg-muted sm:min-h-80">
        <ChapterCarouselImage key={active.id} attachment={active} />
        {images.length > 1 && (
          <>
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              aria-label="Previous chapter photo"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full border-white/50 bg-white/90 text-foreground shadow-md"
              onClick={() => move(-1)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon-lg"
              variant="outline"
              aria-label="Next chapter photo"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full border-white/50 bg-white/90 text-foreground shadow-md"
              onClick={() => move(1)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            <span className="absolute right-3 bottom-3 rounded-md bg-black/65 px-2 py-1 text-xs font-medium text-white">
              {index + 1} of {images.length}
            </span>
          </>
        )}
      </div>

      <div className="mt-2 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          {getMediaCaption(active) && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {getMediaCaption(active)}
            </p>
          )}
        </div>
        {images.length > 1 && (
          <div
            className="flex shrink-0 items-center gap-1.5"
            aria-label="Choose photo"
          >
            {images.map((image, imageIndex) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Show photo ${imageIndex + 1}`}
                aria-current={imageIndex === index ? "true" : undefined}
                className={cn(
                  "size-3 rounded-full border-2 border-card outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring",
                  imageIndex === index
                    ? "bg-primary"
                    : "bg-muted-foreground/30",
                )}
                onClick={() => setRequestedIndex(imageIndex)}
              />
            ))}
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        Photo {index + 1} of {images.length}
      </p>
    </section>
  );
}

function ChapterCarouselImage({
  attachment,
}: {
  attachment: EventMediaAttachment;
}) {
  const mediaSource = useRefreshableMediaUrl(attachment.media_asset);

  if (!mediaSource.url || mediaSource.failed || mediaSource.isRefreshing) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
        {mediaSource.isRefreshing ? "Refreshing photo…" : "Photo unavailable"}
      </div>
    );
  }

  return (
    <CroppedMediaImage
      key={mediaSource.revision}
      src={mediaSource.url}
      alt={getMediaAltText(attachment)}
      crop={attachment.crops?.find(
        (crop) => crop.crop_kind === "chapter_carousel",
      )}
      sourceWidth={attachment.media_asset?.width}
      sourceHeight={attachment.media_asset?.height}
      objectPosition={getMediaObjectPosition(attachment)}
      onError={mediaSource.refreshAfterError}
    />
  );
}

export function ChapterMediaEmpty({ onAddMedia }: { onAddMedia: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed border-border bg-muted/20 p-3">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Images className="size-4" aria-hidden="true" />
        No photo or video in this chapter yet.
      </span>
      <Button type="button" size="sm" variant="ghost" onClick={onAddMedia}>
        Add a photo or video
      </Button>
    </div>
  );
}
