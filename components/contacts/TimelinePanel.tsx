"use client";

import { CalendarClock } from "lucide-react";

export function TimelinePanel() {
  return (
    <section className="rounded-lg border border-border bg-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <CalendarClock className="size-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Timeline</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Recent events will appear here once events are rebuilt.
      </p>
    </section>
  );
}
