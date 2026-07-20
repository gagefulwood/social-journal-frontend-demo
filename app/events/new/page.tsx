"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { EventForm } from "@/components/events/EventForm";
import { IconBadge } from "@/components/ui/icon-badge";
import { eventsApi } from "@/lib/api/eventsApi";
import type { CreateEventRequest } from "@/types/events";

export default function NewEventPage() {
  return (
    <Suspense fallback={<EventPageSkeleton />}>
      <NewEventPageContent />
    </Suspense>
  );
}

function NewEventPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialContactId = searchParams.get("contact");

  return (
    <main className="mx-auto w-full max-w-[90rem] px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-4 flex min-w-0 items-start gap-3 sm:mb-5">
        <IconBadge tone="violet" size="lg">
          <Sparkles aria-hidden="true" />
        </IconBadge>
        <div className="min-w-0">
          <h1 className="font-sans text-2xl leading-tight font-semibold sm:text-3xl">
            Create a moment
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
            Capture what happened, who was there, and what you want to remember.
          </p>
        </div>
      </header>

      <EventForm
        key={initialContactId ?? "no-contact-prefill"}
        submitLabel="Create event"
        cancelHref="/events"
        initialContactId={initialContactId}
        onSubmit={async (data) => {
          const created = await eventsApi.create(data as CreateEventRequest);
          toast.success("Moment created.");
          router.push(`/events/${created.id}`);
        }}
      />
    </main>
  );
}

function EventPageSkeleton() {
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
