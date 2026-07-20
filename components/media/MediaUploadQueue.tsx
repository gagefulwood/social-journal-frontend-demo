"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { AlertCircle, ImagePlus, Loader2, RotateCcw } from "lucide-react";

import { MediaCropDialog } from "@/components/media/MediaCropDialog";
import { MediaTile, type MediaTileState } from "@/components/media/MediaTile";
import {
  getMediaAltText,
  getMediaFilename,
  getMediaKind,
  getMediaPreviewUrl,
  getMediaUrl,
} from "@/components/media/media-utils";
import { Button } from "@/components/ui/button";
import { eventsApi } from "@/lib/api/eventsApi";
import { mediaApi } from "@/lib/api/mediaApi";
import type { ApiError } from "@/types/auth";
import type { ApiId } from "@/types/api";
import type { EventMediaAttachment } from "@/types/events";
import type {
  MediaCapabilities,
  MediaCropKind,
  MediaKind,
} from "@/types/media";

type UploadQueueItem = {
  id: string;
  file: File;
  name: string;
  kind: MediaKind;
  previewUrl: string | null;
  idempotencyKey: string;
  state: MediaTileState;
  progress: number;
  altText: string;
  decorative: boolean;
  preflightError: string | null;
  error: string | null;
  controller: AbortController | null;
  cancelling: boolean;
  serverSessionCreated: boolean;
};

type SharedUploadJob = {
  id: number;
  concurrency: number;
  run: () => Promise<void>;
};

const sharedUploadJobs: SharedUploadJob[] = [];
const activeSharedUploadJobs = new Map<number, number>();
let nextSharedUploadJobId = 1;

function runWithSharedUploadPermit<T>(
  concurrency: number,
  task: () => Promise<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const job: SharedUploadJob = {
      id: nextSharedUploadJobId++,
      concurrency: Math.max(1, concurrency),
      run: async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        }
      },
    };
    sharedUploadJobs.push(job);
    pumpSharedUploads();
  });
}

function pumpSharedUploads() {
  const advertisedLimits = [
    ...activeSharedUploadJobs.values(),
    ...sharedUploadJobs.map((job) => job.concurrency),
  ];
  const effectiveLimit = Math.max(
    1,
    advertisedLimits.length > 0 ? Math.min(...advertisedLimits) : 1,
  );

  while (
    activeSharedUploadJobs.size < effectiveLimit &&
    sharedUploadJobs.length > 0
  ) {
    const job = sharedUploadJobs.shift();
    if (!job) return;
    activeSharedUploadJobs.set(job.id, job.concurrency);
    void job.run().finally(() => {
      activeSharedUploadJobs.delete(job.id);
      pumpSharedUploads();
    });
  }
}

type MediaUploadQueueProps = {
  eventId: ApiId;
  chapterId?: ApiId | null;
  eventAssetCount?: number;
  attachments?: EventMediaAttachment[];
  onAttachmentsChange?: (attachments: EventMediaAttachment[]) => void;
  triggerLabel?: string;
  className?: string;
};

