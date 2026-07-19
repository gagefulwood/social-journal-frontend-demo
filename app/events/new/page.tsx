"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EventsForm } from "@/components/events/EventForm";
import type { CreateEventRequest, UpdateEventRequest } from "@/types/events";
import { eventsApi } from "@/lib/api/eventsApi";
import type { ContextCategory } from "@/types/lookups";
import { Suspense, useEffect, useState } from "react";
import { lookupsApi } from "@/lib/api/lookups";

export default function NewEventPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <NewEventPageContent />
    </Suspense>
  );
}

function NewEventPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialContactId = searchParams.get("contact");

  const [categories, setCategories] = useState<ContextCategory[]>([]);

  useEffect(() => {
    async function load() {
      const data = await lookupsApi.listContextCategories();
      setCategories(data);
    }

    load();
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-semibold leading-tight">
            New Event
          </h1>
          <p className="text-sm text-muted-foreground">
            Add details about your event.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/events">Cancel</Link>
        </Button>
      </div>

      <EventsForm
        submitLabel="Create Event"
        categories={categories}
        initialContactId={initialContactId}
        onSubmit={async (data: CreateEventRequest | UpdateEventRequest) => {
          await eventsApi.create(data as CreateEventRequest);
          toast.success("Event created.");
          router.push(`/events`);
        }}
      />
    </main>
  );
}
