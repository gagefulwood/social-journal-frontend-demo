"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  LayoutGrid,
  MapPin,
  Minus,
  NotebookTabs,
  Pencil,
  Sparkles,
  Star,
  Smile,
  TrendingDown,
  TrendingUp,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventsApi } from "@/lib/api/eventsApi";
import { useEvent } from "@/hooks/useEvent";
import { contactInitials, contactName } from "@/components/contacts/contact-utils";
import { cn } from "@/lib/utils";
import type {
  Event,
  EventImpact,
  EventParticipant,
  EventTier,
} from "@/types/events";
import type { Mood } from "@/types/lookups";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading, error, refetch } = useEvent(params.id);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!event || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await eventsApi.remove(event.id);
      toast.success("Event deleted.");
      router.push("/events");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete event.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1760px] px-4 py-4 sm:px-5 lg:px-4">
        <Tabs className="min-w-0 gap-0" value="events">
          <header className="mb-4 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border">
            <div className="min-w-0 justify-self-start">
              <Button asChild variant="outline">
                <Link href="/events">
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
            </div>

            <TabsList
              variant="line"
              className="mx-auto h-14 max-w-full justify-center overflow-x-auto rounded-none border-b-0 px-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:h-16 sm:px-4"
            >
              <TabsTrigger
                value="overview"
                className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
              >
                <Sparkles className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="context"
                className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
              >
                <LayoutGrid className="size-4" />
                Context
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
              >
                <CalendarDays className="size-4" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="journals"
                className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
              >
                <NotebookTabs className="size-4" />
                Journals
              </TabsTrigger>
            </TabsList>

            <div className="flex min-w-0 items-center justify-end gap-2">
              <Button asChild variant="outline">
                <Link
                  href={`/events/${params.id}/edit`}
                  aria-label="Edit event. Event timestamp remains read-only after creation."
                >
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={!event || isDeleting}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete event?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This deletes the event and cascades to its participants
                      and attached journal entries. This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={isDeleting}
                      onClick={() => void confirmDelete()}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </header>

          <section className="mx-auto w-full max-w-[1320px] py-4 sm:py-5">
            {loading && (
              <div className="rounded-lg border border-border bg-card p-8">
                <p className="text-sm text-muted-foreground">
                  Loading event...
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-border bg-card p-8">
                <p className="font-medium">Unable to load event</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {error.message}
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => void refetch()}
                >
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && !event && (
              <div className="rounded-lg border border-border bg-card p-8">
                Event not found.
              </div>
            )}

            {event && (
              <div className="space-y-4">
                <EventAnchorHeader event={event} />
                <EventMetadataStrip event={event} />
              </div>
            )}
          </section>
        </Tabs>
      </div>
    </main>
  );
}

