const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

type MediaUrlSource = {
  content_url?: string | null;
  url?: string | null;
};

export function resolveMediaUrl(value: string | null | undefined) {
  const url = value?.trim();

  if (!url || ABSOLUTE_URL_PATTERN.test(url)) {
    return url || null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    return url;
  }

  try {
    const baseUrl = apiUrl.endsWith("/") ? apiUrl : `${apiUrl}/`;
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

export function resolveMediaSourceUrl(
  source: MediaUrlSource | null | undefined,
) {
  if (!source) return null;
  return resolveMediaUrl(source.content_url ?? source.url ?? null);
}
