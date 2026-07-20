import {
  CalendarClock,
  Check,
  Circle,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { IconBadge } from "@/components/ui/icon-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import type { EventImpact, EventTier } from "@/types/events";
import type { ContextCategory, InteractionMode, Mood } from "@/types/lookups";

export type EventFormPreviewValues = {
  title?: string;
  description?: string;
  event_timestamp?: string;
  end_timestamp?: string;
  location_label?: string;
  tier?: EventTier;
  impact?: EventImpact;
  context_category?: string;
  interaction_mode_id?: string;
  mood_id?: string;
  participants?: string[];
};

type EventFormPreviewProps = {
  values: EventFormPreviewValues;
  contextCategories: ContextCategory[];
  interactionModes: InteractionMode[];
  moods: Mood[];
};

export function EventFormPreview({
  values,
  contextCategories,
  interactionModes,
  moods,
}: EventFormPreviewProps) {
  const tier = values.tier ?? "routine";
  const contextCategory = contextCategories.find(
    (item) => String(item.id) === values.context_category,
  );
  const interactionMode = interactionModes.find(
    (item) => String(item.id) === values.interaction_mode_id,
  );
  const mood = moods.find((item) => String(item.id) === values.mood_id);
  const presentation = getEventPresentation({
    title: values.title,
    tier,
    impact: values.impact,
    context_category: contextCategory ?? null,
    interaction_mode: interactionMode ?? null,
    mood: mood ?? null,
    description: values.description,
    location_label: values.location_label,
  });
  const title = values.title?.trim() || "Untitled moment";
  const description = values.description?.trim();
  const location = values.location_label?.trim();
  const participantCount = values.participants?.length ?? 0;
  const timeComplete = validDateRange(
    values.event_timestamp,
    values.end_timestamp,
  );
  const dateLabel = formatPreviewDateRange(
    values.event_timestamp,
    values.end_timestamp,
  );
  const progressItems = [
    {
      label: "Moment",
      complete: Boolean(values.title?.trim()),
      required: true,
    },
    {
      label: "Time",
      complete: timeComplete,
      required: true,
    },
    { label: "People", complete: participantCount > 0, required: false },
    { label: "Place", complete: Boolean(location), required: false },
    {
      label: "Context",
      complete: Boolean(
        values.context_category ||
        values.interaction_mode_id ||
        values.mood_id ||
        values.impact,
      ),
      required: false,
    },
  ];
  return (
    <>
      <SurfaceCard className="min-w-0 p-4">
        <div className="flex items-center gap-2.5">
          <IconBadge tone="violet" size="sm">
            <Sparkles aria-hidden="true" />
          </IconBadge>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Live preview</h2>
            <p className="text-xs text-muted-foreground">
              How this moment will be recognized.
            </p>
          </div>
        </div>

        <div className="mt-4 min-w-0 rounded-lg border border-border/80 bg-background/50 p-3">
          <div className="flex min-w-0 items-start gap-3">
            <EventIconTile presentation={presentation.icon} />
            <div className="min-w-0 flex-1">
              <p
                className="line-clamp-2 break-words text-sm font-semibold [overflow-wrap:anywhere]"
                title={title}
              >
                {title}
              </p>
              <p className="mt-1 text-xs leading-4 text-muted-foreground">
                {dateLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
            <EventSemanticChip presentation={presentation.semanticChip} />
            {values.impact && (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <EventIconTile
                  presentation={presentation.impact}
                  size="compact"
                />
                {presentation.impact.label}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-3 line-clamp-3 break-words text-sm leading-5 text-foreground [overflow-wrap:anywhere]">
              {description}
            </p>
          )}

          <div className="mt-3 space-y-1.5 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            {location && (
              <p className="flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate" title={location}>
                  {location}
                </span>
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <UsersRound className="size-3.5 shrink-0" aria-hidden="true" />
              {participantCount === 0
                ? "No people selected"
                : `${participantCount} ${participantCount === 1 ? "person" : "people"}`}
            </p>
            {interactionMode && (
              <p className="flex items-center gap-1.5">
                <EventIconTile
                  presentation={presentation.interactionMode}
                  size="compact"
                />
                <span className="truncate">{interactionMode.name}</span>
              </p>
            )}
            {mood && <p>Mood · {mood.name}</p>}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="min-w-0 p-4">
        <div className="flex items-center gap-2.5">
          <IconBadge tone="indigo" size="sm">
            <CalendarClock aria-hidden="true" />
          </IconBadge>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Details added</h2>
            <p className="text-xs text-muted-foreground">
              A quick summary of what you have included.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          {progressItems.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={
                  item.complete
                    ? "inline-flex items-center gap-1 text-xs font-medium text-success"
                    : item.required
                      ? "inline-flex items-center gap-1 text-xs font-medium text-warning"
                      : "inline-flex items-center gap-1 text-xs text-muted-foreground"
                }
              >
                {item.complete ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Circle className="size-3.5" aria-hidden="true" />
                )}
                {item.complete
                  ? item.required
                    ? "Complete"
                    : "Added"
                  : item.required
                    ? "Needs attention"
                    : "Optional"}
              </span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </>
  );
}

function validDate(value: string | undefined) {
  return Boolean(value && !Number.isNaN(new Date(value).getTime()));
}

function validDateRange(startValue?: string, endValue?: string) {
  if (!validDate(startValue)) return false;
  if (!endValue) return true;
  if (!validDate(endValue)) return false;

  return new Date(endValue).getTime() >= new Date(startValue!).getTime();
}

function formatPreviewDateRange(startValue?: string, endValue?: string) {
  if (!validDate(startValue)) return "Choose a date and time";

  const start = new Date(startValue!);
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);

  if (!endValue) return startLabel;
  if (!validDateRange(startValue, endValue)) {
    return "Check the end date and time";
  }

  const end = new Date(endValue!);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}
