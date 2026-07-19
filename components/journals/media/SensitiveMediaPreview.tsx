"use client";

import { useState } from "react";
import { Eye, FileText, LockKeyhole, Music2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SensitiveMediaPreviewProps = {
  fileUrl: string | null;
  thumbnailUrl?: string | null;
  contentType: string;
  filename: string;
  isSensitive: boolean;
  className?: string;
  altText?: string;
  compact?: boolean;
};

export function SensitiveMediaPreview(props: SensitiveMediaPreviewProps) {
  const resetKey = `${props.isSensitive ? "sensitive" : "visible"}:${props.fileUrl ?? "missing"}`;
  return <SensitiveMediaPreviewContent key={resetKey} {...props} />;
}

function SensitiveMediaPreviewContent({
  fileUrl,
  thumbnailUrl,
  contentType,
  filename,
  isSensitive,
  className,
  compact = false,
  altText,
}: SensitiveMediaPreviewProps) {
  const [revealed, setRevealed] = useState(false);
  const mediaKind = contentType.toLowerCase();

  if (isSensitive && !revealed) {
    return (
      <div
        className={cn(
          "flex min-h-36 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-primary/25 bg-accent/45 p-4 text-center",
          compact && "min-h-24",
          className,
        )}
      >
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-card text-primary shadow-sm">
          <LockKeyhole className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium">Sensitive preview hidden</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Reveal only when you are ready to view it.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setRevealed(true)}
        >
          <Eye className="size-4" />
          Reveal
        </Button>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div
        className={cn(
          "flex min-h-36 items-center justify-center rounded-md border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground",
          compact && "min-h-24",
          className,
        )}
      >
        Preview unavailable
      </div>
    );
  }

  if (mediaKind.startsWith("image/") || mediaKind === "image") {
    return (
      // The asset URL is supplied by the authenticated media API.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={thumbnailUrl || fileUrl}
        alt={altText?.trim() || filename}
        className={cn(
          "h-44 w-full rounded-md bg-muted object-cover",
          compact && "h-28",
          className,
        )}
      />
    );
  }

  if (mediaKind.startsWith("video/") || mediaKind === "video") {
    return (
      <div className={cn("relative rounded-md bg-muted", className)}>
        <video
          controls
          preload="metadata"
          poster={thumbnailUrl || undefined}
          className={cn(
            "h-44 w-full rounded-md object-cover",
            compact && "h-28",
          )}
        >
          <source src={fileUrl} type={contentType} />
          Your browser cannot play this video.
        </video>
        <Video className="pointer-events-none absolute top-2 left-2 size-4 text-white drop-shadow" />
      </div>
    );
  }

  if (mediaKind.startsWith("audio/") || mediaKind === "audio") {
    return (
      <div
        className={cn(
          "flex min-h-36 flex-col items-center justify-center gap-3 rounded-md bg-muted/45 p-4",
          compact && "min-h-24",
          className,
        )}
      >
        <Music2 className="size-6 text-primary" aria-hidden="true" />
        <audio controls preload="metadata" className="w-full">
          <source src={fileUrl} type={contentType} />
          Your browser cannot play this audio.
        </audio>
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex min-h-36 flex-col items-center justify-center gap-2 rounded-md border bg-muted/30 p-4 text-center outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
        compact && "min-h-24",
        className,
      )}
    >
      <FileText className="size-6 text-primary" aria-hidden="true" />
      <span className="max-w-full truncate text-sm font-medium">
        {filename}
      </span>
      <span className="text-xs text-muted-foreground">Open attachment</span>
    </a>
  );
}
