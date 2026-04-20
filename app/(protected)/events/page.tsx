"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { EventCard } from "@/components/events/EventCard";
import { EventCreateDialog } from "@/components/events/EventCreateDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const { data, isLoading, error } = useDashboard();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Events</h2>
        <Button onClick={() => setOpen(true)}>Log Event</Button>
      </div>

      <EventCreateDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          setOpen(false);
          router.refresh();
        }}
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm">
          Failed to load events.
        </p>
      )}

      {data && (
        <>
          {/* Upcoming */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase">
              Upcoming
            </h3>

            {data.upcoming_events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events.
              </p>
            ) : (
              data.upcoming_events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))
            )}
          </section>

          <Separator />

          {/* Recent */}
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase">
              Recent
            </h3>

            {data.recent_events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent events.
              </p>
            ) : (
              data.recent_events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}