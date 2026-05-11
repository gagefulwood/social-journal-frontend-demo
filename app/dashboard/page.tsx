"use client";

import { RefreshCw } from "lucide-react";
import { ActivityStats } from "@/components/dashboard/ActivityStats";
import { DecayRadar } from "@/components/dashboard/DecayRadar";
import { InteractionHeatmap } from "@/components/dashboard/InteractionHeatmap";
import { RecentEventsWidget } from "@/components/dashboard/RecentEventsWidget";
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget";
import { SidebarSJ } from "@/components/layout/SideBarLayout";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useDashboard } from "@/hooks/useDashboard";

export default function Dashboard() {
  const { data, loading, error, refetch } = useDashboard();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarSJ />
        <main className="flex-1 p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                A current view of relationship activity and follow-up signals.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2 self-start"
              onClick={() => void refetch()}
              disabled={loading}
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>

          <div className="mt-8 flex flex-col gap-6">
            <ActivityStats
              stats={data?.activity_stats ?? null}
              loading={loading}
              error={error}
              onRetry={refetch}
            />
            <InteractionHeatmap
              days={data?.interaction_heatmap ?? []}
              loading={loading}
              error={error}
              onRetry={refetch}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <DecayRadar
                  contacts={data?.decay_radar ?? []}
                  loading={loading}
                  error={error}
                  onRetry={refetch}
                />
              </div>
              <div>
                <UpcomingEventsWidget
                  events={data?.upcoming_events ?? []}
                  loading={loading}
                  error={error}
                  onRetry={refetch}
                />
              </div>
            </div>
            <RecentEventsWidget
              events={data?.recent_events ?? []}
              loading={loading}
              error={error}
              onRetry={refetch}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
