"use client";

import { useMemo, useState } from "react";
import { Crop, Focus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import type {
  MediaAssetListItem,
  MediaCropKind,
  NormalizedMediaCrop,
} from "@/types/media";

type MediaCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceUrl: string;
  mediaAsset?: MediaAssetListItem | null;
  altText: string;
  cropKind: MediaCropKind;
  initialCrop?: NormalizedMediaCrop | null;
  initialFocalX?: number | null;
  initialFocalY?: number | null;
  saving?: boolean;
  onSave: (value: {
    focalX: number;
    focalY: number;
    crop: NormalizedMediaCrop;
  }) => void | Promise<void>;
};

export function MediaCropDialog({
  open,
  onOpenChange,
  sourceUrl,
  mediaAsset,
  altText,
  cropKind,
  initialCrop,
  initialFocalX,
  initialFocalY,
  saving = false,
  onSave,
}: MediaCropDialogProps) {
  const [focalX, setFocalX] = useState(
    initialFocalX ?? cropCenter(initialCrop, "x") ?? 0.5,
  );
  const [focalY, setFocalY] = useState(
    initialFocalY ?? cropCenter(initialCrop, "y") ?? 0.5,
  );
  const [zoom, setZoom] = useState(() => cropZoom(initialCrop));
  const [sourceSize, setSourceSize] = useState({ width: 1, height: 1 });
  const mediaSource = useRefreshableMediaUrl(mediaAsset);
  const resolvedSourceUrl = mediaAsset ? mediaSource.url : sourceUrl;
  const sourceReady =
    Boolean(resolvedSourceUrl) &&
    !mediaSource.isRefreshing &&
    !mediaSource.failed;

  const crop = useMemo(
    () =>
      buildCrop({
        cropKind,
        focalX,
        focalY,
        zoom,
        sourceWidth: sourceSize.width,
        sourceHeight: sourceSize.height,
      }),
    [cropKind, focalX, focalY, sourceSize.height, sourceSize.width, zoom],
  );
  const mobileCrop = useMemo(
    () =>
      buildCropForAspect({
        targetAspect: 4 / 3,
        focalX,
        focalY,
        zoom,
        sourceWidth: sourceSize.width,
        sourceHeight: sourceSize.height,
        cropKind,
      }),
    [cropKind, focalX, focalY, sourceSize.height, sourceSize.width, zoom],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-4 pr-14">
          <DialogTitle className="flex items-center gap-2">
            <Crop className="size-5 text-primary" aria-hidden="true" />
            Set the visible focus
          </DialogTitle>
          <DialogDescription>
            The original stays untouched. This saves a normalized crop and focal
            point for Event presentation.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="grid gap-5 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="min-w-0">
            <div className="relative mx-auto min-h-40 w-fit max-w-full overflow-hidden rounded-lg bg-muted">
              {sourceReady ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={mediaSource.revision}
                    src={resolvedSourceUrl ?? undefined}
                    alt={altText}
                    className="block h-auto max-h-[28rem] w-auto max-w-full"
                    onLoad={(event) =>
                      setSourceSize({
                        width: event.currentTarget.naturalWidth || 1,
                        height: event.currentTarget.naturalHeight || 1,
                      })
                    }
                    onError={
                      mediaAsset ? mediaSource.refreshAfterError : undefined
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/15" />
                  <div
                    className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_999px_rgb(0_0_0/0.25)]"
                    style={{
                      left: `${crop.x * 100}%`,
                      top: `${crop.y * 100}%`,
                      width: `${crop.width * 100}%`,
                      height: `${crop.height * 100}%`,
                    }}
                  >
                    <span
                      className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-sm"
                      style={{
                        left: `${((focalX - crop.x) / crop.width) * 100}%`,
                        top: `${((focalY - crop.y) / crop.height) * 100}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex min-h-40 min-w-64 items-center justify-center px-5 text-sm text-muted-foreground">
                  {mediaSource.isRefreshing
                    ? "Refreshing image…"
                    : "Image unavailable"}
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              <CropControl
                id="media-focus-x"
                label="Horizontal focus"
                value={focalX}
                onChange={setFocalX}
              />
              <CropControl
                id="media-focus-y"
                label="Vertical focus"
                value={focalY}
                onChange={setFocalY}
              />
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="media-crop-zoom">Crop size</Label>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <Slider
                  id="media-crop-zoom"
                  aria-label="Crop size"
                  min={100}
                  max={220}
                  step={1}
                  value={[Math.round(zoom * 100)]}
                  onValueChange={(value) => setZoom((value[0] ?? 100) / 100)}
                />
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-4">
            <div>
              <p className="text-sm font-medium">Primary preview</p>
              <CropPreview
                sourceUrl={resolvedSourceUrl}
                crop={crop}
                revision={mediaSource.revision}
                refreshing={mediaSource.isRefreshing}
                failed={mediaSource.failed}
                onError={mediaAsset ? mediaSource.refreshAfterError : undefined}
                className={
                  cropKind === "event_cover" ? "aspect-video" : "aspect-[4/3]"
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium">Mobile preview</p>
              <CropPreview
                sourceUrl={resolvedSourceUrl}
                crop={mobileCrop}
                revision={mediaSource.revision}
                refreshing={mediaSource.isRefreshing}
                failed={mediaSource.failed}
                onError={mediaAsset ? mediaSource.refreshAfterError : undefined}
                className="aspect-[4/3]"
              />
            </div>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Focus className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Narrow renditions derive from the saved focal point; the source
              file is never overwritten.
            </p>
          </aside>
        </DialogBody>

        <DialogFooter className="border-t border-border px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || !sourceReady}
            onClick={() =>
              void onSave({
                focalX: roundNormalized(focalX),
                focalY: roundNormalized(focalY),
                crop,
              })
            }
          >
            {saving ? "Saving…" : "Save crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CropPreview({
  sourceUrl,
  crop,
  className,
  revision,
  refreshing,
  failed,
  onError,
}: {
  sourceUrl: string | null;
  crop: NormalizedMediaCrop;
  className: string;
  revision: number;
  refreshing: boolean;
  failed: boolean;
  onError?: () => void;
}) {
  return (
    <div
      className={`relative mt-2 overflow-hidden rounded-md border border-border bg-muted ${className}`}
    >
      {sourceUrl && !refreshing && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={revision}
          src={sourceUrl}
          alt=""
          className="absolute max-w-none"
          style={{
            width: `${100 / crop.width}%`,
            height: `${100 / crop.height}%`,
            left: `${(-crop.x / crop.width) * 100}%`,
            top: `${(-crop.y / crop.height) * 100}%`,
          }}
          onError={onError}
        />
      ) : (
        <span className="flex size-full items-center justify-center px-3 text-center text-xs text-muted-foreground">
          {refreshing ? "Refreshing preview…" : "Preview unavailable"}
        </span>
      )}
    </div>
  );
}

function CropControl({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {Math.round(value * 100)}%
        </span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        min={0}
        max={100}
        step={1}
        value={[Math.round(value * 100)]}
        onValueChange={(next) => onChange((next[0] ?? 50) / 100)}
      />
    </div>
  );
}

function buildCrop({
  cropKind,
  focalX,
  focalY,
  zoom,
  sourceWidth,
  sourceHeight,
}: {
  cropKind: MediaCropKind;
  focalX: number;
  focalY: number;
  zoom: number;
  sourceWidth: number;
  sourceHeight: number;
}): NormalizedMediaCrop {
  const targetAspect = cropKind === "event_cover" ? 16 / 9 : 4 / 3;
  return buildCropForAspect({
    cropKind,
    targetAspect,
    focalX,
    focalY,
    zoom,
    sourceWidth,
    sourceHeight,
  });
}

function buildCropForAspect({
  cropKind,
  targetAspect,
  focalX,
  focalY,
  zoom,
  sourceWidth,
  sourceHeight,
}: {
  cropKind: MediaCropKind;
  targetAspect: number;
  focalX: number;
  focalY: number;
  zoom: number;
  sourceWidth: number;
  sourceHeight: number;
}): NormalizedMediaCrop {
  const sourceAspect = sourceWidth / Math.max(1, sourceHeight);
  const normalizedRatio = targetAspect / sourceAspect;
  const baseWidth = normalizedRatio <= 1 ? normalizedRatio : 1;
  const baseHeight = normalizedRatio <= 1 ? 1 : 1 / normalizedRatio;
  const width = roundNormalized(clamp(baseWidth / zoom, 0.05, 1));
  const height = roundNormalized(clamp(baseHeight / zoom, 0.05, 1));
  const x = Math.min(
    roundNormalized(clamp(focalX - width / 2, 0, 1 - width)),
    roundNormalized(1 - width),
  );
  const y = Math.min(
    roundNormalized(clamp(focalY - height / 2, 0, 1 - height)),
    roundNormalized(1 - height),
  );

  return { crop_kind: cropKind, x, y, width, height };
}

function cropCenter(
  crop: NormalizedMediaCrop | null | undefined,
  axis: "x" | "y",
) {
  if (!crop) return null;
  return axis === "x" ? crop.x + crop.width / 2 : crop.y + crop.height / 2;
}

function cropZoom(crop: NormalizedMediaCrop | null | undefined) {
  if (!crop) return 1;
  return clamp(1 / Math.max(crop.width, crop.height), 1, 2.2);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundNormalized(value: number) {
  return Math.round(clamp(value, 0, 1) * 100_000) / 100_000;
}
