import { resolveMediaSourceUrl } from "@/lib/media/resolveMediaUrl";
import type { EventMediaAttachment } from "@/types/events";
import type { MediaKind, MediaProcessingStatus } from "@/types/media";

export function getMediaKind(attachment: EventMediaAttachment): MediaKind {
  const contentType = getMediaContentType(attachment).toLowerCase();
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";

  const lookupName = attachment.media_asset?.media_type?.name?.toLowerCase();
  if (
    lookupName === "image" ||
    lookupName === "video" ||
    lookupName === "audio"
  ) {
    return lookupName;
  }
  return "file";
}

export function getMediaStatus(
  attachment: EventMediaAttachment,
): MediaProcessingStatus {
  return attachment.media_asset?.status ?? "ready";
}

export function getMediaContentType(attachment: EventMediaAttachment) {
  return (
    attachment.media_asset?.detected_content_type ??
    attachment.media_asset?.content_type ??
    "application/octet-stream"
  );
}

export function getMediaFilename(attachment: EventMediaAttachment) {
  return attachment.media_asset?.original_filename ?? "Media attachment";
}

export function getMediaAltText(attachment: EventMediaAttachment) {
  if (attachment.decorative) return "";
  return (
    attachment.alt_text?.trim() ||
    attachment.media_asset?.alt_text?.trim() ||
    getMediaFilename(attachment)
  );
}

export function getMediaCaption(attachment: EventMediaAttachment) {
  return (
    attachment.caption?.trim() || attachment.media_asset?.caption?.trim() || ""
  );
}

export function getMediaDuration(attachment: EventMediaAttachment) {
  return attachment.media_asset?.duration_ms == null
    ? null
    : attachment.media_asset.duration_ms / 1000;
}

export function getMediaUrl(attachment: EventMediaAttachment) {
  return resolveMediaSourceUrl(attachment.media_asset);
}

export function getMediaPreviewUrl(attachment: EventMediaAttachment) {
  return getMediaUrl(attachment);
}

export function getMediaObjectPosition(attachment: EventMediaAttachment) {
  const x = clampUnit(attachment.focal_x ?? 0.5) * 100;
  const y = clampUnit(attachment.focal_y ?? 0.5) * 100;
  return `${x}% ${y}%`;
}

export function formatMediaDuration(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  const seconds = Math.round(value);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}