export function MediaUploadQueue({
  eventId,
  chapterId = null,
  eventAssetCount,
  attachments = [],
  onAttachmentsChange,
  triggerLabel = "Add photo, video, or audio",
  className,
}: MediaUploadQueueProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef(attachments);
  const queueRef = useRef<UploadQueueItem[]>([]);
  const waitingUploadsRef = useRef<UploadQueueItem[]>([]);
  const scheduledUploadIdsRef = useRef(new Set<string>());
  const cancelledUploadIdsRef = useRef(new Set<string>());
  const confirmedCancellationIdsRef = useRef(new Set<string>());
  const cancellationRequestsRef = useRef(new Map<string, Promise<void>>());
  const activeUploadCountRef = useRef(0);
  const [capabilities, setCapabilities] = useState<MediaCapabilities | null>(
    null,
  );
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(true);
  const [capabilitiesError, setCapabilitiesError] = useState<string | null>(
    null,
  );
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [cropTarget, setCropTarget] = useState<EventMediaAttachment | null>(
    null,
  );
  const [cropSaving, setCropSaving] = useState(false);
  const [coverSavingId, setCoverSavingId] = useState<ApiId | null>(null);
  const [mediaActionError, setMediaActionError] = useState<string | null>(null);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    let active = true;
    void mediaApi
      .capabilities()
      .then((response) => {
        if (active) setCapabilities(response);
      })
      .catch((error) => {
        if (active) {
          setCapabilitiesError(
            apiErrorMessage(
              error,
              "Upload capabilities are unavailable. Try again.",
            ),
          );
        }
      })
      .finally(() => {
        if (active) setCapabilitiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cancelledUploadIds = cancelledUploadIdsRef.current;
    const scheduledUploadIds = scheduledUploadIdsRef.current;
    const cancelOutstandingUploads = () => {
      for (const item of queueRef.current) {
        if (
          scheduledUploadIds.has(item.id) ||
          item.serverSessionCreated ||
          item.state === "uploading" ||
          item.state === "processing"
        ) {
          void mediaApi
            .cancelUpload(item.idempotencyKey)
            .catch(() => undefined);
          mediaApi.cancelUploadOnPageExit(item.idempotencyKey);
        }
      }
    };

    window.addEventListener("pagehide", cancelOutstandingUploads);
    return () => {
      window.removeEventListener("pagehide", cancelOutstandingUploads);
      cancelOutstandingUploads();
      for (const item of queueRef.current) {
        cancelledUploadIds.add(item.id);
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        item.controller?.abort();
      }
      waitingUploadsRef.current = [];
      scheduledUploadIds.clear();
    };
  }, []);

  const acceptedTypes = useMemo(
    () => (capabilities ? acceptedContentTypes(capabilities) : []),
    [capabilities],
  );
  const accept = acceptedTypes.join(",");

  async function reloadCapabilities() {
    setCapabilitiesLoading(true);
    setCapabilitiesError(null);
    try {
      setCapabilities(await mediaApi.capabilities());
    } catch (error) {
      setCapabilitiesError(
        apiErrorMessage(
          error,
          "Upload capabilities are unavailable. Try again.",
        ),
      );
    } finally {
      setCapabilitiesLoading(false);
    }
  }

  function chooseFiles() {
    if (!capabilities || capabilitiesError) return;
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length || !capabilities) return;
    const selected = Array.from(files);
    const pendingCount = queueRef.current.filter((item) =>
      ["queued", "uploading", "processing"].includes(item.state),
    ).length;
    const availableSlots = remainingAssetSlots(
      capabilities,
      chapterId,
      attachments.length + pendingCount,
      (eventAssetCount ?? attachments.length) + pendingCount,
    );
    const candidates =
      availableSlots == null ? selected : selected.slice(0, availableSlots);
    const rejectedForCount = selected.length - candidates.length;
    const items = candidates.map((file) => createQueueItem(file, capabilities));
    if (rejectedForCount > 0) {
      items.push({
        ...createQueueItem(selected[candidates.length], capabilities),
        state: "failed",
        preflightError: `The server allows ${availableSlots === 0 ? "no more" : `only ${availableSlots} more`} ${chapterId == null ? "Event" : "chapter"} media ${availableSlots === 1 ? "item" : "items"}.`,
        error: `The server allows ${availableSlots === 0 ? "no more" : `only ${availableSlots} more`} ${chapterId == null ? "Event" : "chapter"} media ${availableSlots === 1 ? "item" : "items"}.`,
      });
    }
    setQueue((current) => [...current, ...items]);
    void uploadItems(
      items.filter((item) => item.state === "queued" && item.kind !== "image"),
    );
  }

  function uploadItems(items: UploadQueueItem[]) {
    for (const item of items) {
      if (scheduledUploadIdsRef.current.has(item.id)) continue;
      cancelledUploadIdsRef.current.delete(item.id);
      scheduledUploadIdsRef.current.add(item.id);
      waitingUploadsRef.current.push(item);
    }
    pumpUploads();
  }

  function pumpUploads() {
    const concurrency = Math.max(
      1,
      capabilities?.limits.concurrent_uploads ?? 1,
    );
    while (
      activeUploadCountRef.current < concurrency &&
      waitingUploadsRef.current.length > 0
    ) {
      const item = waitingUploadsRef.current.shift();
      if (!item) return;
      activeUploadCountRef.current += 1;
      void runWithSharedUploadPermit(concurrency, () => uploadOne(item))
        .catch(() => undefined)
        .finally(() => {
          activeUploadCountRef.current -= 1;
          scheduledUploadIdsRef.current.delete(item.id);
          pumpUploads();
        });
    }
  }

  async function uploadOne(item: UploadQueueItem) {
    if (item.preflightError || cancelledUploadIdsRef.current.has(item.id)) {
      return;
    }
    if (item.kind === "image" && !item.decorative && !item.altText.trim()) {
      updateQueueItem(item.id, {
        error: "Add an image description or mark the image decorative.",
      });
      return;
    }
    const controller = new AbortController();
    updateQueueItem(item.id, {
      state: "uploading",
      progress: 0,
      error: null,
      controller,
      serverSessionCreated: true,
    });

    try {
      const asset = await mediaApi.upload(
        {
          file: item.file,
          alt_text:
            item.kind === "image" && !item.decorative
              ? item.altText.trim()
              : undefined,
        },
        {
          signal: controller.signal,
          idempotencyKey: item.idempotencyKey,
          onProgress: ({ percent }) =>
            updateQueueItem(item.id, { progress: percent }),
        },
      );
      if (asset.status === "failed" || asset.status === "aborted") {
        throw new Error("The server could not safely process this file.");
      }
      if (asset.status === "pending" || asset.status === "processing") {
        updateQueueItem(item.id, {
          state: "processing",
          progress: 100,
          controller: null,
          error:
            "Processing is still in progress. Retry with the same upload key when the asset is ready.",
        });
        return;
      }
      const detectedKind = kindFromContentType(
        asset.detected_content_type ?? asset.content_type,
      );
      const effectiveKind = detectedKind === "file" ? item.kind : detectedKind;
      if (
        effectiveKind === "image" &&
        item.kind !== "image" &&
        !item.decorative &&
        !item.altText.trim()
      ) {
        updateQueueItem(item.id, {
          kind: "image",
          state: "queued",
          progress: 100,
          controller: null,
          error:
            "The server detected an image. Add a description or mark it decorative, then continue.",
        });
        return;
      }
      if (cancelledUploadIdsRef.current.has(item.id)) return;
      updateQueueItem(item.id, {
        kind: effectiveKind,
        state: "processing",
        progress: 100,
        controller: null,
        error: null,
      });

      let attachment: EventMediaAttachment;
      try {
        attachment = await eventsApi.attachMedia(eventId, {
          media_asset_id: asset.id,
          chapter_id: chapterId,
          alt_text:
            effectiveKind === "image" && !item.decorative
              ? item.altText.trim()
              : "",
          caption: asset.caption,
          decorative: effectiveKind === "image" ? item.decorative : false,
        });
      } catch (attachError) {
        // The POST may have committed even if its response was lost. Reconcile
        // by the owner-scoped asset/scope before presenting a false failure.
        const persisted = await eventsApi
          .listMedia(eventId, chapterId)
          .then((scopeMedia) =>
            scopeMedia.find(
              (candidate) =>
                String(candidate.media_asset?.id) === String(asset.id),
            ),
          )
          .catch(() => undefined);
        if (!persisted) throw attachError;
        attachment = persisted;
      }
      if (cancelledUploadIdsRef.current.has(item.id)) {
        await resolveAttachCancellation(item, attachment);
        return;
      }
      appendAttachment(attachment);
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      setQueue((current) =>
        current.filter((candidate) => candidate.id !== item.id),
      );
    } catch (error) {
      if (controller.signal.aborted) {
        if (cancelledUploadIdsRef.current.has(item.id)) {
          try {
            await (cancellationRequestsRef.current.get(item.id) ??
              requestServerCancellation(item));
            markCancellationConfirmed(item.id);
          } catch (cancellationError) {
            if (!confirmedCancellationIdsRef.current.has(item.id)) {
              updateQueueItem(item.id, {
                state: "failed",
                controller: null,
                error: apiErrorMessage(
                  cancellationError,
                  "The server could not confirm cancellation.",
                ),
                cancelling: false,
              });
            }
          }
          return;
        }
        updateQueueItem(item.id, {
          state: "processing",
          controller: null,
          error: "Confirming cancellation with the server…",
          cancelling: true,
        });
        return;
      }
      updateQueueItem(item.id, {
        state: "failed",
        controller: null,
        error: apiErrorMessage(error, "This file could not be uploaded."),
      });
      throw error;
    }
  }

  function updateQueueItem(id: string, update: Partial<UploadQueueItem>) {
    setQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...update } : item)),
    );
  }

  function appendAttachment(attachment: EventMediaAttachment) {
    const withoutDuplicate = attachmentsRef.current.filter(
      (candidate) => String(candidate.id) !== String(attachment.id),
    );
    const next = [...withoutDuplicate, attachment].sort(
      (left, right) => left.display_order - right.display_order,
    );
    attachmentsRef.current = next;
    onAttachmentsChange?.(next);
  }

  async function cancelItem(item: UploadQueueItem) {
    cancelledUploadIdsRef.current.add(item.id);
    waitingUploadsRef.current = waitingUploadsRef.current.filter(
      (candidate) => candidate.id !== item.id,
    );
    updateQueueItem(item.id, {
      state: "processing",
      error: "Confirming cancellation with the server…",
      cancelling: true,
    });
    item.controller?.abort();
    try {
      await requestServerCancellation(item);
      markCancellationConfirmed(item.id);
    } catch (error) {
      if (scheduledUploadIdsRef.current.has(item.id)) {
        updateQueueItem(item.id, {
          state: "processing",
          controller: null,
          error: "Finishing cancellation safely…",
          cancelling: true,
        });
      } else if (!confirmedCancellationIdsRef.current.has(item.id)) {
        updateQueueItem(item.id, {
          state: "failed",
          controller: null,
          error: apiErrorMessage(
            error,
            "The server could not confirm cancellation.",
          ),
          cancelling: false,
        });
      }
    }
  }

  function requestServerCancellation(item: UploadQueueItem) {
    const existing = cancellationRequestsRef.current.get(item.id);
    if (existing) return existing;
    const request = mediaApi.cancelUpload(item.idempotencyKey);
    cancellationRequestsRef.current.set(item.id, request);
    void request
      .finally(() => {
        if (cancellationRequestsRef.current.get(item.id) === request) {
          cancellationRequestsRef.current.delete(item.id);
        }
      })
      .catch(() => undefined);
    return request;
  }

  function markCancellationConfirmed(itemId: string) {
    confirmedCancellationIdsRef.current.add(itemId);
    updateQueueItem(itemId, {
      state: "cancelled",
      controller: null,
      error: null,
      cancelling: false,
    });
  }

  async function resolveAttachCancellation(
    item: UploadQueueItem,
    attachment: EventMediaAttachment,
  ) {
    try {
      await eventsApi.removeMedia(eventId, attachment.id);
    } catch (detachError) {
      appendAttachment(attachment);
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      setQueue((current) =>
        current.filter((candidate) => candidate.id !== item.id),
      );
      const detail = apiErrorMessage(
        detachError,
        "The attachment could not be removed automatically.",
      );
      setMediaActionError(
        `The upload finished before cancellation and remains attached. Remove it from the collection if you do not want it. ${detail}`,
      );
      return;
    }

    try {
      await mediaApi.cancelUpload(item.idempotencyKey);
    } catch {
      // The Event attachment is already gone. A retained, unattached original
      // remains private and is covered by the configured orphan cleanup.
    }
    markCancellationConfirmed(item.id);
  }

  function removeQueueItem(item: UploadQueueItem) {
    cancelledUploadIdsRef.current.add(item.id);
    waitingUploadsRef.current = waitingUploadsRef.current.filter(
      (candidate) => candidate.id !== item.id,
    );
    scheduledUploadIdsRef.current.delete(item.id);
    if (item.serverSessionCreated) {
      void mediaApi.cancelUpload(item.idempotencyKey).catch((error) => {
        setMediaActionError(
          apiErrorMessage(
            error,
            "The removed upload could not be cleaned up immediately. The server orphan-retention cleanup will retry safely.",
          ),
        );
      });
    }
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setQueue((current) =>
      current.filter((candidate) => candidate.id !== item.id),
    );
  }

  function startQueueItem(item: UploadQueueItem) {
    const next = { ...item, error: null };
    updateQueueItem(item.id, { error: null });
    void uploadItems([next]);
  }

  async function removeAttachment(attachment: EventMediaAttachment) {
    setMediaActionError(null);
    try {
      await eventsApi.removeMedia(eventId, attachment.id);
      const next = attachmentsRef.current.filter(
        (candidate) => String(candidate.id) !== String(attachment.id),
      );
      attachmentsRef.current = next;
      onAttachmentsChange?.(next);
    } catch (error) {
      setMediaActionError(
        apiErrorMessage(error, "This media item could not be removed."),
      );
    }
  }

  async function moveAttachment(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= attachmentsRef.current.length) return;
    setMediaActionError(null);
    try {
      const next = [...attachmentsRef.current];
      [next[index], next[target]] = [next[target], next[index]];
      const response = await eventsApi.reorderMedia(
        eventId,
        next.map((attachment) => attachment.id),
        chapterId,
      );
      attachmentsRef.current = response;
      onAttachmentsChange?.(response);
    } catch (error) {
      setMediaActionError(
        apiErrorMessage(error, "The media order could not be saved."),
      );
    }
  }

  async function saveCrop({
    focalX,
    focalY,
    crop,
  }: Parameters<ComponentProps<typeof MediaCropDialog>["onSave"]>[0]) {
    if (!cropTarget) return;
    setCropSaving(true);
    setMediaActionError(null);
    try {
      const otherCrops = (cropTarget.crops ?? []).filter(
        (candidate) => candidate.crop_kind !== crop.crop_kind,
      );
      const updated = await eventsApi.updateMedia(eventId, cropTarget.id, {
        focal_x: focalX,
        focal_y: focalY,
        crops: [...otherCrops, crop],
      });
      const next = attachmentsRef.current.map((attachment) =>
        String(attachment.id) === String(updated.id) ? updated : attachment,
      );
      attachmentsRef.current = next;
      onAttachmentsChange?.(next);
      setCropTarget(null);
    } catch (error) {
      setMediaActionError(
        apiErrorMessage(error, "The crop and focal point could not be saved."),
      );
    } finally {
      setCropSaving(false);
    }
  }

  async function setAttachmentCover(attachment: EventMediaAttachment) {
    setCoverSavingId(attachment.id);
    setMediaActionError(null);
    try {
      const updated = await eventsApi.updateMedia(eventId, attachment.id, {
        is_cover: true,
      });
      const next = attachmentsRef.current.map((candidate) =>
        String(candidate.id) === String(updated.id)
          ? updated
          : { ...candidate, is_cover: false },
      );
      attachmentsRef.current = next;
      onAttachmentsChange?.(next);
    } catch (error) {
      setMediaActionError(
        apiErrorMessage(
          error,
          `This image could not be set as the ${chapterId == null ? "Event" : "chapter"} cover.`,
        ),
      );
    } finally {
      setCoverSavingId(null);
    }
  }

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept || undefined}
          className="sr-only"
          aria-label="Choose Event media"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={
            capabilitiesLoading || !capabilities || Boolean(capabilitiesError)
          }
          onClick={chooseFiles}
        >
          {capabilitiesLoading ? (
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <ImagePlus className="size-4" aria-hidden="true" />
          )}
          {capabilitiesLoading ? "Checking upload support…" : triggerLabel}
        </Button>
        {capabilities && acceptedTypes.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {capabilitySummary(capabilities)}
          </span>
        )}
      </div>

      {capabilitiesError && (
        <div
          className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{capabilitiesError}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={capabilitiesLoading}
            onClick={() => void reloadCapabilities()}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {mediaActionError && (
        <p
          className="mt-3 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          {mediaActionError}
        </p>
      )}

      {queue.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {queue.map((item) => (
            <MediaTile
              key={item.id}
              name={item.name}
              kind={item.kind}
              previewUrl={item.previewUrl}
              state={item.state}
              progress={item.progress}
              error={item.error}
              altText={item.altText}
              decorative={item.decorative}
              metadataEditable={item.kind === "image"}
              onAltTextChange={(altText) =>
                updateQueueItem(item.id, { altText, error: null })
              }
              onDecorativeChange={(decorative) =>
                updateQueueItem(item.id, { decorative, error: null })
              }
              onStartUpload={() => startQueueItem(item)}
              onRetry={
                item.preflightError || item.cancelling
                  ? undefined
                  : () => void uploadItems([item])
              }
              onCancel={() => void cancelItem(item)}
              onRemove={() => removeQueueItem(item)}
            />
          ))}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {attachments.map((attachment, index) => (
            <MediaTile
              key={attachment.id}
              name={getMediaFilename(attachment)}
              kind={getMediaKind(attachment)}
              previewUrl={getMediaPreviewUrl(attachment)}
              mediaAsset={attachment.media_asset}
              altText={getMediaAltText(attachment)}
              canCrop={getMediaKind(attachment) === "image"}
              canSetCover={getMediaKind(attachment) === "image"}
              isCover={Boolean(attachment.is_cover)}
              settingCover={String(coverSavingId) === String(attachment.id)}
              canMovePrevious={index > 0}
              canMoveNext={index < attachments.length - 1}
              onCrop={() => setCropTarget(attachment)}
              onSetCover={() => void setAttachmentCover(attachment)}
              onMovePrevious={() => void moveAttachment(index, -1)}
              onMoveNext={() => void moveAttachment(index, 1)}
              onRemove={() => void removeAttachment(attachment)}
            />
          ))}
        </div>
      )}

      {cropTarget && getMediaUrl(cropTarget) && (
        <MediaCropDialog
          open
          onOpenChange={(open) => {
            if (!open && !cropSaving) setCropTarget(null);
          }}
          sourceUrl={getMediaUrl(cropTarget) ?? ""}
          mediaAsset={cropTarget.media_asset}
          altText={getMediaAltText(cropTarget)}
          cropKind={cropKindForScope(chapterId)}
          initialCrop={cropTarget.crops?.find(
            (crop) => crop.crop_kind === cropKindForScope(chapterId),
          )}
          initialFocalX={cropTarget.focal_x}
          initialFocalY={cropTarget.focal_y}
          saving={cropSaving}
          onSave={saveCrop}
        />
      )}
    </div>
  );
}

