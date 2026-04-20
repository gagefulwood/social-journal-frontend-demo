"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";
import { ActivityStatsWidget } from "@/components/dashboard/ActivityStatsWidget";
import { RecentEventsWidget } from "@/components/dashboard/RecentEventsWidget";
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget";
import { DecayRadarWidget } from "@/components/dashboard/DecayRadarWidget";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-destructive text-sm">
        {error ?? "Failed to load dashboard."}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ActivityStatsWidget stats={data.activity_stats} />
      <DecayRadarWidget contacts={data.decay_radar} />
      <RecentEventsWidget events={data.recent_events} />
      <UpcomingEventsWidget events={data.upcoming_events} />
    </div>
  );
}