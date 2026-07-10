"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardEmptyState,
  DashboardWidgetShell,
} from "@/components/dashboard/DashboardWidgetShell";
import {
  addDaysToDateOnly,
  formatDate,
  pluralize,
  type WidgetStateProps,
} from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";
import type { InteractionHeatmapDay } from "@/types/dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type InteractionHeatmapProps = WidgetStateProps & {
  days: InteractionHeatmapDay[];
};

const bucketClasses = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function getHeatmapBucket(count: number, maxCount: number) {
  if (count <= 0 || maxCount <= 0) {
    return 0;
  }

  return Math.min(4, Math.ceil((count / maxCount) * 4));
}

export function InteractionHeatmap({
  days,
  loading,
  error,
  onRetry,
}: InteractionHeatmapProps) {
  const latestDays = useMemo(
    () =>
      [...days]
        .sort((left, right) => left.date.localeCompare(right.date))
        .slice(-7),
    [days],
  );
  const maxCount = useMemo(
    () => latestDays.reduce((max, day) => Math.max(max, day.count), 0),
    [latestDays],
  );

  return (
    <DashboardWidgetShell
      title="7-day rhythm"
      description="Recorded moments over the last seven days."
      icon={<CalendarDays aria-hidden="true" />}
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-40"
      action={
        <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
          <Link href="/events">
            View events
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {latestDays.length === 0 ? (
        <DashboardEmptyState
          icon={<CalendarDays className="size-5" />}
          title="No recorded moments yet"
          description="A simple rhythm will take shape as moments are added."
        />
      ) : (
        <>
          <TooltipProvider>
            <div className="grid grid-cols-7 gap-2">
              {latestDays.map((day) => (
                <RhythmDay
                  key={day.date}
                  day={day}
                  bucket={getHeatmapBucket(day.count, maxCount)}
                />
              ))}
            </div>
          </TooltipProvider>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>Recent activity</span>
            <div className="flex items-center gap-1" aria-label="Rhythm intensity from less to more">
              <span>Less</span>
              {bucketClasses.map((className) => (
                <span key={className} className={cn("size-2.5 rounded-sm", className)} />
              ))}
              <span>More</span>
            </div>
          </div>
        </>
      )}
    </DashboardWidgetShell>
  );
}

function RhythmDay({
  day,
  bucket,
}: {
  day: InteractionHeatmapDay;
  bucket: number;
}) {
  const nextDate = addDaysToDateOnly(day.date, 1);
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(
    new Date(day.date),
  );

  const upperBucket = bucket === 0 ? 0 : Math.max(1, Math.ceil(bucket / 2));
  const label = `${formatDate(day.date)}: ${pluralize(day.count, "event")}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/events?event_after=${day.date}&event_before=${nextDate}`}
          aria-label={label}
          className="group flex min-w-0 flex-col items-center rounded-md text-center outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="mb-2 block text-xs text-muted-foreground">{weekday}</span>
          <span className="flex flex-col gap-1" aria-hidden="true">
            <span
              className={cn(
                "size-5 rounded-[5px] border border-transparent transition-colors motion-reduce:transition-none group-hover:border-foreground/20",
                bucketClasses[upperBucket],
              )}
            />
            <span
              className={cn(
                "size-5 rounded-[5px] border border-transparent transition-colors motion-reduce:transition-none group-hover:border-foreground/20",
                bucketClasses[bucket],
              )}
            />
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
