"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  PencilLine,
  Trash2,
} from "lucide-react";

import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconBadge } from "@/components/ui/icon-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getJournalClassificationPresentation } from "@/lib/presentation/journalPresentation";
import type { ApiError } from "@/types/auth";
import type { JournalListItem } from "@/types/journals";

import {
  clampPercent,
  formatJournalDate,
  getJournalResumeHref,
} from "@/components/journals/hub/journalHubUtils";

type JournalDraftPanelProps = {
  drafts: JournalListItem[];
  totalCount: number;
  loading: boolean;
  error: ApiError | null;
  onRetry: () => void;
  onDiscard: (draft: JournalListItem) => Promise<void>;
  onViewAll: () => void;
};

export function JournalDraftPanel({
  drafts,
  totalCount,
  loading,
  error,
  onRetry,
  onDiscard,
  onViewAll,
}: JournalDraftPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<JournalListItem | null>(
    null,
  );
  const [discarding, setDiscarding] = useState(false);
  const [discardError, setDiscardError] = useState<string | null>(null);

  async function confirmDiscard(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!discardTarget || discarding) {
      return;
    }

    setDiscarding(true);
    setDiscardError(null);

    try {
      await onDiscard(discardTarget);
      setDiscardTarget(null);
    } catch (caught) {
      setDiscardError(
        caught instanceof Error ? caught.message : "Unable to discard draft.",
      );
    } finally {
      setDiscarding(false);
    }
  }

  return (
    <>
      <SurfaceCard className="overflow-hidden">
        <div className="flex min-w-0 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <IconBadge size="sm" tone="accent">
              <PencilLine aria-hidden="true" />
            </IconBadge>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">Continue writing</h2>
                {!loading && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {totalCount}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Meaningful drafts are saved as you write.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={expanded}
            aria-controls="journal-draft-list"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? (
              <>
                Collapse <ChevronUp aria-hidden="true" />
              </>
            ) : (
              <>
                {totalCount > 0 ? "View drafts" : "Check drafts"}
                <ChevronDown aria-hidden="true" />
              </>
            )}
          </Button>
        </div>

        {expanded && (
          <div id="journal-draft-list" className="border-t border-border/70">
            {loading ? (
              <DraftPanelSkeleton />
            ) : error ? (
              <div className="px-4 py-5">
                <p className="text-sm font-medium">Unable to load drafts.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error.message}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onRetry}
                >
                  Retry
                </Button>
              </div>
            ) : drafts.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                No drafts yet. A draft appears after your first meaningful
                entry.
              </p>
            ) : (
              <>
                {/* About five compact rows remain visible; overflow belongs to this 20rem viewport. */}
                <div className="max-h-80 divide-y divide-border/70 overflow-y-auto overscroll-contain">
                  {drafts.map((draft) => (
                    <DraftRow
                      key={`${draft.family}-${draft.id}`}
                      draft={draft}
                      onDiscard={() => {
                        setDiscardError(null);
                        setDiscardTarget(draft);
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    Showing {drafts.length} of {totalCount}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={onViewAll}
                  >
                    View all drafts
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </SurfaceCard>

      <AlertDialog
        open={Boolean(discardTarget)}
        onOpenChange={(open) => {
          if (!open && !discarding) {
            setDiscardTarget(null);
            setDiscardError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved Journal draft and its unfinished content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {discardError && (
            <p role="alert" className="text-sm text-destructive">
              {discardError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={discarding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={discarding}
              onClick={confirmDiscard}
            >
              {discarding ? "Discarding\u2026" : "Discard draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DraftRow({
  draft,
  onDiscard,
}: {
  draft: JournalListItem;
  onDiscard: () => void;
}) {
  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation(draft.family, draft.format);
  const percent = clampPercent(draft.progress.percent);
  const context = draft.primary_contact?.display_name ?? draft.event?.title;

  return (
    <article className="grid min-w-0 gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_10rem_auto] md:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <JournalIconTile presentation={primaryPresentation} size="compact" />
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="max-w-full truncate text-sm font-semibold">
              {draft.title || `Untitled ${primaryPresentation.label}`}
            </h3>
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
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {context || primaryPresentation.label}
            <span aria-hidden="true">{" \u00b7 "}</span>
            Updated {formatJournalDate(draft.updated_timestamp, true)}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate text-muted-foreground">
            {draft.progress.current_step || "In progress"}
          </span>
          <span className="font-medium text-foreground">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${primaryPresentation.label} draft progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button asChild size="sm">
          <Link href={getJournalResumeHref(draft)}>Continue</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`More actions for ${draft.title || primaryPresentation.label}`}
            >
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onSelect={onDiscard}>
              <Trash2 aria-hidden="true" />
              Discard draft
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function DraftPanelSkeleton() {
  return (
    <div className="grid gap-1 p-2" aria-label="Loading drafts">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-md px-2 py-3 md:grid-cols-[minmax(0,1fr)_10rem_7rem] md:items-center"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}
