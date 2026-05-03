"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaApi } from "@/lib/api/mediaApi";
import type { ApiError } from "@/types/auth";
import type { MediaAssetListItem } from "@/types/media";

type ProfilePictureSelectorProps = {
  current?: MediaAssetListItem | null;
  value?: string | number | null;
  onChange: (mediaId: string | number | null, asset?: MediaAssetListItem | null) => void;
};

export function ProfilePictureSelector({
  current,
  onChange,
}: ProfilePictureSelectorProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState(current ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
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
            onClick={() => inputRef.current?.click()}
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
          setError(null);

          try {
            const asset = await mediaApi.upload({ file });
            setPreview(asset);
            onChange(asset.id, asset);
          } catch (err) {
            setError((err as ApiError).message || "Upload failed.");
          } finally {
            setUploading(false);
            event.target.value = "";
          }
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
