import type { ApiId, PaginatedResponse } from "@/types/api";
import type { MediaType } from "@/types/lookups";

export type MediaAssetListItem = {
  id: ApiId;
  url: string;
  media_type: MediaType | null;
  original_filename: string;
  content_type: string;
  file_size: number;
  alt_text: string;
  caption: string;
  created_timestamp: string;
};

export type MediaAsset = MediaAssetListItem & {
  file: string;
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
> & {
  media_type_id?: ApiId | null;
};

export type MediaAssetListResponse = PaginatedResponse<MediaAssetListItem>;
