"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, MapPin, NotebookPen } from "lucide-react";
import { eventsApi } from "@/lib/api/eventsApi";
import { journalApi } from "@/lib/api/journalApi";
import type { Event } from "@/types/events";
import type { LogListItem } from "@/types/journals";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSJ } from "@/components/layout/SideBarLayout";
import { Button } from "@/components/ui/button";

export default function EventDetailPage() {
  const params = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [journals, setJournals] = useState<LogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

      if (!eventId) return;

      try {
        const eventData = await eventsApi.get(eventId);

        setEvent(eventData);

        const journalRes = await journalApi.listLogs({
          event: eventId,
        });

        setJournals(journalRes.results);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border bg-card p-8">
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border bg-card p-8">
          <p className="text-destructive">Event not found.</p>
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarSJ />
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="mb-6">
            <Button asChild variant="outline">
              <Link href="/journals">Back</Link>
            </Button>
          </div>

          <section className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-16 items-start">
              <div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Event #{event.id}
                  </p>

                  <h1 className="mt-2 text-4xl font-bold tracking-tight">
                    {event.title}
                  </h1>
                </div>

                <div className="space-y-4 text-base">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <CalendarDays className="size-5" />
                    <span>
                      {new Date(event.event_timestamp).toLocaleString()}
                    </span>
                  </div>

                  {event.location_label && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="size-5" />
                      <span>{event.location_label}</span>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold">Tier:</span>{" "}
                    <span className="capitalize">{event.tier}</span>
                  </div>

                  {event.context_category && (
                    <div>
                      <span className="font-semibold">Category:</span>{" "}
                      {event.context_category}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full rounded-lg bg-foreground p-8 text-background xl:w-[420px]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Contacts Connected:</h2>

                  <span className="rounded-full bg-background/20 px-3 py-1 text-sm">
                    {event.participants?.length || 0}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-5">
                  {event.participants?.length ? (
                    event.participants.map((participant) => (
                      <div
                        key={participant.contact.id}
                        className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-background/20 bg-background p-3 text-center text-xs shadow-sm"
                      >
                        <span className="font-medium leading-tight text-black">
                          {participant.contact.first_name}{" "}
                          {participant.contact.last_name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-background/70">
                      No contacts connected.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-14">
              <div className="flex items-center gap-3">
                <NotebookPen className="size-6" />

                <h2 className="text-2xl font-semibold">Connected Journals</h2>
              </div>

              {journals.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  No journals connected to this event yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {journals.map((journal) => (
                    <Link
                      key={journal.id}
                      href={`/journals/${journal.id}`}
                      className="rounded-lg border border-border bg-background p-5 transition hover:border-primary hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">
                            {journal.title}
                          </p>

                          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                            {journal.subtype}
                          </p>
                        </div>

                        {journal.mood?.name && (
                          <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                            {journal.mood.name}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {journal.tags?.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-muted px-2 py-1 text-xs"
                          >
                            {tag.tag_name}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </SidebarProvider>
  );
}
