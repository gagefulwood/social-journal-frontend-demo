"use client";

import { useId } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Crop,
  FileText,
  Loader2,
  Music2,
  RotateCcw,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import { cn } from "@/lib/utils";
import type { MediaAssetListItem, MediaKind } from "@/types/media";

export type MediaTileState =
  | "queued"
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "cancelled";

type MediaTileProps = {
  name: string;
  kind: MediaKind;
  previewUrl?: string | null;
  mediaAsset?: MediaAssetListItem | null;
  altText?: string;
  state?: MediaTileState;
  progress?: number;
  error?: string | null;
  decorative?: boolean;
  metadataEditable?: boolean;
  canCrop?: boolean;
  canSetCover?: boolean;
  isCover?: boolean;
  settingCover?: boolean;
  onAltTextChange?: (value: string) => void;
  onDecorativeChange?: (value: boolean) => void;
  onStartUpload?: () => void;
  canMovePrevious?: boolean;
  canMoveNext?: boolean;
  onCrop?: () => void;
  onSetCover?: () => void;
  onMovePrevious?: () => void;
  onMoveNext?: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
  onRemove?: () => void;
  className?: string;
};

export function MediaTile({
  name,
  kind,
  previewUrl,
  mediaAsset,
  altText,
  state = "ready",
  progress = 0,
  error,
  decorative = false,
  metadataEditable = false,
  canCrop = false,
  canSetCover = false,
  isCover = false,
  settingCover = false,
  onAltTextChange,
  onDecorativeChange,
  onStartUpload,
  canMovePrevious = false,
  canMoveNext = false,
  onCrop,
  onSetCover,
  onMovePrevious,
  onMoveNext,
  onRetry,
  onCancel,
  onRemove,
  className,
}: MediaTileProps) {
  const descriptionId = useId();
  const decorativeId = useId();
  const busy = state === "uploading" || state === "processing";
  const refreshedMedia = useRefreshableMediaUrl(mediaAsset);
  const resolvedPreviewUrl = mediaAsset ? refreshedMedia.url : previewUrl;
  const previewAvailable =
    Boolean(resolvedPreviewUrl) &&
    !refreshedMedia.isRefreshing &&
    !refreshedMedia.failed;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        className,
      )}
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted/60">
        {previewAvailable && kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={refreshedMedia.revision}
            src={resolvedPreviewUrl ?? undefined}
            alt={altText ?? name}
            className="size-full object-cover"
            onError={mediaAsset ? refreshedMedia.refreshAfterError : undefined}
          />
        ) : previewAvailable && kind === "video" ? (
          <video
            key={refreshedMedia.revision}
            src={resolvedPreviewUrl ?? undefined}
            aria-label={altText ?? name}
            muted
            preload="metadata"
            className="size-full object-cover"
            onError={mediaAsset ? refreshedMedia.refreshAfterError : undefined}
          />
        ) : (
          <MediaKindIcon kind={kind} />
        )}

        {busy && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85 px-4 text-center">
            <Loader2
              className="size-5 animate-spin text-primary motion-reduce:animate-none"
              aria-hidden="true"
            />
            <span className="text-xs font-medium">
              {state === "processing"
                ? "Processing safely…"
                : `Uploading ${Math.round(progress)}%`}
            </span>
            {state === "uploading" && (
              <div
                role="progressbar"
                aria-label={`Uploading ${name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                  style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium" title={name}>
          {name}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {mediaStateLabel(state)}
        </p>
        {error && (
          <p className="mt-2 text-xs leading-4 text-destructive" role="alert">
            {error}
          </p>
        )}

        {metadataEditable && kind === "image" && state === "queued" && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            <label
              htmlFor={descriptionId}
              className="block text-xs font-medium text-foreground"
            >
              Image description
            </label>
            <textarea
              id={descriptionId}
              value={altText ?? ""}
              maxLength={255}
              rows={2}
              disabled={decorative}
              placeholder="Describe what matters in this image"
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => onAltTextChange?.(event.target.value)}
            />
            <label
              htmlFor={decorativeId}
              className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground"
            >
              <input
                id={decorativeId}
                type="checkbox"
                checked={decorative}
                className="mt-0.5 size-4 rounded border-input accent-primary"
                onChange={(event) => onDecorativeChange?.(event.target.checked)}
              />
              <span>
                Decorative image — it adds no information beyond the page.
              </span>
            </label>
            <p className="text-[11px] leading-4 text-muted-foreground">
              A description is required unless the image is decorative.
            </p>
          </div>
        )}

        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1">
          {metadataEditable && state === "queued" && onStartUpload && (
            <Button
              type="button"
              size="xs"
              variant="default"
              onClick={onStartUpload}
            >
              <Upload className="size-3" aria-hidden="true" />
              Upload
            </Button>
          )}
          {canCrop && onCrop && state === "ready" && (
            <Button type="button" size="xs" variant="outline" onClick={onCrop}>
              <Crop className="size-3" aria-hidden="true" />
              Crop
            </Button>
          )}
          {canSetCover && onSetCover && state === "ready" && (
            <Button
              type="button"
              size="xs"
              variant={isCover ? "secondary" : "outline"}
              disabled={isCover || settingCover}
              onClick={onSetCover}
            >
              {settingCover ? (
                <Loader2
                  className="size-3 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Star
                  className="size-3"
                  fill={isCover ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              )}
              {isCover ? "Cover" : settingCover ? "Setting…" : "Set cover"}
            </Button>
          )}
          {onMovePrevious && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={`Move ${name} earlier`}
              disabled={!canMovePrevious || busy}
              onClick={onMovePrevious}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
          )}
          {onMoveNext && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={`Move ${name} later`}
              disabled={!canMoveNext || busy}
              onClick={onMoveNext}
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
          {(state === "failed" || state === "processing") && onRetry && (
            <Button type="button" size="xs" variant="outline" onClick={onRetry}>
              <RotateCcw className="size-3" aria-hidden="true" />
              Retry
            </Button>
          )}
          {state === "uploading" && onCancel && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={onCancel}
            >
              <X className="size-3" aria-hidden="true" />
              Cancel
            </Button>
          )}
          {onRemove && !busy && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="ml-auto text-destructive"
              aria-label={`Remove ${name}`}
              onClick={onRemove}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function MediaKindIcon({ kind }: { kind: MediaKind }) {
  const className = "size-7 text-muted-foreground";
  if (kind === "video")
    return <Video className={className} aria-hidden="true" />;
  if (kind === "audio")
    return <Music2 className={className} aria-hidden="true" />;
  return <FileText className={className} aria-hidden="true" />;
}

function mediaStateLabel(state: MediaTileState) {
  switch (state) {
    case "queued":
      return "Waiting to upload";
    case "uploading":
      return "Uploading";
    case "processing":
      return "Processing";
    case "failed":
      return "Upload failed";
    case "cancelled":
      return "Upload cancelled";
    default:
      return "Ready";
  }
}
