"use client";

import { useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  EventCard,
  type EventCardVariant,
} from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { isDrfInvalidPageError } from "@/lib/api/errorGuards";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/auth";
import type { EventListItem } from "@/types/events";

type EventGridProps = {
  events: EventListItem[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  pageSize: number;
  totalCount: number;
  display?: "grid" | "list";
  emptyState?: ReactNode;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

export function EventGrid({
  events,
  loading,
  error,
  page,
  pageSize,
  totalCount,
  display = "grid",
  emptyState,
  onPageChange,
  onRetry,
}: EventGridProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const recoveringInvalidPage =
    page > 1 && isDrfInvalidPageError(error) && !loading;

  useEffect(() => {
    if (recoveringInvalidPage) {
      onPageChange(1);
      return;
    }

    if (!loading && !error && totalCount > 0 && page > totalPages) {
      onPageChange(totalPages);
    }
  }, [
    error,
    loading,
    onPageChange,
    page,
    recoveringInvalidPage,
    totalCount,
    totalPages,
  ]);

  if (loading || recoveringInvalidPage) {
    return <EventGridSkeleton display={display} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-6">
        <p className="font-medium text-foreground">Unable to load events</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      emptyState ?? (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          No events found.
        </div>
      )
    );
  }

  const cardVariant: EventCardVariant = display === "grid" ? "grid" : "list";

  return (
    <div className="space-y-5">
      <div
        className={cn(
          display === "grid"
            ? "grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            : "grid min-w-0 gap-3",
        )}
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} variant={cardVariant} />
        ))}
      </div>
      <EventPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export function EventPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const normalizedPage = Math.min(page, totalPages);
  const rangeStart = totalCount === 0 ? 0 : (normalizedPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(normalizedPage * pageSize, totalCount);

  useEffect(() => {
    if (totalCount > 0 && page > totalPages) {
      onPageChange(totalPages);
    }
  }, [onPageChange, page, totalCount, totalPages]);

  if (totalCount === 0) {
    return null;
  }

  const pageItems = paginationItems(normalizedPage, totalPages);

  return (
    <nav
      aria-label="Event pages"
      className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {rangeStart}–{rangeEnd} of {totalCount} · Page {normalizedPage}{" "}
        of {totalPages}
      </p>

      <div className="flex min-w-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={normalizedPage <= 1}
          onClick={() => onPageChange(normalizedPage - 1)}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === normalizedPage ? "soft" : "ghost"}
              size="icon-sm"
              aria-label={`Page ${item}`}
              aria-current={item === normalizedPage ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={normalizedPage >= totalPages}
          onClick={() => onPageChange(normalizedPage + 1)}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}

function EventGridSkeleton({ display }: { display: "grid" | "list" }) {
  return (
    <div
      aria-label="Loading events"
      className={cn(
        display === "grid"
          ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          : "grid gap-3",
      )}
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "animate-pulse rounded-lg border border-border bg-muted motion-reduce:animate-none",
            display === "grid" ? "h-72" : "h-28",
          )}
        />
      ))}
    </div>
  );
}

function paginationItems(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const ordered = [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((left, right) => left - right);
  const items: Array<number | "ellipsis"> = [];

  ordered.forEach((value, index) => {
    const previous = ordered[index - 1];
    if (previous != null && value - previous > 1) {
      items.push("ellipsis");
    }
    items.push(value);
  });

  return items;
}
