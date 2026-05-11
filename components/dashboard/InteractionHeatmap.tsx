"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const maxCount = useMemo(
    () => days.reduce((max, day) => Math.max(max, day.count), 0),
    [days]
  );

  return (
    <DashboardWidgetShell
      title="Interaction Heatmap"
      description="Daily event volume across the last year."
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-44"
      className="lg:col-span-8"
    >
      {days.length === 0 ? (
        <DashboardEmptyState
          icon={<CalendarDays className="size-5" />}
          title="No interactions tracked yet"
          description="Your activity pattern will appear here after events are added."
        />
      ) : (
        <TooltipProvider>
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[640px]">
              <div className="grid w-full grid-flow-col grid-cols-[repeat(53,minmax(0,1fr))] grid-rows-7 gap-1">
                {days.map((day) => (
                  <HeatmapCell
                    key={day.date}
                    day={day}
                    bucket={getHeatmapBucket(day.count, maxCount)}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{pluralize(days.length, "day")} shown</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  {bucketClasses.map((className, index) => (
                    <span
                      key={className}
                      className={cn("size-3 rounded-sm", className)}
                      aria-label={`Intensity ${index}`}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}
    </DashboardWidgetShell>
  );
}

const HeatmapCell = memo(function HeatmapCell({
  day,
  bucket,
}: {
  day: InteractionHeatmapDay;
  bucket: number;
}) {
  const nextDate = addDaysToDateOnly(day.date, 1);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/events?event_after=${day.date}&event_before=${nextDate}`}
          aria-label={`${formatDate(day.date)}: ${pluralize(day.count, "event")}`}
          className={cn(
            "aspect-square w-full rounded-sm transition outline-none hover:ring-2 hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-ring",
            bucketClasses[bucket]
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        {formatDate(day.date)} · {pluralize(day.count, "event")}
      </TooltipContent>
    </Tooltip>
  );
});