function createQueueItem(
  file: File,
  capabilities: MediaCapabilities,
): UploadQueueItem {
  const kind = kindFromFile(file);
  const error = validateFile(file, kind, capabilities);
  return {
    id: localId(),
    file,
    name: file.name,
    kind,
    previewUrl:
      kind === "image" || kind === "video" ? URL.createObjectURL(file) : null,
    idempotencyKey: localId(),
    state: error ? "failed" : "queued",
    progress: 0,
    altText: "",
    decorative: false,
    preflightError: error,
    error,
    controller: null,
    cancelling: false,
    serverSessionCreated: false,
  };
}

function validateFile(
  file: File,
  kind: MediaKind,
  capabilities: MediaCapabilities,
) {
  const accepted = acceptedContentTypes(capabilities);
  const claimedType = normalizeBrowserContentType(file.type);
  if (
    claimedType &&
    claimedType !== "application/octet-stream" &&
    accepted.length > 0 &&
    !matchesAcceptedType(claimedType, accepted)
  ) {
    return `${file.type || "This file type"} is not supported by the server.`;
  }
  const maxBytes =
    kind === "image"
      ? capabilities.limits.image_max_bytes
      : kind === "video"
        ? capabilities.limits.video_max_bytes
        : kind === "audio"
          ? capabilities.limits.audio_max_bytes
          : null;
  if (maxBytes != null && file.size > maxBytes) {
    return `${file.name} is larger than the server's ${formatBytes(maxBytes)} ${kind} limit.`;
  }
  return null;
}

