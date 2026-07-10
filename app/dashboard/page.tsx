"use client";

import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { ActivityStats } from "@/components/dashboard/ActivityStats";
import { DashboardQuickCapture } from "@/components/dashboard/DashboardQuickCapture";
import { DecayRadar } from "@/components/dashboard/DecayRadar";
import { InteractionHeatmap } from "@/components/dashboard/InteractionHeatmap";
import { RecentEventsWidget } from "@/components/dashboard/RecentEventsWidget";
import { UpcomingEventsWidget } from "@/components/dashboard/UpcomingEventsWidget";
import { Button } from "@/components/ui/button";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboard } from "@/hooks/useDashboard";

function currentDateLabel() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

export default function Dashboard() {
  const { data, loading, error, refetch } = useDashboard();
  const isNewAccount =
    !loading &&
    !error &&
    data != null &&
    data.recent_events.length === 0 &&
    data.upcoming_events.length === 0 &&
    data.decay_radar.length === 0 &&
    data.activity_stats.entries_total === 0 &&
    data.activity_stats.events_30d === 0;

  return (
    <main className="min-w-0">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{currentDateLabel()}</p>
                <h1 className="font-display mt-1 text-3xl sm:text-4xl">
                  Make space for what matters.
                </h1>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Refresh dashboard"
                      onClick={() => void refetch()}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`size-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh dashboard</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </header>

            <DashboardQuickCapture onCreated={refetch} />

            {isNewAccount ? (
              <EmptyActionBox
                title="Begin with a person or a shared moment"
                copy="Add the first bit of context, then this space will help you return to it."
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <Link href="/contacts/new">Add a Contact</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/events/new">
                        <Plus className="size-4" />
                        Record a moment
                      </Link>
                    </Button>
                  </div>
                }
              />
            ) : (
              <>
                <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(21rem,1fr)] xl:items-start">
                  <RecentEventsWidget
                    events={data?.recent_events ?? []}
                    loading={loading}
                    error={error}
                    onRetry={refetch}
                  />
                  <aside className="grid min-w-0 gap-4">
                    <DecayRadar
                      contacts={data?.decay_radar ?? []}
                      loading={loading}
                      error={error}
                      onRetry={refetch}
                    />
                    <UpcomingEventsWidget
                      events={data?.upcoming_events ?? []}
                      loading={loading}
                      error={error}
                      onRetry={refetch}
                    />
                  </aside>
                </section>

                <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <InteractionHeatmap
                    days={data?.interaction_heatmap ?? []}
                    loading={loading}
                    error={error}
                    onRetry={refetch}
                  />
                  <ActivityStats
                    stats={data?.activity_stats ?? null}
                    days={data?.interaction_heatmap ?? []}
                    loading={loading}
                    error={error}
                    onRetry={refetch}
                  />
                </section>
              </>
            )}
      </div>
    </main>
  );
}
