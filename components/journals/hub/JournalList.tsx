"use client";

import Link from "next/link";
import {
  CalendarDays,
  MoreHorizontal,
  Paperclip,
  Pencil,
  UsersRound,
} from "lucide-react";

import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { JournalStatusIndicator } from "@/components/presentation/JournalStatusIndicator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getJournalClassificationPresentation,
  getJournalStatusPresentation,
} from "@/lib/presentation/journalPresentation";
import type { ApiError } from "@/types/auth";
import type { JournalListItem } from "@/types/journals";

import {
  clampPercent,
  formatJournalDate,
  getJournalEditHref,
  getJournalHref,
  getJournalResumeHref,
  wasEditedAfterCompletion,
  type JournalHubView,
} from "@/components/journals/hub/journalHubUtils";

type JournalListProps = {
  entries: JournalListItem[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  totalCount: number;
  pageSize: number;
  view: JournalHubView;
  hasFilters: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onClearFilters: () => void;
  onCreate: () => void;
};

export function JournalList({
  entries,
  loading,
  error,
  page,
  totalCount,
  pageSize,
  view,
  hasFilters,
  onPageChange,
  onRetry,
  onClearFilters,
  onCreate,
}: JournalListProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const heading = view === "drafts" ? "Saved drafts" : "Recent journals";

  return (
    <section aria-labelledby="journal-list-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h2 id="journal-list-heading" className="text-base font-semibold">
            {heading}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading
              ? "Loading your journals…"
              : `${totalCount} ${totalCount === 1 ? "entry" : "entries"}`}
          </p>
        </div>
      </div>

      {loading ? (
        <JournalListSkeleton />
      ) : error ? (
        <div className="p-4 sm:p-5">
          <EmptyActionBox
            title="Unable to load journals"
            copy={error.message}
            action={
              <Button type="button" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            }
          />
        </div>
      ) : entries.length === 0 ? (
        <div className="p-4 sm:p-5">
          <EmptyActionBox
            icon={
              <IconBadge tone="accent">
                <Pencil aria-hidden="true" />
              </IconBadge>
            }
            title={emptyTitle(view, hasFilters)}
            copy={emptyCopy(view, hasFilters)}
            action={
              hasFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClearFilters}
                >
                  Clear filters
                </Button>
              ) : (
                <Button type="button" onClick={onCreate}>
                  New journal
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/70">
            {entries.map((entry) => (
              <JournalListRow
                key={`${entry.family}-${entry.id}`}
                entry={entry}
              />
            ))}
          </div>

          <nav
            aria-label="Journal pagination"
            className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </nav>
        </>
      )}
    </section>
  );
}

function JournalListRow({ entry }: { entry: JournalListItem }) {
  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation(entry.family, entry.format);
  const statusPresentation = getJournalStatusPresentation(entry.status);
  const href =
    entry.status === "draft"
      ? getJournalResumeHref(entry)
      : getJournalHref(entry);
  const date =
    entry.occurred_at ?? entry.completed_at ?? entry.updated_timestamp;
  const progress = clampPercent(entry.progress.percent);

  return (
    <article className="grid min-w-0 gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
      <JournalIconTile presentation={primaryPresentation} />

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <JournalSemanticChip
            presentation={familyPresentation}
            size="compact"
            showIcon={false}
          />
          {formatPresentation && (
            <JournalSemanticChip
              presentation={formatPresentation}
              size="compact"
              showIcon={false}
            />
          )}
          {entry.status === "draft" && (
            <JournalStatusIndicator
              presentation={statusPresentation}
              size="compact"
            />
          )}
        </div>

        <h3 className="mt-2 max-w-3xl font-semibold leading-5">
          <Link
            href={href}
            className="line-clamp-2 rounded-sm outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {entry.title || `Untitled ${primaryPresentation.label}`}
          </Link>
        </h3>

        {entry.summary && (
          <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-5 text-muted-foreground">
            {entry.summary}
          </p>
        )}

        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{formatJournalDate(date)}</span>
          {entry.primary_contact && (
            <Link
              href={`/contacts/${entry.primary_contact.id}`}
              title={entry.primary_contact.display_name}
              className="inline-flex max-w-48 items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <UsersRound className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {entry.primary_contact.display_name}
              </span>
            </Link>
          )}
          {entry.event && (
            <Link
              href={`/events/${entry.event.id}`}
              title={entry.event.title}
              className="inline-flex max-w-56 items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{entry.event.title}</span>
            </Link>
          )}
          {entry.media_count > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3.5" aria-hidden="true" />
              {entry.media_count} {entry.media_count === 1 ? "file" : "files"}
            </span>
          )}
        </div>

        {entry.status === "draft" && (
          <div className="mt-3 flex max-w-sm items-center gap-2">
            <div
              role="progressbar"
              aria-label={`${primaryPresentation.label} draft progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {progress}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="text-right text-xs text-muted-foreground">
          {entry.status === "draft" ? (
            <p>Updated {formatJournalDate(entry.updated_timestamp, true)}</p>
          ) : wasEditedAfterCompletion(entry) ? (
            <p>Edited {formatJournalDate(entry.updated_timestamp, true)}</p>
          ) : (
            <p>Completed {formatJournalDate(entry.completed_at, true)}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${entry.title || primaryPresentation.label}`}
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={href}>
                {entry.status === "draft" ? "Continue" : "View"}
              </Link>
            </DropdownMenuItem>
            {entry.status === "completed" && entry.format !== "legacy" && (
              <DropdownMenuItem asChild>
                <Link href={getJournalEditHref(entry)}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function JournalListSkeleton() {
  return (
    <div className="divide-y divide-border/70" aria-label="Loading journals">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_8rem]"
        >
          <Skeleton className="size-10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

function emptyTitle(view: JournalHubView, hasFilters: boolean) {
  if (hasFilters) {
    return "No journals match these filters";
  }

  return view === "drafts" ? "No drafts yet" : "No completed journals yet";
}

function emptyCopy(view: JournalHubView, hasFilters: boolean) {
  if (hasFilters) {
    return "Try clearing a filter or changing your search.";
  }

  if (view === "drafts") {
    return "A draft appears after you add meaningful input to a new Journal.";
  }

  return "Start a Log or Reflection when you have something worth recording.";
}