function acceptedContentTypes(capabilities: MediaCapabilities) {
  return Array.from(
    new Set([
      ...capabilities.mime_types.image,
      ...capabilities.mime_types.video,
      ...capabilities.mime_types.audio,
    ]),
  );
}

function matchesAcceptedType(contentType: string, accepted: string[]) {
  return accepted.some(
    (candidate) =>
      candidate === contentType ||
      (candidate.endsWith("/*") &&
        contentType.startsWith(candidate.slice(0, candidate.length - 1))),
  );
}

function remainingAssetSlots(
  capabilities: MediaCapabilities,
  chapterId: ApiId | null,
  existingScopeCount: number,
  existingEventCount: number,
) {
  const eventSlots = Math.max(
    0,
    capabilities.limits.event_max_assets - existingEventCount,
  );
  if (chapterId == null) return eventSlots;
  const chapterSlots = Math.max(
    0,
    capabilities.limits.chapter_max_assets - existingScopeCount,
  );
  return Math.min(eventSlots, chapterSlots);
}

function capabilitySummary(capabilities: MediaCapabilities) {
  const kinds = ["image", "video", "audio"].filter(
    (kind) =>
      capabilities.mime_types[kind as "image" | "video" | "audio"].length > 0,
  );
  return kinds.length > 0
    ? `Server supports ${new Intl.ListFormat(undefined, { style: "long", type: "conjunction" }).format(kinds)}.`
    : "Server upload rules apply.";
}

