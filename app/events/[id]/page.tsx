"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock,
  Folder,
  Heart,
  Link2,
  MapPin,
  Minus,
  Pencil,
  Star,
  Smile,
  TrendingDown,
  TrendingUp,
  Trash2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { RelatedMomentSignal } from "@/components/events/RelatedMomentSignal";
import { JournalStateIndicator } from "@/components/presentation/JournalStateIndicator";
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
import { eventsApi } from "@/lib/api/eventsApi";
import { useEvent, useRelatedEvents } from "@/hooks/useEvent";
import { useLookups } from "@/hooks/useLookups";
import {
  contactInitials,
  contactName,
} from "@/components/contacts/contact-utils";
import { EventJournalsBand } from "@/components/events/EventJournalsBand";
import { moodPolarityToneClass } from "@/lib/presentation/moodPolarityPresentation";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { getJournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/types/auth";
import type {
  Event,
  EventImpact,
  EventParticipant,
  EventRelatedItem,
  EventTier,
} from "@/types/events";
import type { ContextCategory, Mood } from "@/types/lookups";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { event, loading, error, refetch } = useEvent(params.id);
  const { getContextCategoryById } = useLookups();
  const [relatedLimit, setRelatedLimit] = useState(2);
  const {
    relatedEvents,
    loading: relatedLoading,
    error: relatedError,
  } = useRelatedEvents(event?.id, relatedLimit);
  const [isDeleting, setIsDeleting] = useState(false);
  const contextCategory =
    event?.context_category != null
      ? (getContextCategoryById(event.context_category) ?? null)
      : null;

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
      <div className="mx-auto w-full max-w-[1760px] px-3 py-3 sm:px-5 sm:py-4 lg:px-4">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 sm:mb-4">
          <div className="min-w-0">
            <Button asChild variant="outline">
              <Link href="/events">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="ml-auto flex min-w-0 items-center justify-end gap-2">
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
                <Button variant="destructive" disabled={!event || isDeleting}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This deletes the event and its participant links. Attached
                    Journals are kept but will no longer reference this event.
                    This action cannot be undone.
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

        <section className="mx-auto w-full max-w-[1350px] py-2 sm:py-3">
          {loading && (
            <div className="rounded-lg border border-border bg-card p-8">
              <p className="text-sm text-muted-foreground">Loading event...</p>
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
            <div className="grid gap-2.5 lg:gap-3 xl:grid-cols-[minmax(0,1fr)_324px] xl:items-start">
              <div className="min-w-0 space-y-2.5 lg:space-y-3">
                <EventAnchorHeader
                  event={event}
                  contextCategory={contextCategory}
                />
                <EventMetadataStrip event={event} />
                <EventMomentBand event={event} />
                <EventParticipantsBand event={event} />
                <EventJournalsBand event={event} />
              </div>

              <aside className="min-w-0 space-y-2.5 lg:space-y-3">
                <EventAtAGlanceRail event={event} />
                <EventQuickFactsRail
                  event={event}
                  contextCategoryName={contextCategory?.name ?? null}
                />
                <EventRelatedMomentsRail
                  events={relatedEvents}
                  loading={relatedLoading}
                  error={relatedError}
                  canExpand={relatedEvents.length >= 2 && relatedLimit < 10}
                  onViewAll={() => setRelatedLimit(10)}
                />
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EventAtAGlanceRail({ event }: { event: Event }) {
  const glanceItems = buildAtAGlanceItems(event);

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
          <CalendarDays className="size-4" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Event at a Glance
        </h2>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {glanceItems.map((item) => {
          if (item.kind === "journal") {
            return (
              <div
                key={item.label}
                className="flex min-h-18 flex-col justify-center rounded-md border border-border bg-card p-2.5 sm:min-h-20"
              >
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <div className="mt-1">
                  <JournalStateIndicator
                    presentation={item.presentation}
                    size="standard"
                  />
                </div>
              </div>
            );
          }

          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="grid min-h-18 grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5 rounded-md border border-border bg-card p-2.5 sm:min-h-20"
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-md bg-muted/60",
                  item.iconClassName,
                )}
              >
                <Icon className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
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

function EventQuickFactsRail({
  event,
  contextCategoryName,
}: {
  event: Event;
  contextCategoryName: string | null;
}) {
  const quickFactItems = buildQuickFactItems(event, contextCategoryName);

  if (quickFactItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
          <TrendingUp className="size-4" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Quick Facts / Signals
        </h2>
      </div>

      <div className="mt-2.5 divide-y divide-border sm:mt-3">
        {quickFactItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="grid min-h-10 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 py-2 sm:py-2.5"
            >
              <Icon className={cn("size-4 shrink-0", item.iconClassName)} />
              <span className="min-w-0 truncate text-sm text-muted-foreground">
                {item.label}
              </span>
              <span
                className={cn(
                  "max-w-36 truncate text-right text-sm font-medium",
                  item.valueClassName,
                )}
              >
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EventRelatedMomentsRail({
  events,
  loading,
  error,
  canExpand,
  onViewAll,
}: {
  events: EventRelatedItem[];
  loading: boolean;
  error: ApiError | null;
  canExpand: boolean;
  onViewAll: () => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
            <Link2 className="size-4" />
          </div>
          <h2 className="truncate text-base font-semibold text-foreground">
            Related moments
          </h2>
        </div>

        {canExpand && (
          <button
            type="button"
            onClick={onViewAll}
            className="shrink-0 text-sm font-medium text-primary-strong transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            View all
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {loading && (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Loading related moments...
          </p>
        )}

        {!loading && error && (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Related moments are unavailable.
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            No related moments yet.
          </p>
        )}

        {!loading &&
          !error &&
          events.map((event) => (
            <RelatedMomentRow key={event.id} event={event} />
          ))}
      </div>
    </section>
  );
}

function RelatedMomentRow({ event }: { event: EventRelatedItem }) {
  const presentation = getEventPresentation(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="grid min-h-18 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 rounded-md border border-border bg-card p-2.5 transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <EventIconTile presentation={presentation.icon} size="compact" />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {event.title || "Untitled event"}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {formatRelatedDateTime(event.event_timestamp)}
        </p>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        <RelatedMomentSignal event={event} />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}

function EventMetadataStrip({ event }: { event: Event }) {
  const metadataItems = buildMetadataItems(event);

  if (metadataItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-border bg-card shadow-xs">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
        {metadataItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="relative flex min-h-14 items-center gap-2.5 px-3 py-2.5 sm:min-h-16 sm:px-4 sm:py-3"
            >
              {index > 0 && (
                <span className="absolute left-0 top-1/2 hidden h-9 -translate-y-1/2 border-l border-border sm:block sm:h-10" />
              )}
              <Icon className={cn("size-5 shrink-0", item.iconClassName)} />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p
                  className={cn(
                    "mt-0.5 truncate text-sm font-medium",
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

function EventParticipantsBand({ event }: { event: Event }) {
  const [participantStartIndex, setParticipantStartIndex] = useState(0);
  const count = event.participants.length;
  const visibleParticipantLimit = 4;
  const safeStartIndex =
    participantStartIndex >= count ? 0 : participantStartIndex;
  const visibleParticipants = event.participants.slice(
    safeStartIndex,
    safeStartIndex + visibleParticipantLimit,
  );
  const hasOverflow = count > visibleParticipantLimit;
  const nextStartIndex =
    safeStartIndex + visibleParticipantLimit >= count
      ? 0
      : safeStartIndex + visibleParticipantLimit;

  function showNextParticipants() {
    setParticipantStartIndex(nextStartIndex);
  }

  return (
    <section
      id="event-participants"
      className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
            <UsersRound className="size-4" />
          </div>
          <h2 className="truncate text-base font-semibold text-foreground">
            Participants ({count})
          </h2>
        </div>

        {hasOverflow && (
          <button
            type="button"
            aria-label="Show more participants"
            onClick={showNextParticipants}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>

      {count > 0 ? (
        <div
          id="event-participants-list"
          className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3"
        >
          {visibleParticipants.map((participant) => (
            <ParticipantListItem
              key={participant.id}
              participant={participant}
            />
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          No participants attached.
        </p>
      )}
    </section>
  );
}

function ParticipantListItem({
  participant,
}: {
  participant: EventParticipant;
}) {
  const name = contactName(participant.contact);
  const relation = participant.contact.relation_name?.trim();

  return (
    <Link
      href={`/contacts/${participant.contact.id}`}
      className="group flex min-w-0 items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-3"
    >
      <ParticipantAvatarVisual
        participant={participant}
        className="size-10 bg-muted text-foreground"
        initialsClassName="text-xs"
      />

      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {name}
        </span>
        {relation && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {relation}
          </span>
        )}
      </span>
    </Link>
  );
}

function EventMomentBand({ event }: { event: Event }) {
  const description = event.description.trim();

  return (
    <section className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary-strong">
          <Heart className="size-4" />
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Moment</h2>
          <p
            className={cn(
              "mt-1.5 max-w-5xl text-sm leading-6",
              description ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {description || "No description recorded for this moment."}
          </p>
        </div>
      </div>
    </section>
  );
}

function EventAnchorHeader({
  event,
  contextCategory,
}: {
  event: Event;
  contextCategory: ContextCategory | null;
}) {
  const timestamp = formatEventDateTimeRange(
    event.event_timestamp,
    event.end_timestamp,
  );
  const presentation = getEventPresentation({
    ...event,
    context_category: contextCategory ?? event.context_category,
  });
  const journalPresentation = getJournalStatePresentation(event.journaled);
  const description = event.description.trim();
  const visibleParticipants = event.participants.slice(0, 5);
  const overflowCount = Math.max(
    0,
    event.participants.length - visibleParticipants.length,
  );
  const participantSummary = formatParticipantSummary(event.participants);

  return (
    <section className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-xs sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(270px,0.58fr)] lg:items-center">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
        <EventIconTile presentation={presentation.icon} size="standard" />

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {event.title || "Untitled event"}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-sm text-foreground">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span>{timestamp}</span>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <EventSemanticChip presentation={presentation.semanticChip} />
            <JournalStateIndicator presentation={journalPresentation} />
          </div>

          {event.location_label && (
            <div className="mt-3 flex items-center gap-2.5 text-sm text-foreground">
              <MapPin className="size-4 text-muted-foreground" />
              <span>{event.location_label}</span>
            </div>
          )}

          {description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      <aside className="flex min-w-0 flex-col items-center justify-center text-center">
        <p className="text-xs font-medium text-muted-foreground">
          Participants
        </p>

        {event.participants.length > 0 ? (
          <>
            <div className="mt-3 flex items-center justify-center">
              <div className="flex -space-x-3">
                {visibleParticipants.map((participant) => (
                  <ParticipantAvatar
                    key={participant.id}
                    participant={participant}
                  />
                ))}

                {overflowCount > 0 && (
                  <Link
                    href="#event-participants"
                    aria-label={`Jump to all ${event.participants.length} participants`}
                    className="flex size-14 items-center justify-center rounded-full border-2 border-card bg-muted text-sm font-semibold text-foreground transition hover:z-10 hover:border-primary focus-visible:z-10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    +{overflowCount}
                  </Link>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-foreground">
              {participantSummary}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No participants attached.
          </p>
        )}
      </aside>
    </section>
  );
}

function tierLabel(tier: EventTier) {
  return tier === "milestone" ? "Milestone" : "Routine";
}

type MetadataItem = {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string;
  valueClassName?: string;
};

type AtAGlanceItem =
  | {
      kind: "detail";
      icon: LucideIcon;
      iconClassName: string;
      label: string;
      value: string;
    }
  | {
      kind: "journal";
      label: string;
      presentation: ReturnType<typeof getJournalStatePresentation>;
    };

type QuickFactItem = {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: string;
  valueClassName?: string;
};

function buildAtAGlanceItems(event: Event): AtAGlanceItem[] {
  const startDate = new Date(event.event_timestamp);
  const hasValidStartDate = !Number.isNaN(startDate.getTime());
  const items: AtAGlanceItem[] = [];

  if (hasValidStartDate) {
    items.push({
      kind: "detail",
      icon: CalendarDays,
      iconClassName: "text-primary-strong",
      label: "Date",
      value: formatShortDate(startDate),
    });
    items.push({
      kind: "detail",
      icon: Clock,
      iconClassName: "text-warning",
      label: "Time",
      value: formatTime(startDate),
    });
  }

  items.push({
    kind: "detail",
    icon: Star,
    iconClassName: "text-primary-strong",
    label: "Tier",
    value: tierLabel(event.tier),
  });
  items.push({
    kind: "journal",
    label: "Journal",
    presentation: getJournalStatePresentation(event.journaled),
  });
  items.push({
    kind: "detail",
    icon: UsersRound,
    iconClassName: "text-info",
    label: "Participants",
    value: String(event.participants.length),
  });

  if (event.interaction_mode) {
    items.push({
      kind: "detail",
      icon: UsersRound,
      iconClassName: "text-info",
      label: "Mode",
      value: event.interaction_mode.name,
    });
  }

  return items;
}

function buildQuickFactItems(
  event: Event,
  contextCategoryName: string | null,
): QuickFactItem[] {
  const items: QuickFactItem[] = [];

  if (event.mood) {
    const moodClassName = moodToneClass(event.mood);
    items.push({
      icon: Smile,
      iconClassName: moodClassName,
      label: "Mood recorded",
      value: event.mood.name,
      valueClassName: "text-foreground",
    });
  }

  if (event.impact) {
    const impact = impactMetadata(event.impact);
    items.push({
      icon: impact.icon,
      iconClassName: impact.className,
      label: "Impact recorded",
      value: impact.label,
      valueClassName: "text-foreground",
    });
  }

  if (contextCategoryName) {
    items.push({
      icon: Folder,
      iconClassName: "text-primary-strong",
      label: "Context category",
      value: contextCategoryName,
      valueClassName: "text-foreground",
    });
  }

  return items;
}

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
  return moodPolarityToneClass(mood.polarity);
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

function ParticipantAvatar({ participant }: { participant: EventParticipant }) {
  const name = contactName(participant.contact);

  return (
    <Link
      href={`/contacts/${participant.contact.id}`}
      aria-label={`Open ${name}`}
      className="group/avatar relative block size-14 overflow-hidden rounded-full border-2 border-card bg-accent text-accent-foreground shadow-xs transition hover:z-10 hover:border-primary focus-visible:z-10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ParticipantAvatarVisual participant={participant} />
    </Link>
  );
}

function ParticipantAvatarVisual({
  participant,
  className,
  initialsClassName,
}: {
  participant: EventParticipant;
  className?: string;
  initialsClassName?: string;
}) {
  const name = contactName(participant.contact);
  const imageUrl = profilePictureUrl(participant.contact.profile_picture?.url);

  return (
    <span
      className={cn(
        "block size-full overflow-hidden rounded-full bg-accent text-accent-foreground",
        className,
      )}
    >
      {imageUrl ? (
        <span
          role="img"
          aria-label={participant.contact.profile_picture?.alt_text || name}
          className="block size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <span
          className={cn(
            "flex size-full items-center justify-center text-sm font-semibold",
            initialsClassName,
          )}
        >
          {contactInitials(participant.contact)}
        </span>
      )}
    </span>
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

  return endTime
    ? `${dateLabel} \u00b7 ${startTime} - ${endTime}`
    : `${dateLabel} \u00b7 ${startTime}`;
}

function formatRelatedDateTime(eventTimestamp: string) {
  const date = new Date(eventTimestamp);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return `${formatShortDate(date)} \u00b7 ${formatTime(date)}`;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatParticipantSummary(participants: EventParticipant[]) {
  const names = participants.map((participant) =>
    contactName(participant.contact),
  );

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
