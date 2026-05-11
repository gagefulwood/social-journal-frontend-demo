"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/types/auth";
import type { CombinedJournalFeedItem } from "@/types/journals";

const pageSize = 24;

type JournalFeedGridProps = {
  entries: CombinedJournalFeedItem[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

export function JournalFeedGrid({
  entries,
  loading,
  error,
  page,
  totalCount,
  onPageChange,
  onRetry,
}: JournalFeedGridProps) {
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
        <p className="font-medium">Unable to load journals...</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        No journal entries found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <JournalFeedCard key={`${entry.kind}-${entry.id}`} entry={entry} />
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

function JournalFeedCard({ entry }: { entry: CombinedJournalFeedItem }) {
  const date = new Date(entry.created_timestamp);
  const detailPath = `/journals/${entry.kind}s/${entry.id}`;

  return (
    <Link
      href={detailPath}
      className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs transition hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex min-h-32 flex-col justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 truncate text-base font-semibold">
              {entry.label}
            </h2>
            <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
              {entry.kind}
            </span>
          </div>

          {!Number.isNaN(date.getTime()) && (
            <p className="truncate text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">Event {entry.event}</p>
      </div>
    </Link>
  );
}
