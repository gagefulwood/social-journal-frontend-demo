import type { ApiError } from "@/types/auth";

const INVALID_PAGE_MESSAGE = /^invalid page\.?$/i;

export function isDrfInvalidPageError(error: ApiError | null | undefined) {
  return (
    error?.status === 404 && INVALID_PAGE_MESSAGE.test(error.message.trim())
  );
}
