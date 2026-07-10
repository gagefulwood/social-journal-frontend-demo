"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaApi } from "@/lib/api/mediaApi";
import type { ApiError } from "@/types/auth";
import type { MediaAssetListItem } from "@/types/media";

type ProfilePictureSelectorProps = {
  current?: MediaAssetListItem | null;
  error?: string;
  fallbackInitials?: string;
  onChange: (mediaId: string | number | null, asset?: MediaAssetListItem | null) => void;
  variant?: "default" | "create";
};

export function ProfilePictureSelector({
  current,
  error: fieldError,
  fallbackInitials = "",
  onChange,
  variant = "default",
}: ProfilePictureSelectorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(current ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const error = uploadError || fieldError;
  const hasInitials = fallbackInitials.trim().length > 0;

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      {variant === "create" ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            aria-label={preview ? "Change profile photo" : "Upload a profile photo"}
            aria-describedby={error ? "profile-picture-error" : undefined}
            disabled={uploading}
            onClick={openFilePicker}
            className="group relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-primary-soft bg-accent text-accent-foreground outline-none transition-colors hover:bg-primary-soft focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
          >
            {preview?.url ? (
              <div
                role="img"
                aria-label={preview.alt_text || "Selected profile photo"}
                className="size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${preview.url})` }}
              />
            ) : hasInitials ? (
              <span className="text-xl font-semibold" aria-hidden="true">
                {fallbackInitials}
              </span>
            ) : (
              <Camera className="size-6" aria-hidden="true" />
            )}
          </button>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={openFilePicker}
            >
              <Upload className="size-4" />
              {uploading ? "Uploading..." : "Upload photo"}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  onChange(null, null);
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="size-20 overflow-hidden rounded-lg bg-muted">
            {preview?.url ? (
              <div
                role="img"
                aria-label={preview.alt_text || "Profile picture"}
                className="size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${preview.url})` }}
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                Photo
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={openFilePicker}
            >
              <Upload className="size-4" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPreview(null);
                  onChange(null, null);
                }}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }

          setUploading(true);
          setUploadError(null);

          try {
            const asset = await mediaApi.upload({ file });
            setPreview(asset);
            onChange(asset.id, asset);
          } catch (err) {
            setUploadError((err as ApiError).message || "Upload failed.");
          } finally {
            setUploading(false);
            event.target.value = "";
          }
        }}
      />
      {error && (
        <p id="profile-picture-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
