import { Images } from "lucide-react";

import { SensitiveMediaPreview } from "@/components/journals/media/SensitiveMediaPreview";
import type { JournalAttachment } from "@/types/journals";

export function ReflectionMediaGallery({
  attachments,
  limit = 4,
}: {
  attachments: JournalAttachment[];
  limit?: number;
}) {
  const visible = attachments.slice(0, limit);
  const remaining = Math.max(0, attachments.length - visible.length);

  if (!attachments.length) return null;

  return (
    <section
      aria-labelledby="reflection-media-heading"
      className="rounded-lg border border-border/80 bg-card p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Images className="size-4 text-primary" aria-hidden="true" />
        <h2
          id="reflection-media-heading"
          className="font-sans text-base font-semibold"
        >
          Supporting media
        </h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {attachments.length} {attachments.length === 1 ? "item" : "items"}
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visible.map((attachment) => (
          <article
            key={attachment.id}
            className="min-w-0 rounded-md border border-border/70 bg-muted/15 p-2.5"
          >
            <SensitiveMediaPreview
              fileUrl={attachment.media_asset.file_url}
              thumbnailUrl={attachment.media_asset.thumbnail_url}
              altText={
                attachment.is_sensitive
                  ? undefined
                  : attachment.media_asset.alt_text
              }
              contentType={attachment.media_asset.content_type}
              filename={attachment.media_asset.original_filename}
              isSensitive={attachment.is_sensitive}
            />
            <p
              className="mt-2 truncate text-sm font-medium"
              title={
                attachment.is_sensitive
                  ? undefined
                  : attachment.media_asset.original_filename
              }
            >
              {attachment.is_sensitive
                ? "Sensitive attachment"
                : attachment.media_asset.original_filename}
            </p>
            {!attachment.is_sensitive && attachment.media_asset.caption ? (
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                {attachment.media_asset.caption}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {attachment.recorded_at ? "Recorded " : "Uploaded "}
              {new Date(
                attachment.recorded_at ??
                  attachment.media_asset.created_timestamp,
              ).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
      {remaining ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {remaining} more {remaining === 1 ? "attachment" : "attachments"}{" "}
          recorded.
        </p>
      ) : null}
    </section>
  );
}
