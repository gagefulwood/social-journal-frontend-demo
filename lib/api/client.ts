import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthMetadata } from "@/lib/auth/auth-utils";
import type { ApiError, FieldErrors } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_PATH = "/api/auth/token/refresh/";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function isRefreshRequest(config?: InternalAxiosRequestConfig) {
  return Boolean(config?.url?.includes(REFRESH_PATH));
}

function normalizeFieldErrors(value: unknown): FieldErrors | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const normalizedEntries: Array<[string, string[]]> = [];
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") {
      normalizedEntries.push([key, [item]]);
      continue;
    }
    if (
      Array.isArray(item) &&
      item.every((entry) => typeof entry === "string")
    ) {
      normalizedEntries.push([key, item]);
      continue;
    }
    return null;
  }

  return normalizedEntries.length > 0
    ? Object.fromEntries(normalizedEntries)
    : null;
}

function firstErrorMessage(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstErrorMessage(item);
      if (message) return message;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const message = firstErrorMessage(item);
      if (message) return message;
    }
  }
  return null;
}

function findStringArray(value: unknown, key: string): string[] {
  if (!value || typeof value !== "object") return [];
  if (!Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const candidate = record[key];
    if (
      Array.isArray(candidate) &&
      candidate.every(
        (item) => typeof item === "string" || typeof item === "number",
      )
    ) {
      return candidate.map(String);
    }
    for (const item of Object.values(record)) {
      const nested = findStringArray(item, key);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function normalizeError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return {
      status: null,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  const axiosError = error as AxiosError;
  const data = axiosError.response?.data;
  const status = axiosError.response?.status ?? null;

  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      return {
        status,
        message: detail,
      };
    }
    const nestedFieldErrors = normalizeFieldErrors(detail);
    const nestedMessage = firstErrorMessage(detail);
    if (nestedMessage) {
      return {
        status,
        message: nestedMessage,
        ...(nestedFieldErrors ? { fieldErrors: nestedFieldErrors } : {}),
      };
    }
  }

  const fieldErrors = normalizeFieldErrors(data);
  if (fieldErrors) {
    return {
      status,
      message:
        firstErrorMessage(fieldErrors) ||
        "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const nestedMessage = firstErrorMessage(data);
  if (nestedMessage) {
    const chapterIds = findStringArray(data, "chapter_ids");
    return {
      status,
      message:
        chapterIds.length > 0
          ? `${nestedMessage} Affected chapters: ${chapterIds.join(", ")}.`
          : nestedMessage,
    };
  }

  return {
    status,
    message: axiosError.message || "Something went wrong.",
  };
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest)
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(`${API_URL}${REFRESH_PATH}`, undefined, {
          withCredentials: true,
        });
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthMetadata();

        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export default api;
export { normalizeError };
