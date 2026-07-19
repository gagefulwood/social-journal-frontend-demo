"use client";

import { Shield } from "lucide-react";

import { Input } from "@/components/ui/input";

type ReflectionMediaMetadataFieldsProps = {
  altText: string;
  caption: string;
  isImage: boolean;
  isSensitive: boolean;
  onAltTextChange: (value: string) => void;
  onCaptionChange: (value: string) => void;
  onSave: () => void;
};

export function ReflectionMediaMetadataFields({
  altText,
  caption,
  isImage,
  isSensitive,
  onAltTextChange,
  onCaptionChange,
  onSave,
}: ReflectionMediaMetadataFieldsProps) {
  if (isSensitive) {
    return (
      <p className="mt-2 flex items-start gap-1.5 rounded-md bg-accent/35 p-2 text-xs text-muted-foreground">
        <Shield
          className="mt-0.5 size-3.5 shrink-0 text-primary"
          aria-hidden="true"
        />
        Alt text and caption stay hidden while this attachment is sensitive.
      </p>
    );
  }

  return (
    <div className="mt-2 grid gap-2">
      {isImage ? (
        <label className="block text-xs text-muted-foreground">
          Alt text
          <Input
            value={altText}
            className="mt-1 h-8 text-xs"
            placeholder="Describe the image"
            onChange={(event) => onAltTextChange(event.target.value)}
            onBlur={onSave}
          />
        </label>
      ) : null}
      <label className="block text-xs text-muted-foreground">
        Caption
        <Input
          value={caption}
          className="mt-1 h-8 text-xs"
          placeholder="Add an optional caption"
          onChange={(event) => onCaptionChange(event.target.value)}
          onBlur={onSave}
        />
      </label>
    </div>
  );
}
