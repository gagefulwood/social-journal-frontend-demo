import type { ApiId, PaginatedResponse } from "@/types/api";
import type { MediaType } from "@/types/lookups";

export type MediaKind = "image" | "video" | "audio" | "file";

export type MediaProcessingStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "ready"
  | "failed"
  | "aborted";

export type MediaCropKind = "event_cover" | "chapter_carousel";

export type NormalizedMediaCrop = {
  crop_kind: MediaCropKind;
  x: number;
  y: number;
  width: number;
  height: number;
  source_orientation_revision?: number;
};

export type MediaAssetListItem = {
  id: ApiId;
  url: string;
  content_url?: string | null;
  media_type: MediaType | null;
  original_filename: string;
  claimed_content_type?: string;
  content_type: string;
  detected_content_type?: string | null;
  file_size: number;
  width?: number | null;
  height?: number | null;
  pixel_count?: number | null;
  duration_ms?: number | null;
  status?: MediaProcessingStatus;
  verification_method?: string | null;
  failure_code?: string | null;
  upload_session_id?: ApiId | null;
  upload_session_status?: string | null;
  verified_timestamp?: string | null;
  alt_text: string;
  caption: string;
  created_timestamp: string;
};

export type MediaAsset = MediaAssetListItem & {
  checksum: string;
  updated_timestamp: string;
  is_active: boolean;
};

export type CreateMediaAssetRequest = {
  file: File;
  media_type_id?: ApiId | null;
  alt_text?: string;
  caption?: string;
};

export type UpdateMediaAssetRequest = Partial<
  Pick<MediaAsset, "alt_text" | "caption">
>;

export type MediaAssetListResponse = PaginatedResponse<MediaAssetListItem>;

export type MediaCapabilities = {
  upload: {
    strategy: "direct_api" | string;
    endpoint: string;
    multipart_field: string;
    files_per_request: number;
    idempotency_header: string;
    idempotency_supported: boolean;
    http_progress_supported: boolean;
    request_cancellation_supported: boolean;
    cancel_endpoint: string;
    cancel_idempotency_header: string;
    cancel_beacon_supported: boolean;
    resumable_upload_supported: boolean;
    provider_multipart_supported: boolean;
  };
  mime_types: {
    image: string[];
    video: string[];
    audio: string[];
  };
  limits: {
    image_max_bytes: number;
    video_max_bytes: number;
    audio_max_bytes: number;
    video_max_duration_seconds: number;
    video_max_width: number;
    video_max_height: number;
    audio_max_duration_seconds: number;
    image_max_pixels: number;
    image_max_edge: number;
    chapter_max_assets: number;
    event_max_assets: number;
    chapter_original_bytes_max: number;
    event_original_bytes_max: number;
    owner_storage_quota_bytes: number;
    owner_max_assets: number | null;
    concurrent_uploads: number;
    upload_session_expiry_seconds: number;
  };
  verification: {
    actual_bytes_verified: boolean;
    checksum: string;
    image_full_decode: boolean;
    container_signature_validation: boolean;
    duration_probe: boolean;
    ffprobe: boolean;
    mime_library: boolean;
  };
  processing: {
    asynchronous_worker: boolean;
    transcoding: boolean;
    variants: boolean;
    posters: boolean;
    metadata_stripping: boolean;
  };
  delivery: {
    authenticated_content_endpoint: boolean;
    signed_content_urls: boolean;
    signed_url_expiry_seconds: number;
    range_requests: boolean;
    head_requests: boolean;
    nonlocal_private_redirect: boolean;
    public_storage_paths: boolean;
  };
};

export type MediaUploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadMediaOptions = {
  signal?: AbortSignal;
  idempotencyKey?: string;
  onProgress?: (progress: MediaUploadProgress) => void;
};
