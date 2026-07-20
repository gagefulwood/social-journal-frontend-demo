import { Headphones, Images, Plus, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EventMediaSummary as EventMediaSummaryDTO } from "@/types/events";

type EventMediaSummaryProps = {
  summary: EventMediaSummaryDTO | null | undefined;
  onAddMedia: () => void;
  onViewCollection: () => void;
};

export function EventMediaSummary({
  summary,
  onAddMedia,
  onViewCollection,
}: EventMediaSummaryProps) {
  if (!summary) {
    return (
      <section className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-xs sm:px-4">
        <p className="text-sm text-muted-foreground">
          Media totals are unavailable.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={onAddMedia}>
          <Plus aria-hidden="true" />
          Add media
        </Button>
      </section>
    );
  }

  const items = [
    {
      icon: Images,
      count: summary.total_count,
      label: summary.total_count === 1 ? "media item" : "media items",
    },
    {
      icon: Images,
      count: summary.image_count,
      label: summary.image_count === 1 ? "photo" : "photos",
    },
    {
      icon: Video,
      count: summary.video_count,
      label: summary.video_count === 1 ? "video" : "videos",
    },
    {
      icon: Headphones,
      count: summary.audio_count,
      label: summary.audio_count === 1 ? "audio recording" : "audio recordings",
    },
  ];

  return (
    <section
      aria-label="Event media collection summary"
      className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-3 py-2 shadow-xs sm:px-4"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm"
          >
            <Icon className="size-4 text-primary" aria-hidden="true" />
            <span className="font-medium text-foreground tabular-nums">
              {item.count}
            </span>{" "}
            {item.label}
          </span>
        );
      })}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="ml-auto"
        onClick={summary.total_count > 0 ? onViewCollection : onAddMedia}
      >
        {summary.total_count > 0 ? "View collection" : "Add media"}
        {summary.total_count === 0 && <Plus aria-hidden="true" />}
      </Button>
    </section>
  );
}
