"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MessageSquareText,
  Pause,
  Play,
} from "lucide-react";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { ObservationStatusSurface } from "@/components/presentation/ObservationStatusSurface";
import { ObservationTimelineNode } from "@/components/presentation/ObservationTimelineNode";
import { ObservationTypeTag } from "@/components/presentation/ObservationTypeTag";
import { PinnedStateTag } from "@/components/presentation/PinnedStateTag";
import { SourceEventChip } from "@/components/presentation/SourceEventChip";
import { Button } from "@/components/ui/button";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLookups } from "@/hooks/useLookups";
import {
  mapContextObservations,
  type ContextObservation,
} from "@/lib/context/context-mappers";
import { getObservationPresentation } from "@/lib/presentation/observationPresentation";
import { getPinPresentation } from "@/lib/presentation/pinPresentation";
import { cn } from "@/lib/utils";
import type { Observation } from "@/types/contacts";

type RecentObservationsPreviewCardProps = {
  observations: Observation[];
  pinnedObservations: Observation[];
  loading?: boolean;
  error?: string | null;
  pinnedLoading?: boolean;
  pinnedError?: string | null;
  onRetryPinned?: () => void;
  onViewAll: () => void;
};

export function RecentObservationsPreviewCard({
  observations,
  pinnedObservations,
  loading = false,
  error = null,
  pinnedLoading = false,
  pinnedError = null,
  onRetryPinned,
  onViewAll,
}: RecentObservationsPreviewCardProps) {
  const { observationMarkers } = useLookups();
  const recentObservations = useMemo(
    () =>
      mapContextObservations(observations, observationMarkers)
        .filter(
          (observation) =>
            observation.status === "current" ||
            observation.status === "revisit_later",
        )
        .sort(
          (left, right) =>
            timestampValue(right.occurredAt || right.recordedAt) -
            timestampValue(left.occurredAt || left.recordedAt),
        )
        .slice(0, 3),
    [observationMarkers, observations],
  );
  const pinned = useMemo(
    () =>
      mapContextObservations(pinnedObservations, observationMarkers)
        .filter((observation) => observation.isPinned)
        .sort(
          (left, right) =>
            timestampValue(right.pinnedAt) - timestampValue(left.pinnedAt),
        ),
    [observationMarkers, pinnedObservations],
  );

  return (
    <ContactSectionCard asChild density="compact">
      <section aria-labelledby="overview-observations-title">
        <ContactSectionHeader
          headingId="overview-observations-title"
          icon={MessageSquareText}
          iconTone="violet"
          title="What I notice"
          subtitle="Time-oriented observations from recent moments."
          action={
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-0 text-primary-strong"
              onClick={onViewAll}
            >
              View observations
              <ArrowRight className="size-4" />
            </Button>
          }
        />

        <div className="mt-4 grid min-w-0 border-t border-border/80 pt-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] xl:divide-x xl:divide-border/80">
          <RecentObservationsList
            observations={recentObservations}
            loading={loading}
            error={error}
          />
          <PinnedObservationsCarousel
            observations={pinned}
            loading={pinnedLoading}
            error={pinnedError}
            onRetry={onRetryPinned}
            onViewAll={onViewAll}
          />
        </div>
      </section>
    </ContactSectionCard>
  );
}

