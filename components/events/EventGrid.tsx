"use client";

import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import type { ApiError } from "@/types/auth";
import type { EventListItem } from "@/types/events";

const pageSize = 24;

type EventGridProps = {
  events: EventListItem[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

export function EventGrid({
    events,
    loading,
    error,
    page,
    totalCount,
    onPageChange,
    onRetry,
}: EventGridProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg border border-border p-6">
        <p className="font-medium">Unable to load events...</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        No events found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}      