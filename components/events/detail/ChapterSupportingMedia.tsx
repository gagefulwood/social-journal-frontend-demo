"use client";

import { useState } from "react";
import { ChevronDown, Headphones, Play, Video } from "lucide-react";

import {
  formatMediaDuration,
  getMediaAltText,
  getMediaCaption,
  getMediaDuration,
  getMediaFilename,
  getMediaKind,
  getMediaStatus,
  getMediaUrl,
} from "@/components/media/media-utils";
import { Button } from "@/components/ui/button";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import { cn } from "@/lib/utils";
import type { EventMediaAttachment } from "@/types/events";

export function ChapterSupportingMedia({
  attachments,
}: {
  attachments: EventMediaAttachment[];
}) {
  const [expanded, setExpanded] = useState(false);
  const supporting = attachments.filter(
    (attachment) =>
      getMediaStatus(attachment) === "ready" &&
      ["video", "audio"].includes(getMediaKind(attachment)) &&
      Boolean(getMediaUrl(attachment)),
  );
  if (supporting.length === 0) return null;

  return (
    <section
      aria-labelledby="chapter-supporting-media-heading"
      className="min-w-0"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="chapter-supporting-media-heading"
          className="text-sm font-semibold"
        >
          More from this chapter
        </h3>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-expanded={expanded}
          aria-controls="chapter-supporting-media-content"
          className="lg:hidden"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Hide" : `Show ${supporting.length}`}
          <ChevronDown
            className={cn(
              "transition-transform motion-reduce:transition-none",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </Button>
      </div>
      <div
        id="chapter-supporting-media-content"
        className={cn(
          "mt-3 min-w-0 grid-cols-1 gap-3 sm:grid-cols-2",
          expanded ? "grid" : "hidden lg:grid",
        )}
      >
        {supporting.map((attachment) => (
          <SupportingMediaCard key={attachment.id} attachment={attachment} />
        ))}
      </div>
    </section>
  );
}

function SupportingMediaCard({
  attachment,
}: {
  attachment: EventMediaAttachment;
}) {
  const kind = getMediaKind(attachment);
  const mediaSource = useRefreshableMediaUrl(attachment.media_asset);
  const duration = formatMediaDuration(getMediaDuration(attachment));
  const caption = getMediaCaption(attachment);
  const title = caption || getMediaFilename(attachment);

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-xs">
      {kind === "video" ? (
        <div className="relative aspect-video bg-muted">
          {mediaSource.url &&
          !mediaSource.failed &&
          !mediaSource.isRefreshing ? (
            <video
              key={mediaSource.revision}
              src={mediaSource.url}
              controls
              preload="metadata"
              aria-label={getMediaAltText(attachment)}
              className="size-full object-cover"
              onError={mediaSource.refreshAfterError}
            />
          ) : (
            <MediaUnavailable refreshing={mediaSource.isRefreshing} />
          )}
          {duration && (
            <span className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-xs text-white">
              <Play className="size-3" aria-hidden="true" />
              {duration}
            </span>
          )}
        </div>
      ) : (
        <div className="flex min-h-28 flex-col justify-center gap-3 bg-accent/35 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Headphones className="size-4" aria-hidden="true" />
            Audio recording {duration ? `· ${duration}` : ""}
          </span>
          {mediaSource.url &&
          !mediaSource.failed &&
          !mediaSource.isRefreshing ? (
            <audio
              key={mediaSource.revision}
              src={mediaSource.url}
              controls
              preload="metadata"
              className="w-full"
              onError={mediaSource.refreshAfterError}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              {mediaSource.isRefreshing
                ? "Refreshing audio…"
                : "Audio unavailable"}
            </p>
          )}
        </div>
      )}
      <div className="p-3">
        <p className="line-clamp-2 text-sm font-medium">{title}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          {kind === "video" ? (
            <Video className="size-3" aria-hidden="true" />
          ) : (
            <Headphones className="size-3" aria-hidden="true" />
          )}
          {kind === "video" ? "Video" : "Audio"}
        </p>
      </div>
    </article>
  );
}

function MediaUnavailable({ refreshing }: { refreshing: boolean }) {
  return (
    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
      {refreshing ? "Refreshing media…" : "Media unavailable"}
    </div>
  );
}