function EventMetadataStrip({ event }: { event: Event }) {
  const metadataItems = buildMetadataItems(event);

  if (metadataItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card shadow-xs">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {metadataItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="relative flex min-h-20 items-center gap-3 px-5 py-4"
            >
              {index > 0 && (
                <span className="absolute left-0 top-1/2 h-12 -translate-y-1/2 border-l border-border" />
              )}
              <Icon className={cn("size-6 shrink-0", item.iconClassName)} />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p
                  className={cn(
                    "mt-1 truncate text-base font-medium",
                    item.valueClassName,
                  )}
                >
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EventAnchorHeader({ event }: { event: Event }) {
  const timestamp = formatEventDateTimeRange(
    event.event_timestamp,
    event.end_timestamp,
  );
  const description = event.description.trim();
  const visibleParticipants = event.participants.slice(0, 5);
  const overflowCount = Math.max(0, event.participants.length - visibleParticipants.length);
  const participantSummary = formatParticipantSummary(event.participants);

  return (
    <section className="grid gap-8 rounded-lg border border-border bg-card p-7 shadow-xs lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.62fr)] lg:items-center">
      <div className="flex min-w-0 gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
          <CalendarDays className="size-8" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-3xl font-semibold tracking-tight text-foreground">
            {event.title || "Untitled event"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-base text-foreground">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span>{timestamp}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <TierBadge tier={event.tier} />
            <JournaledBadge journaled={event.journaled} />
          </div>

          {event.location_label && (
            <div className="mt-5 flex items-center gap-3 text-base text-foreground">
              <MapPin className="size-5 text-muted-foreground" />
              <span>{event.location_label}</span>
            </div>
          )}

          {description && (
            <p className="mt-5 max-w-3xl text-sm leading-6 text-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <aside className="flex min-w-0 flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Participants
        </p>

        {event.participants.length > 0 ? (
          <>
            <div className="mt-4 flex items-center justify-center">
              <div className="flex -space-x-4">
                {visibleParticipants.map((participant) => (
                  <ParticipantAvatar
                    key={participant.id}
                    participant={participant}
                  />
                ))}

                {overflowCount > 0 && (
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-card bg-muted text-base font-semibold text-foreground">
                    +{overflowCount}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-foreground">
              {participantSummary}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No participants attached.
          </p>
        )}
      </aside>
    </section>
  );
}

function TierBadge({ tier }: { tier: EventTier }) {
  const label = tier === "milestone" ? "Milestone" : "Routine";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium",
        tier === "milestone"
          ? "border-primary/20 bg-accent text-primary-strong"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <Star className="size-4" />
      {label}
    </span>
  );
}

function JournaledBadge({ journaled }: { journaled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium",
        journaled
          ? "border-success/20 bg-success-muted text-success"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <Check className="size-4" />
      {journaled ? "Journaled" : "Unjournaled"}
    </span>
  );
}

type MetadataItem = {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string;
  valueClassName?: string;
};

function buildMetadataItems(event: Event): MetadataItem[] {
  const items: MetadataItem[] = [];

  if (event.mood) {
    const moodClassName = moodToneClass(event.mood);
    items.push({
      icon: Smile,
      iconClassName: moodClassName,
      label: "Mood",
      value: event.mood.name,
      valueClassName: moodClassName,
    });
  }

  if (event.impact) {
    const impact = impactMetadata(event.impact);
    items.push({
      icon: impact.icon,
      iconClassName: impact.className,
      label: "Impact",
      value: impact.label,
      valueClassName: impact.className,
    });
  }

  if (event.interaction_mode) {
    items.push({
      icon: UsersRound,
      iconClassName: "text-info",
      label: "Mode",
      value: event.interaction_mode.name,
      valueClassName: "text-info",
    });
  }

  if (event.location_label) {
    items.push({
      icon: MapPin,
      iconClassName: "text-primary-strong",
      label: "Location",
      value: event.location_label,
    });
  }

  if (event.end_timestamp) {
    const endDate = new Date(event.end_timestamp);
    if (!Number.isNaN(endDate.getTime())) {
      items.push({
        icon: Clock,
        iconClassName: "text-warning",
        label: "End time",
        value: formatTime(endDate),
      });
    }
  }

  return items;
}

function moodToneClass(mood: Mood) {
  const normalizedName = mood.name.trim().toLowerCase();

  if (normalizedName.includes("happy")) {
    return "text-success";
  }

  if (normalizedName.includes("content")) {
    return "text-success";
  }

  if (normalizedName.includes("anxious")) {
    return "text-mood-anxious";
  }

  if (normalizedName.includes("sad")) {
    return "text-mood-sad";
  }

  if (normalizedName.includes("angry")) {
    return "text-mood-angry";
  }

  if (mood.polarity > 0) {
    return "text-success";
  }

  if (mood.polarity < 0) {
    return "text-mood-sad";
  }

  return "text-mood-neutral";
}

function impactMetadata(impact: Exclude<EventImpact, "">) {
  if (impact === "positive") {
    return {
      className: "text-success",
      icon: TrendingUp,
      label: "Positive",
    };
  }

  if (impact === "negative") {
    return {
      className: "text-destructive",
      icon: TrendingDown,
      label: "Negative",
    };
  }

  return {
    className: "text-muted-foreground",
    icon: Minus,
    label: "Neutral",
  };
}

function ParticipantAvatar({
  participant,
}: {
  participant: EventParticipant;
}) {
  const name = contactName(participant.contact);
  const imageUrl = profilePictureUrl(participant.contact.profile_picture?.url);

  return (
    <Link
      href={`/contacts/${participant.contact.id}`}
      aria-label={`Open ${name}`}
      className="group/avatar relative block size-16 overflow-hidden rounded-full border-2 border-card bg-accent text-accent-foreground shadow-xs transition hover:z-10 hover:border-primary focus-visible:z-10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {imageUrl ? (
        <span
          role="img"
          aria-label={participant.contact.profile_picture?.alt_text || name}
          className="block size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-base font-semibold">
          {contactInitials(participant.contact)}
        </span>
      )}
    </Link>
  );
}

function formatEventDateTimeRange(
  eventTimestamp: string,
  endTimestamp: string | null,
) {
  const startDate = new Date(eventTimestamp);

  if (Number.isNaN(startDate.getTime())) {
    return "Date unavailable";
  }

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startDate);
  const startTime = formatTime(startDate);
  const endDate = endTimestamp ? new Date(endTimestamp) : null;
  const endTime =
    endDate && !Number.isNaN(endDate.getTime()) ? formatTime(endDate) : null;

  return endTime ? `${dateLabel} · ${startTime} - ${endTime}` : `${dateLabel} · ${startTime}`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatParticipantSummary(participants: EventParticipant[]) {
  const names = participants.map((participant) => contactName(participant.contact));

  if (names.length <= 3) {
    return names.join(", ");
  }

  return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
}

function profilePictureUrl(url: string | undefined) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return apiUrl && url.startsWith("/") ? `${apiUrl}${url}` : url;
}
