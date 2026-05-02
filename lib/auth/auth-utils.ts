import { useAuthStore } from "@/store/useAuthStore";
import type { AuthMetadata } from "@/types/auth";

export function applyAuthMetadata(metadata: AuthMetadata) {
  useAuthStore.getState().setAuth(metadata);
}

export function clearAuthMetadata() {
  useAuthStore.getState().clearAuth();
}

export function getPostAuthRoute(metadata: Pick<AuthMetadata, "mfaPending">) {
  return metadata.mfaPending ? "/auth/mfa" : "/dashboard";
}
