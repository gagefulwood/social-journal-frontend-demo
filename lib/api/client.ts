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

function isFieldErrors(value: unknown): value is FieldErrors {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) => Array.isArray(item) && item.every((entry) => typeof entry === "string")
  );
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

  if (isFieldErrors(data)) {
    return {
      status,
      message: "Please check the highlighted fields.",
      fieldErrors: data,
    };
  }

  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      return {
        status,
        message: detail,
      };
    }
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
  }
);

export default api;
export { normalizeError };