function kindFromFile(file: File): MediaKind {
  const contentType = normalizeBrowserContentType(file.type);
  const contentTypeKind = kindFromContentType(contentType);
  if (contentTypeKind !== "file") return contentTypeKind;

  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "image";
  if (["mp4", "mov", "webm", "m4v"].includes(extension)) return "video";
  if (["mp3", "m4a", "aac", "ogg", "opus", "wav"].includes(extension)) {
    return "audio";
  }
  return "file";
}

function kindFromContentType(contentType: string): MediaKind {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "file";
}

function normalizeBrowserContentType(contentType: string) {
  const normalized = contentType.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  return (
    {
      "audio/mp3": "audio/mpeg",
      "audio/x-m4a": "audio/mp4",
      "audio/m4a": "audio/mp4",
      "audio/x-wav": "audio/wav",
      "audio/wave": "audio/wav",
      "image/jpg": "image/jpeg",
      "video/x-m4v": "video/mp4",
    }[normalized] ?? normalized
  );
}

function cropKindForScope(chapterId: ApiId | null): MediaCropKind {
  return chapterId == null ? "event_cover" : "chapter_carousel";
}

function localId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatBytes(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes >= 10 ? Math.round(megabytes) : megabytes.toFixed(1)} MiB`;
}

function apiErrorMessage(error: unknown, fallback: string) {
  return (
    (error as ApiError | undefined)?.message ||
    (error instanceof Error ? error.message : fallback)
  );
}
