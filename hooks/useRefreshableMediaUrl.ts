"use client";

import { useRef, useState } from "react";

import { mediaApi } from "@/lib/api/mediaApi";
import { resolveMediaSourceUrl } from "@/lib/media/resolveMediaUrl";
import type { MediaAssetListItem } from "@/types/media";

type RefreshState = {
  sourceKey: string;
  url: string | null;
  status: "idle" | "refreshing" | "failed";
  revision: number;
};

/**
 * Refreshes an opaque owner-bound media URL after a native media error.
 *
 * Native image, video, and audio requests do not pass through the authenticated
 * API client. Fetching the asset metadata does, so an expired content URL can
 * be replaced after the client's normal session-refresh flow has run.
 */
export function useRefreshableMediaUrl(
  asset: MediaAssetListItem | null | undefined,
) {
  const initialUrl = resolveMediaSourceUrl(asset);
  const sourceKey = mediaSourceKey(asset, initialUrl);
  const assetId = asset?.id;
  const attemptedRequestRef = useRef<string | null>(null);
  const lastRefreshRef = useRef<{ sourceKey: string; at: number } | null>(null);
  const inFlightRequestRef = useRef<string | null>(null);
  const [state, setState] = useState<RefreshState>(() => ({
    sourceKey,
    url: initialUrl,
    status: "idle",
    revision: 0,
  }));

  const current =
    state.sourceKey === sourceKey
      ? state
      : {
          sourceKey,
          url: initialUrl,
          status: "idle" as const,
          revision: state.revision + 1,
        };

  function refreshAfterError() {
    const failedUrl = current.url;
    const requestKey = `${sourceKey}:${failedUrl ?? ""}`;
    if (inFlightRequestRef.current === requestKey) return;
    const lastRefresh = lastRefreshRef.current;

    if (
      assetId == null ||
      !failedUrl ||
      attemptedRequestRef.current === requestKey ||
      (lastRefresh?.sourceKey === sourceKey &&
        Date.now() - lastRefresh.at < 5_000)
    ) {
      setState((current) => ({
        ...current,
        sourceKey,
        url: current.sourceKey === sourceKey ? current.url : initialUrl,
        status: "failed",
      }));
      return;
    }

    attemptedRequestRef.current = requestKey;
    inFlightRequestRef.current = requestKey;
    setState((current) => ({
      ...current,
      sourceKey,
      url: current.sourceKey === sourceKey ? current.url : initialUrl,
      status: "refreshing",
    }));

    void mediaApi
      .retrieve(assetId)
      .then((freshAsset) => {
        const freshUrl = resolveMediaSourceUrl(freshAsset);
        if (!freshUrl) {
          setState((current) => ({
            ...(current.sourceKey === sourceKey
              ? { ...current, url: null, status: "failed" as const }
              : current),
          }));
          return;
        }
        setState((current) =>
          current.sourceKey === sourceKey
            ? {
                sourceKey,
                url: freshUrl,
                status: "idle",
                revision: current.revision + 1,
              }
            : current,
        );
        lastRefreshRef.current = { sourceKey, at: Date.now() };
      })
      .catch(() => {
        setState((current) =>
          current.sourceKey === sourceKey
            ? { ...current, status: "failed" }
            : current,
        );
      })
      .finally(() => {
        if (inFlightRequestRef.current === requestKey) {
          inFlightRequestRef.current = null;
        }
      });
  }

  return {
    url: current.url,
    revision: current.revision,
    isRefreshing: current.status === "refreshing",
    failed: current.status === "failed",
    refreshAfterError,
  };
}

function mediaSourceKey(
  asset: MediaAssetListItem | null | undefined,
  url: string | null,
) {
  return asset?.id == null
    ? `missing:${url ?? ""}`
    : `${asset.id}:${url ?? ""}`;
}