function RecentObservationsList({
  observations,
  loading,
  error,
}: {
  observations: ContextObservation[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <section
      className="min-w-0 xl:pr-4"
      aria-labelledby="overview-recent-observations-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id="overview-recent-observations-title"
          className="text-base font-semibold leading-6"
        >
          Recent
        </h3>
        {!loading && !error && (
          <span className="shrink-0 text-sm text-muted-foreground">
            {observations.length} recent
          </span>
        )}
      </div>

      {loading ? (
        <CompactPreviewSkeleton />
      ) : error ? (
        <PreviewError
          title="Unable to load recent observations"
          message={error}
        />
      ) : observations.length > 0 ? (
        <ol className="mt-4 space-y-4">
          {observations.map((observation, index) => (
            <RecentObservation
              key={observation.id}
              observation={observation}
              isLast={index === observations.length - 1}
            />
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm leading-5 text-muted-foreground">
          No recent observations yet.
        </p>
      )}
    </section>
  );
}

function RecentObservation({
  observation,
  isLast,
}: {
  observation: ContextObservation;
  isLast: boolean;
}) {
  const presentation = getObservationPresentation(
    observation,
    observation.marker,
  );
  const occurredAt = observation.occurredAt || observation.recordedAt;

  return (
    <li className="grid min-w-0 grid-cols-[3.25rem_1.75rem_minmax(0,1fr)] gap-2 text-sm">
      <time
        dateTime={occurredAt ?? undefined}
        className="pt-1 text-xs leading-4 text-muted-foreground"
      >
        {formatShortDate(occurredAt)}
      </time>
      <div className="relative flex justify-center">
        {!isLast && (
          <span
            aria-hidden="true"
            className="absolute top-7 h-[calc(100%+1rem)] w-px bg-border"
          />
        )}
        <ObservationTimelineNode presentation={presentation.primary} />
      </div>
      <ObservationStatusSurface
        presentation={presentation.status}
        variant="compactCard"
        className="min-w-0 rounded-md border px-2 py-1"
      >
        <p
          title={observation.body}
          className="min-w-0 truncate text-sm leading-5"
        >
          {observation.body}
        </p>
      </ObservationStatusSurface>
    </li>
  );
}

function PinnedObservationsCarousel({
  observations,
  loading,
  error,
  onRetry,
  onViewAll,
}: {
  observations: ContextObservation[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onViewAll: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [documentHidden, setDocumentHidden] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setDocumentHidden(document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (
      observations.length < 2 ||
      isPaused ||
      isInteracting ||
      prefersReducedMotion ||
      documentHidden
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % observations.length);
    }, 8000);

    return () => window.clearInterval(interval);
  }, [
    documentHidden,
    isInteracting,
    isPaused,
    observations.length,
    prefersReducedMotion,
  ]);

  const boundedActiveIndex =
    observations.length > 0 ? activeIndex % observations.length : 0;
  const observation = observations[boundedActiveIndex] ?? null;
  const hasMultiple = observations.length > 1;
  const pinnedPresentation = getPinPresentation(true, false, "observation");

  return (
    <section
      className="mt-4 min-w-0 border-t border-border/80 pt-4 xl:mt-0 xl:border-t-0 xl:pt-0 xl:pl-4"
      aria-labelledby="overview-pinned-observations-title"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsInteracting(false);
        }
      }}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <PinnedStateTag presentation={pinnedPresentation} iconOnly />
          <h3
            id="overview-pinned-observations-title"
            className="text-base font-semibold leading-6"
          >
            Pinned observations
          </h3>
        </div>
        {!loading && !error && observations.length > 1 && (
          <span className="shrink-0 text-sm text-muted-foreground">
            {boundedActiveIndex + 1} of {observations.length}
          </span>
        )}
      </div>

      {loading ? (
        <PinnedPreviewSkeleton />
      ) : error ? (
        <PreviewError
          title="Unable to load pinned observations"
          message={error}
          onRetry={onRetry}
        />
      ) : observation ? (
        <>
          <PinnedObservationCard
            key={String(observation.id)}
            observation={observation}
          />
          {hasMultiple && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex min-h-9 items-center gap-2"
                aria-label="Choose pinned observation"
              >
                {observations.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex size-9 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-card focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Show pinned observation ${index + 1}`}
                    aria-pressed={index === boundedActiveIndex}
                    onClick={() => setActiveIndex(index)}
                  >
                    <span
                      className={cn(
                        "size-2.5 rounded-full transition-colors",
                        index === boundedActiveIndex
                          ? "bg-primary"
                          : "bg-border",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {!prefersReducedMotion && (
                  <Button
                    type="button"
                    size="icon-lg"
                    variant="outline"
                    className="size-11 rounded-full"
                    aria-label={
                      isPaused
                        ? "Resume automatic rotation"
                        : "Pause automatic rotation"
                    }
                    aria-pressed={isPaused}
                    onClick={() => setIsPaused((current) => !current)}
                  >
                    {isPaused ? (
                      <Play className="size-4" />
                    ) : (
                      <Pause className="size-4" />
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon-lg"
                  variant="outline"
                  className="size-11 rounded-full text-primary-strong"
                  aria-label="Show next pinned observation"
                  onClick={() =>
                    setActiveIndex(
                      (current) => (current + 1) % observations.length,
                    )
                  }
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyActionBox
          className="mt-4 text-left"
          icon={
            <IconBadge tone="neutral" size="sm" className="shadow-none">
              <MessageSquareText className="size-4" />
            </IconBadge>
          }
          title="No pinned observations yet"
          copy="Pin an observation in Context to keep it close here."
          action={
            <Button type="button" variant="outline" onClick={onViewAll}>
              Open Context
            </Button>
          }
        />
      )}
    </section>
  );
}

function PinnedObservationCard({
  observation,
}: {
  observation: ContextObservation;
}) {
  const presentation = getObservationPresentation(
    observation,
    observation.marker,
  );
  const occurredAt = observation.occurredAt || observation.recordedAt;
  const sourceEventLabel = observation.event
    ? `${observation.event.title}${
        observation.event.occurredAt
          ? ` · ${formatShortDate(observation.event.occurredAt)}`
          : ""
      }`
    : null;

  return (
    <ObservationStatusSurface
      presentation={presentation.status}
      variant="featuredCard"
      className="mt-4 min-w-0 rounded-lg border p-4 shadow-xs motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-right-1 motion-safe:duration-200"
    >
      <ObservationTypeTag presentation={presentation.primary} />
      <p className="mt-4 break-words text-lg font-semibold leading-7 [overflow-wrap:anywhere] sm:text-xl">
        {observation.body}
      </p>
      {observation.event && sourceEventLabel && (
        <SourceEventChip
          presentation={presentation.sourceEvent!}
          href={`/events/${observation.event.id}`}
          label={sourceEventLabel}
          className="mt-4"
        />
      )}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="size-4" aria-hidden="true" />
        <time dateTime={occurredAt ?? undefined}>
          {formatLongDate(occurredAt)}
        </time>
      </div>
    </ObservationStatusSurface>
  );
}

function CompactPreviewSkeleton() {
  return (
    <div className="mt-4 space-y-4" aria-label="Loading recent observations">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[3.25rem_1.75rem_minmax(0,1fr)] gap-2"
        >
          <Skeleton className="mt-1 h-3 w-10" />
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="mt-1 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

function PinnedPreviewSkeleton() {
  return (
    <div
      className="mt-4 space-y-3 rounded-lg border border-border bg-muted/20 p-4"
      aria-label="Loading pinned observations"
    >
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-4/5" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

function PreviewError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

function formatShortDate(value: string | null): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLongDate(value: string | null): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function timestampValue(value: string | null): number {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
