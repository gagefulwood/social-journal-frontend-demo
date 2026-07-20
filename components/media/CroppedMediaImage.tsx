"use client";

import type { ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import type { NormalizedMediaCrop } from "@/types/media";

type CroppedMediaImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> & {
  src: string;
  alt: string;
  crop?: NormalizedMediaCrop | null;
  sourceWidth?: number | null;
  sourceHeight?: number | null;
  objectPosition?: string;
  cropMode?: "always" | "desktop";
};

/**
 * Renders a normalized source crop without rewriting the original image.
 *
 * The intermediate crop canvas keeps the source aspect ratio intact, then
 * covers the final responsive frame. Event covers use the focal point below
 * the desktop breakpoint because their saved 16:9 crop intentionally has a
 * separate mobile composition; chapter crops are 4:3 and apply everywhere.
 */
export function CroppedMediaImage({
  src,
  alt,
  crop,
  sourceWidth,
  sourceHeight,
  objectPosition = "50% 50%",
  cropMode = "always",
  className,
  style,
  ...imageProps
}: CroppedMediaImageProps) {
  const validCrop = normalizeCrop(crop);
  const hasSourceSize =
    typeof sourceWidth === "number" &&
    sourceWidth > 0 &&
    typeof sourceHeight === "number" &&
    sourceHeight > 0;

  if (!validCrop || !hasSourceSize) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...imageProps}
        src={src}
        alt={alt}
        className={cn("size-full object-cover", className)}
        style={{ ...style, objectPosition }}
      />
    );
  }

  if (cropMode === "desktop") {
    return (
      <span className={cn("relative block size-full", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...imageProps}
          src={src}
          alt={alt}
          className="size-full object-cover lg:hidden"
          style={{ ...style, objectPosition }}
        />
        <CropLayer
          {...imageProps}
          src={src}
          alt={alt}
          crop={validCrop}
          sourceWidth={sourceWidth}
          sourceHeight={sourceHeight}
          className="hidden lg:block"
          imageStyle={style}
        />
      </span>
    );
  }

  return (
    <span className={cn("relative block size-full", className)}>
      <CropLayer
        {...imageProps}
        src={src}
        alt={alt}
        crop={validCrop}
        sourceWidth={sourceWidth}
        sourceHeight={sourceHeight}
        imageStyle={style}
      />
    </span>
  );
}

function CropLayer({
  src,
  alt,
  crop,
  sourceWidth,
  sourceHeight,
  className,
  imageStyle,
  ...imageProps
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> & {
  src: string;
  alt: string;
  crop: NormalizedMediaCrop;
  sourceWidth: number;
  sourceHeight: number;
  imageStyle?: ImgHTMLAttributes<HTMLImageElement>["style"];
}) {
  const cropAspect = (crop.width * sourceWidth) / (crop.height * sourceHeight);
  const canvasWidthFromHeight = cropAspect * 100;

  return (
    <span
      className={cn(
        "absolute inset-0 overflow-hidden [container-type:size]",
        className,
      )}
    >
      <span
        className="absolute top-1/2 left-1/2 block -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `max(100cqw, ${canvasWidthFromHeight}cqh)`,
          aspectRatio: cropAspect,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...imageProps}
          src={src}
          alt={alt}
          className="absolute max-w-none"
          style={{
            ...imageStyle,
            width: `${100 / crop.width}%`,
            height: `${100 / crop.height}%`,
            left: `${(-crop.x / crop.width) * 100}%`,
            top: `${(-crop.y / crop.height) * 100}%`,
          }}
        />
      </span>
    </span>
  );
}

function normalizeCrop(crop: NormalizedMediaCrop | null | undefined) {
  if (!crop) return null;
  const values = [crop.x, crop.y, crop.width, crop.height];
  if (!values.every((value) => Number.isFinite(value))) return null;
  if (crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0) {
    return null;
  }
  if (crop.x + crop.width > 1.000001 || crop.y + crop.height > 1.000001) {
    return null;
  }
  return crop;
}
