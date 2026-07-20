import api from "@/lib/api/client";
import type { ApiId } from "@/types/api";
import type {
  CreateMediaAssetRequest,
  MediaAsset,
  MediaAssetListResponse,
  MediaCapabilities,
  UploadMediaOptions,
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

  async retrieve(id: ApiId): Promise<MediaAsset> {
    const response = await api.get<MediaAsset>(`/api/media/${id}/`);
    return response.data;
  },

  async capabilities(): Promise<MediaCapabilities> {
    const response = await api.get<MediaCapabilities>(
      "/api/media/capabilities/",
    );
    return response.data;
  },

  async upload(
    data: CreateMediaAssetRequest,
    options: UploadMediaOptions = {},
  ): Promise<MediaAsset> {
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

    const res = await api.post<MediaAsset>("/api/media/", formData, {
      signal: options.signal,
      headers: options.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : undefined,
      onUploadProgress: (event) => {
        if (!options.onProgress) return;
        const total = event.total ?? data.file.size;
        options.onProgress({
          loaded: event.loaded,
          total,
          percent: total > 0 ? Math.min(100, (event.loaded / total) * 100) : 0,
        });
      },
    });
    return res.data;
  },

  async cancelUpload(idempotencyKey: string): Promise<void> {
    await api.delete("/api/media/uploads/cancel/", {
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  cancelUploadOnPageExit(idempotencyKey: string): void {
    if (typeof window === "undefined") return;
    const endpoint = mediaEndpointUrl("/api/media/uploads/cancel/");
    const body = new URLSearchParams({ idempotency_key: idempotencyKey });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      if (navigator.sendBeacon(endpoint, body)) return;
    }
    void fetch(endpoint, {
      method: "POST",
      body,
      credentials: "include",
      keepalive: true,
    }).catch(() => undefined);
  },

  async update(id: ApiId, data: UpdateMediaAssetRequest): Promise<MediaAsset> {
    const res = await api.patch<MediaAsset>(`/api/media/${id}/`, data);
    return res.data;
  },

  async remove(id: ApiId): Promise<void> {
    await api.delete(`/api/media/${id}/`);
  },
};

function mediaEndpointUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) return path;
  try {
    return new URL(path, base.endsWith("/") ? base : `${base}/`).toString();
  } catch {
    return path;
  }
}
