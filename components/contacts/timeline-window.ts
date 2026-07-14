export const TIMELINE_EXPANDED_WINDOW_SIZE = 3;

export function nextExpandedWindowStart(
  currentStart: number,
  anchorIndex: number,
  eventCount: number,
): number {
  const maximumStart = Math.max(0, eventCount - TIMELINE_EXPANDED_WINDOW_SIZE);
  const normalizedStart = Math.max(0, Math.min(currentStart, maximumStart));
  const currentEnd = normalizedStart + TIMELINE_EXPANDED_WINDOW_SIZE - 1;

  if (anchorIndex > currentEnd) {
    return Math.min(normalizedStart + 1, maximumStart);
  }

  if (anchorIndex < normalizedStart) {
    return Math.max(normalizedStart - 1, 0);
  }

  return normalizedStart;
}

export function isTimelineIndexExpanded(
  index: number,
  start: number,
  eventCount: number,
) {
  const visibleCount = Math.min(TIMELINE_EXPANDED_WINDOW_SIZE, eventCount);
  return index >= start && index < start + visibleCount;
}
