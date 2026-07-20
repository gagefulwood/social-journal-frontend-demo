"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PencilLine } from "lucide-react";
import { toast } from "sonner";

import { EventForm } from "@/components/events/EventForm";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { useEvent } from "@/hooks/useEvent";
import { eventsApi } from "@/lib/api/eventsApi";
import type { UpdateEventRequest } from "@/types/events";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = params.id;
  const { event, loading, error, refetch } = useEvent(eventId);

  if (loading) return <EditEventSkeleton />;

  if (error || !event) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center px-4 py-10">
        <div className="w-full rounded-xl border border-destructive/25 bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Moment could not be loaded</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.message || "This moment may no longer be available."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/events">Back to moments</Link>
            </Button>
            <Button type="button" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const detailHref = `/events/${event.id}`;

  return (
    <main className="mx-auto w-full max-w-[90rem] px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-4 flex min-w-0 items-start gap-3 sm:mb-5">
        <IconBadge tone="indigo" size="lg">
          <PencilLine aria-hidden="true" />
        </IconBadge>
        <div className="min-w-0">
          <h1 className="font-sans text-2xl leading-tight font-semibold sm:text-3xl">
            Edit moment
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
            Refine the details and context. The original start time stays fixed.
          </p>
        </div>
      </header>

      <EventForm
        key={String(event.id)}
        initialData={event}
        submitLabel="Save event"
        cancelHref={detailHref}
        onSubmit={async (data) => {
          const updated = await eventsApi.update(
            event.id,
            data as UpdateEventRequest,
          );
          toast.success("Moment updated.");
          router.push(`/events/${updated.id}`);
        }}
      />
    </main>
  );
}

function EditEventSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[90rem] animate-pulse px-3 py-4 motion-reduce:animate-none sm:px-6 sm:py-6">
      <div className="mb-5 h-16 max-w-xl rounded-lg bg-muted/40" />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="h-[32rem] rounded-xl border border-border bg-card" />
        <div className="h-64 rounded-xl border border-border bg-card" />
      </div>
    </main>
  );
}
