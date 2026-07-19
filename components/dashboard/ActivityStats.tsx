"use client";

import { Flame, NotebookTabs } from "lucide-react";
import { DashboardWidgetShell } from "@/components/dashboard/DashboardWidgetShell";
import type { WidgetStateProps } from "@/components/dashboard/dashboard-utils";
import type {
  DashboardActivityStats,
  InteractionHeatmapDay,
} from "@/types/dashboard";

type ActivityStatsProps = WidgetStateProps & {
  stats: DashboardActivityStats | null;
  days: InteractionHeatmapDay[];
};

const emptyStats: DashboardActivityStats = {
  entries_total: 0,
  entries_30d: 0,
  events_30d: 0,
  current_streak_days: 0,
  entries_by_kind_30d: {
    log: 0,
    reflection: 0,
  },
};

export function ActivityStats({
  stats,
  loading,
  error,
  onRetry,
  days,
}: ActivityStatsProps) {
  const safeStats = stats ?? emptyStats;

  return (
    <>
      <JournalMixCard
        stats={safeStats}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
      <CurrentStreakCard
        stats={safeStats}
        loading={loading}
        error={error}
        onRetry={onRetry}
        days={days}
      />
    </>
  );
}

function JournalMixCard({
  stats,
  loading,
  error,
  onRetry,
}: {
  stats: DashboardActivityStats;
} & WidgetStateProps) {
  const items = [
    {
      label: "Logs",
      value: stats.entries_by_kind_30d.log,
      tone: "bg-warning-solid",
    },
    {
      label: "Reflections",
      value: stats.entries_by_kind_30d.reflection,
      tone: "bg-info-solid",
    },
  ];
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <DashboardWidgetShell
      title="Journal mix"
      icon={<NotebookTabs aria-hidden="true" />}
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-32"
    >
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid grid-cols-[5.25rem_minmax(0,1fr)_1.25rem] items-center gap-2 text-sm"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <div
              className="relative h-3"
              role="progressbar"
              aria-label={`${item.label}: ${item.value}`}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={item.value}
            >
              <span className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-border/90 shadow-[inset_0_1px_0_var(--surface)]" />
              {item.value > 0 && (
                <span
                  className={`absolute left-0 top-1/2 h-[7px] -translate-y-1/2 rounded-full shadow-sm ${item.tone}`}
                  style={{ width: `${Math.max(16, (item.value / max) * 76)}%` }}
                />
              )}
            </div>
            <span className="text-right font-medium tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </DashboardWidgetShell>
  );
}

function CurrentStreakCard({
  stats,
  loading,
  error,
  onRetry,
  days,
}: {
  stats: DashboardActivityStats;
  days: InteractionHeatmapDay[];
} & WidgetStateProps) {
  return (
    <DashboardWidgetShell
      title="Current streak"
      description="Recorded days in a row."
      icon={<Flame aria-hidden="true" />}
      iconTone="rose"
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-40"
    >
      <div className="flex min-h-24 items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-semibold tabular-nums">
            {stats.current_streak_days}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              {stats.current_streak_days === 1 ? "day" : "days"}
            </span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {stats.events_30d} {stats.events_30d === 1 ? "moment" : "moments"}{" "}
            recorded in the past 30 days.
          </p>
        </div>
        <ActivityTrace days={days} />
      </div>
    </DashboardWidgetShell>
  );
}

function ActivityTrace({ days }: { days: InteractionHeatmapDay[] }) {
  const latestDays = [...days]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-7);
  const maxCount = Math.max(...latestDays.map((day) => day.count), 0);

  if (latestDays.length < 2 || maxCount === 0) {
    return null;
  }

  const points = latestDays
    .map((day, index) => {
      const x = 4 + (index * 84) / (latestDays.length - 1);
      const y = 26 - (day.count / maxCount) * 18;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 92 30"
      className="mb-0.5 h-9 w-28 shrink-0 text-marker-rose-foreground"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle
        cx={4 + 84}
        cy={26 - (latestDays[latestDays.length - 1].count / maxCount) * 18}
        r="2.5"
        fill="currentColor"
      />
    </svg>
  );
}
