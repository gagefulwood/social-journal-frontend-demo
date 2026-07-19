"use client";

import { useRef, useState } from "react";
import {
  ImageIcon,
  Loader2,
  Paperclip,
  Shield,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ReflectionMediaMetadataFields } from "@/components/journals/media/ReflectionMediaMetadataFields";
import { SensitiveMediaPreview } from "@/components/journals/media/SensitiveMediaPreview";
import type { ReflectionAttachmentDraft } from "@/components/journals/reflections/reflectionDraft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mediaApi } from "@/lib/api/mediaApi";
import type { ApiId } from "@/types/api";

type ReflectionMediaFieldProps = {
  value: ReflectionAttachmentDraft[];
  coverMediaAssetId: ApiId | null;
  onChange: (value: ReflectionAttachmentDraft[]) => void;
  onCoverChange: (value: ApiId | null) => void;
};

export function ReflectionMediaField({
  value,
  coverMediaAssetId,
  onChange,
  onCoverChange,
}: ReflectionMediaFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map((file) => mediaApi.upload({ file })),
      );
      const recordedAt = toLocalDateTime(new Date());
      onChange([
        ...value,
        ...uploaded.map((asset, index) => ({
          mediaAssetId: asset.id,
          fileUrl: asset.url || asset.file || null,
          thumbnailUrl: null,
          originalFilename: asset.original_filename,
          contentType: asset.content_type,
          durationSeconds: null,
          altText: asset.alt_text,
          caption: asset.caption,
          isSensitive: false,
          recordedAt,
          displayOrder: value.length + index,
        })),
      ]);
      toast.success(
        uploaded.length === 1 ? "Attachment added" : "Attachments added",
      );
    } catch {
      toast.error("The attachment could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateAt(index: number, update: Partial<ReflectionAttachmentDraft>) {
    const next = value.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...update } : item,
    );
    const updated = next[index];
    if (
      updated.isSensitive &&
      String(updated.mediaAssetId) === String(coverMediaAssetId)
    ) {
      onCoverChange(null);
    }
    onChange(next);
  }

  async function saveMetadata(index: number) {
    const attachment = value[index];
    if (!attachment || attachment.isSensitive) return;

    try {
      await mediaApi.update(attachment.mediaAssetId, {
        alt_text: attachment.altText,
        caption: attachment.caption,
      });
    } catch {
      toast.error("The attachment description could not be saved.");
    }
  }

  function removeAt(index: number) {
    const removed = value[index];
    const next = value
      .filter((_, itemIndex) => itemIndex !== index)
      .map((item, displayOrder) => ({ ...item, displayOrder }));
    if (String(removed.mediaAssetId) === String(coverMediaAssetId)) {
      onCoverChange(null);
    }
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          aria-label="Choose supporting media"
          onChange={(event) => void uploadFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
          {uploading ? "Uploading…" : "Add photo, audio, video, or file"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Mark an item sensitive to keep its preview hidden by default.
        </p>
      </div>

      {value.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {value.map((attachment, index) => {
            const normalizedType = attachment.contentType.toLowerCase();
            const isImage =
              normalizedType.startsWith("image/") || normalizedType === "image";
            const isCover =
              String(attachment.mediaAssetId) === String(coverMediaAssetId);

            return (
              <article
                key={`${attachment.mediaAssetId}-${index}`}
                className="min-w-0 rounded-lg border border-border/80 bg-muted/20 p-2.5"
              >
                <SensitiveMediaPreview
                  fileUrl={attachment.fileUrl}
                  thumbnailUrl={attachment.thumbnailUrl}
                  altText={
                    attachment.isSensitive ? undefined : attachment.altText
                  }
                  contentType={attachment.contentType}
                  filename={attachment.originalFilename}
                  isSensitive={attachment.isSensitive}
                  compact
                />
                <div className="mt-2 min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    title={
                      attachment.isSensitive
                        ? undefined
                        : attachment.originalFilename
                    }
                  >
                    {attachment.isSensitive
                      ? "Sensitive attachment"
                      : attachment.originalFilename}
                  </p>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={attachment.isSensitive}
                      onChange={(event) =>
                        updateAt(index, { isSensitive: event.target.checked })
                      }
                    />
                    <Shield className="size-3.5" aria-hidden="true" />
                    Sensitive — hide preview
                  </label>
                  <label className="mt-2 block text-xs text-muted-foreground">
                    Recorded at
                    <Input
                      type="datetime-local"
                      value={attachment.recordedAt}
                      className="mt-1 h-8 text-xs"
                      onChange={(event) =>
                        updateAt(index, { recordedAt: event.target.value })
                      }
                    />
                  </label>
                  <ReflectionMediaMetadataFields
                    altText={attachment.altText}
                    caption={attachment.caption}
                    isImage={isImage}
                    isSensitive={attachment.isSensitive}
                    onAltTextChange={(altText) => updateAt(index, { altText })}
                    onCaptionChange={(caption) => updateAt(index, { caption })}
                    onSave={() => void saveMetadata(index)}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {isImage && !attachment.isSensitive ? (
                    <Button
                      type="button"
                      size="xs"
                      variant={isCover ? "soft" : "outline"}
                      onClick={() =>
                        onCoverChange(isCover ? null : attachment.mediaAssetId)
                      }
                    >
                      <Star className="size-3" />
                      {isCover ? "Cover selected" : "Use as cover"}
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
                      <ImageIcon className="size-3" />
                      Cover unavailable
                    </span>
                  )}
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="ml-auto text-destructive"
                    onClick={() => removeAt(index)}
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-muted/20 p-5 text-center">
          <Paperclip
            className="mx-auto size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium">No supporting media yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Attach only what helps you remember or understand the experience.
          </p>
        </div>
      )}
    </div>
  );
}

function toLocalDateTime(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
