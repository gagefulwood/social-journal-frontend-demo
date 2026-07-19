import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  CreateMediaAssetRequest,
  MediaAsset,
  MediaAssetListResponse,
  UpdateMediaAssetRequest,
} from "@/types/media";

export type MediaAssetListParams = {
  page?: number;
  page_size?: number;
  media_type?: ApiId;
};

export const mediaApi = {
  async list(params?: MediaAssetListParams): Promise<MediaAssetListResponse> {
    const res = await api.get<MediaAssetListResponse>("/api/media/", {
      params,
    });
    return res.data;
  },

  async upload(data: CreateMediaAssetRequest): Promise<MediaAsset> {
    const formData = new FormData();
    formData.append("file", data.file);

    if (data.media_type_id != null) {
      formData.append("media_type_id", String(data.media_type_id));
    }

    if (data.alt_text) {
      formData.append("alt_text", data.alt_text);
    }

    if (data.caption) {
      formData.append("caption", data.caption);
    }

    const res = await api.post<MediaAsset>("/api/media/", formData);
    return res.data;
  },

  async update(id: ApiId, data: UpdateMediaAssetRequest): Promise<MediaAsset> {
    const res = await api.patch<MediaAsset>(`/api/media/${id}/`, data);
    return res.data;
  },

  async remove(id: ApiId): Promise<void> {
    await api.delete(`/api/media/${id}/`);
  },
};
