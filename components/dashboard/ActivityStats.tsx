"use client";

import type React from "react";
import { Activity, BookOpen, CalendarCheck, Flame } from "lucide-react";
import { DashboardWidgetShell } from "@/components/dashboard/DashboardWidgetShell";
import type { WidgetStateProps } from "@/components/dashboard/dashboard-utils";
import type { DashboardActivityStats } from "@/types/dashboard";

type ActivityStatsProps = WidgetStateProps & {
  stats: DashboardActivityStats | null;
};

export function ActivityStats({
  stats,
  loading,
  error,
  onRetry,
}: ActivityStatsProps) {
  const StreakIcon = stats && stats.current_streak_days >= 7 ? Flame : Activity;
  const safeStats = stats ?? {
    entries_total: 0,
    entries_30d: 0,
    events_30d: 0,
    current_streak_days: 0,
    entries_by_kind_30d: {
      log: 0,
      reflection: 0,
      exercise: 0,
    },
  };

  return (
    <DashboardWidgetShell
      title="Activity Stats"
      description="Journal and event momentum."
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-24"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="Total entries"
          value={safeStats.entries_total}
          icon={<BookOpen className="size-4" />}
        />
        <StatTile
          label="Entries 30d"
          value={safeStats.entries_30d}
          icon={<Activity className="size-4" />}
        />
        <StatTile
          label="Events 30d"
          value={safeStats.events_30d}
          icon={<CalendarCheck className="size-4" />}
        />
        <StatTile
          label="Current streak"
          value={safeStats.current_streak_days}
          suffix="days"
          icon={<StreakIcon className="size-4" />}
          emphasized={safeStats.current_streak_days >= 7}
        />
        <EntryMixTile
          logs={safeStats.entries_by_kind_30d.log}
          reflections={safeStats.entries_by_kind_30d.reflection}
          exercises={safeStats.entries_by_kind_30d.exercise}
        />
      </div>
    </DashboardWidgetShell>
  );
}

function StatTile({
  label,
  value,
  suffix,
  icon,
  emphasized,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <div
      data-dashboard-stat-tile
      className="min-w-0 rounded-md bg-muted/50 px-4 py-2.5"
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className="min-w-0 truncate text-xl font-semibold leading-none md:text-2xl">
          {value}
          {suffix && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {suffix}
            </span>
          )}
        </p>
        <span className={emphasized ? "shrink-0 text-primary" : "shrink-0 text-muted-foreground"}>
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EntryMixTile({
  logs,
  reflections,
  exercises,
}: {
  logs: number;
  reflections: number;
  exercises: number;
}) {
  return (
    <div
      data-dashboard-stat-tile
      className="min-w-0 rounded-md bg-muted/50 px-4 py-2.5"
    >
      <p className="truncate text-xl font-semibold leading-none md:text-2xl">
        {logs}
        <span className="mx-1 text-muted-foreground">/</span>
        {reflections}
        <span className="mx-1 text-muted-foreground">/</span>
        {exercises}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">logs / ref / ex</p>
    </div>
  );
}
