"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import { Button } from "@/components/ui/button";
import {EventsForm} from "@/components/events/EventForm";
import type { CreateEventRequest, UpdateEventRequest } from "@/types/events";
import { eventsApi } from "@/lib/api/eventsApi";

export default function NewEventPage() {
    const router = useRouter();

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">New Event</h1>
                    <p className="text-sm text-muted-foreground">
                        Add details about your event.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/events">Cancel</Link>
                </Button>
            </div>

            {/*<EventsForm
                submitLabel="Create Event"
                onSubmit={async (data: CreateEventRequest | UpdateEventRequest) => {
                    const event = await eventsApi.create(data as CreateEventRequest);
                    toast.success("Event created.");
                    router.push(`/events/${event.id}`);
                }}
            />*/}
        </main>
    );
}