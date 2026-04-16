"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";

import WidgetSkeleton from "@/components/dashboard/WidgetSkeleton";
import WidgetErrorState from "@/components/dashboard/WidgetErrorState";

import ActivityStatsWidget from "@/components/dashboard/ActivityStatsWidget";
import RecentEventsWidget from "@/components/dashboard/RecentEventsWidget";
import UpcomingEventsWidget from "@/components/dashboard/UpcomingEventsWidget";
import DecayRadarWidget from "@/components/dashboard/DecayRadarWidget";

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
        <WidgetSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return <WidgetErrorState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ActivityStatsWidget
        total={data.stats.total}
        trend={data.stats.trend}
      />

      <RecentEventsWidget events={data.recentEvents} />

      <UpcomingEventsWidget events={data.upcomingEvents} />

      <DecayRadarWidget data={data.decay} />
    </div>
  );
}