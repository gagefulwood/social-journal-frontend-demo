"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  Check,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { z } from "zod";

import { FormLayout, FormMain, FormRail } from "@/components/forms/FormLayout";
import { FormDisclosure } from "@/components/forms/FormDisclosure";
import { FormSection } from "@/components/forms/FormSection";
import { FormSectionHeader } from "@/components/forms/FormSectionHeader";
import { EventFormPreview } from "@/components/events/form/EventFormPreview";
import { EventParticipantSelector } from "@/components/events/form/EventParticipantSelector";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLookups } from "@/hooks/useLookups";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import type { ApiError } from "@/types/auth";
import type { ContactListItem } from "@/types/contacts";
import type {
  CreateEventRequest,
  Event,
  EventTier,
  UpdateEventRequest,
} from "@/types/events";
import type { ContextCategory } from "@/types/lookups";

const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Give this moment a title.")
      .max(255, "Keep the title to 255 characters or fewer."),
    description: z.string(),
    event_timestamp: z.string().min(1, "Choose when this moment started."),
    end_timestamp: z.string(),
    location_label: z
      .string()
      .max(255, "Keep the place to 255 characters or fewer."),
    tier: z.enum(["routine", "milestone"]),
    impact: z.enum(["", "negative", "neutral", "positive"]),
    context_category: z.string(),
    interaction_mode_id: z.string(),
    mood_id: z.string(),
    participants: z.array(z.string()),
  })
  .superRefine((values, context) => {
    const start = Date.parse(values.event_timestamp);

    if (values.event_timestamp && Number.isNaN(start)) {
      context.addIssue({
        code: "custom",
        path: ["event_timestamp"],
        message: "Choose a valid start date and time.",
      });
    }

    if (!values.end_timestamp) return;

    const end = Date.parse(values.end_timestamp);
    if (Number.isNaN(end)) {
      context.addIssue({
        code: "custom",
        path: ["end_timestamp"],
        message: "Choose a valid end date and time.",
      });
      return;
    }

    if (!Number.isNaN(start) && end < start) {
      context.addIssue({
        code: "custom",
        path: ["end_timestamp"],
        message: "The end cannot be earlier than the start.",
      });
    }
  });

type EventFormValues = z.infer<typeof eventFormSchema>;

type EventFormProps = {
  initialData?: Event;
  initialContactId?: string | null;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>;
};

const validationFocusOrder: Array<keyof EventFormValues> = [
  "title",
  "context_category",
  "event_timestamp",
  "end_timestamp",
  "description",
  "location_label",
  "participants",
  "tier",
  "impact",
  "interaction_mode_id",
  "mood_id",
];

const explicitFocusSelectors: Partial<Record<keyof EventFormValues, string>> = {
  context_category: '[data-event-form-focus="context_category"][tabindex="0"]',
  participants: '[data-event-form-focus="participants"]',
};

const selectClassName =
  "h-10 w-full min-w-0 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

const textareaClassName =
  "min-h-28 w-full min-w-0 resize-y rounded-md border border-input bg-transparent px-2.5 py-2 text-base leading-6 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30";

export function EventForm({
  initialData,
  initialContactId,
  submitLabel,
  cancelHref,
  onSubmit,
}: EventFormProps) {
  const isEditing = Boolean(initialData);
  const {
    contextCategories,
    interactionModes,
    moods,
    isLoading: lookupsLoading,
    error: lookupsError,
    refresh: refreshLookups,
  } = useLookups();
  const initialParticipantIds = initialData?.participants.map((participant) =>
    String(participant.contact.id),
  );
  const createParticipantIds = initialContactId ? [initialContactId] : [];
  const initialParticipants: ContactListItem[] =
    initialData?.participants.map((participant) => participant.contact) ?? [];
  const initialEndTimestampValue = toLocalDateTimeInput(
    initialData?.end_timestamp,
  );
  const initialStartTimestampValue = initialData?.event_timestamp ?? "";
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      event_timestamp: isEditing ? initialStartTimestampValue : "",
      end_timestamp: initialEndTimestampValue,
      location_label: initialData?.location_label ?? "",
      tier: initialData?.tier ?? "routine",
      impact: initialData?.impact ?? "",
      context_category:
        initialData?.context_category != null
          ? String(initialData.context_category)
          : "",
      interaction_mode_id:
        initialData?.interaction_mode?.id != null
          ? String(initialData.interaction_mode.id)
          : "",
      mood_id: initialData?.mood?.id != null ? String(initialData.mood.id) : "",
      participants: initialParticipantIds ?? createParticipantIds,
    },
  });
  const values = useWatch({ control });
  const startValue = values.event_timestamp ?? "";
  const endMinimum = isEditing
    ? toLocalDateTimeInput(initialStartTimestampValue, "second")
    : startValue;
  const hasContextErrors = Boolean(
    errors.tier ||
    errors.impact ||
    errors.interaction_mode_id ||
    errors.mood_id,
  );
  const hasInitialContext = Boolean(
    initialData?.tier === "milestone" ||
    initialData?.interaction_mode ||
    initialData?.mood ||
    initialData?.impact,
  );
  const interactionModeOptions = includeSelectedLookup(
    interactionModes,
    initialData?.interaction_mode,
  );
  const moodOptions = includeSelectedLookup(moods, initialData?.mood);

  async function submit(nextValues: EventFormValues) {
    const commonPayload = {
      title: nextValues.title.trim(),
      description: nextValues.description.trim(),
      location_label: nextValues.location_label.trim(),
      tier: nextValues.tier,
      impact: nextValues.impact,
      context_category: nextValues.context_category || null,
      interaction_mode_id: nextValues.interaction_mode_id || null,
      mood_id: nextValues.mood_id || null,
      participants: nextValues.participants,
    } satisfies UpdateEventRequest;
    const nextEndTimestamp = nextValues.end_timestamp
      ? localDateTimeToIso(nextValues.end_timestamp)
      : null;
    const payload: CreateEventRequest | UpdateEventRequest = isEditing
      ? {
          ...commonPayload,
          ...(nextValues.end_timestamp !== initialEndTimestampValue
            ? { end_timestamp: nextEndTimestamp }
            : {}),
        }
      : {
          ...commonPayload,
          event_timestamp: localDateTimeToIso(nextValues.event_timestamp),
          end_timestamp: nextEndTimestamp,
        };

    try {
      await onSubmit(payload);
    } catch (error) {
      const mappedFields = applyApiError(error as ApiError, setError);
      if (mappedFields.length > 0) {
        scheduleInvalidFieldFocus(mappedFields);
      }
    }
  }

  function handleInvalidSubmit(invalidErrors: FieldErrors<EventFormValues>) {
    const invalidFields = validationFocusOrder.filter(
      (fieldName) => invalidErrors[fieldName],
    );
    scheduleInvalidFieldFocus(invalidFields);
  }

  return (
    <form
      id="event-form"
      className="flex min-w-0 flex-col gap-3"
      noValidate
      onSubmit={handleSubmit(submit, handleInvalidSubmit)}
    >
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <FormLayout>
        <FormMain>
          <FormSection aria-labelledby="event-moment-heading">
            <FormSectionHeader
              headingId="event-moment-heading"
              icon={FileText}
              title="The moment"
              description="Name what happened, choose its category, and capture when it occurred."
            />

            <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2 sm:col-span-2">
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  autoFocus={!isEditing}
                  maxLength={255}
                  className="h-10"
                  placeholder="Dinner with Maya"
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "event-title-error" : undefined
                  }
                  {...register("title")}
                />
                <FieldError
                  id="event-title-error"
                  message={errors.title?.message}
                />
              </div>

              <div className="min-w-0 space-y-2 sm:col-span-2">
                {lookupsError && (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5">
                    <p className="text-sm text-destructive">
                      Category and detail choices could not be loaded.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void refreshLookups()}
                    >
                      Try again
                    </Button>
                  </div>
                )}
                <div>
                  <Label id="event-category-label">Category</Label>
                  <p className="mt-1 text-xs leading-4 text-muted-foreground">
                    Choose the visual context that best fits this moment.
                  </p>
                </div>
                <input type="hidden" {...register("context_category")} />
                <EventCategoryPicker
                  categories={contextCategories}
                  loading={lookupsLoading}
                  invalid={Boolean(errors.context_category)}
                  value={values.context_category ?? ""}
                  title={values.title ?? ""}
                  tier={(values.tier ?? "routine") as EventTier}
                  onChange={(nextValue) =>
                    setValue("context_category", nextValue, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <FieldError
                  id="event-category-error"
                  message={errors.context_category?.message}
                />
              </div>

              {isEditing ? (
                <div className="min-w-0 space-y-2">
                  <Label>Started</Label>
                  <input type="hidden" {...register("event_timestamp")} />
                  <div className="flex min-h-16 items-start gap-3 rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5">
                    <CalendarClock
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <time
                        dateTime={initialData?.event_timestamp}
                        className="block text-sm font-medium"
                      >
                        {formatDateTime(initialData?.event_timestamp)}
                      </time>
                      <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                        Start time is fixed after a moment is created.
                      </p>
                    </div>
                  </div>
                  <FieldError
                    id="event-start-error"
                    message={errors.event_timestamp?.message}
                  />
                </div>
              ) : (
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="event-start">Starts</Label>
                  <Input
                    id="event-start"
                    type="datetime-local"
                    className="h-10"
                    aria-invalid={Boolean(errors.event_timestamp)}
                    aria-describedby={
                      errors.event_timestamp ? "event-start-error" : undefined
                    }
                    {...register("event_timestamp")}
                  />
                  <FieldError
                    id="event-start-error"
                    message={errors.event_timestamp?.message}
                  />
                </div>
              )}

              <div className="min-w-0 space-y-2">
                <Label htmlFor="event-end">Ends (optional)</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  className="h-10"
                  min={endMinimum || undefined}
                  aria-invalid={Boolean(errors.end_timestamp)}
                  aria-describedby={
                    errors.end_timestamp ? "event-end-error" : undefined
                  }
                  {...register("end_timestamp")}
                />
                <FieldError
                  id="event-end-error"
                  message={errors.end_timestamp?.message}
                />
              </div>

              <div className="min-w-0 space-y-2 sm:col-span-2">
                <Label htmlFor="event-description">Description</Label>
                <textarea
                  id="event-description"
                  className={textareaClassName}
                  placeholder="Capture the details you want to remember."
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description ? "event-description-error" : undefined
                  }
                  {...register("description")}
                />
                <FieldError
                  id="event-description-error"
                  message={errors.description?.message}
                />
              </div>
            </div>
          </FormSection>

          <FormSection aria-labelledby="event-people-heading">
            <FormSectionHeader
              headingId="event-people-heading"
              icon={UsersRound}
              iconTone="indigo"
              title="People and place"
              description="Add where it happened and connect anyone who shared the moment."
            />
            <div className="mt-4 space-y-4">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="event-location">Place (optional)</Label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="event-location"
                    maxLength={255}
                    className="h-10 pl-9"
                    placeholder="Coffee shop, Austin, or online"
                    aria-invalid={Boolean(errors.location_label)}
                    aria-describedby={
                      errors.location_label ? "event-location-error" : undefined
                    }
                    {...register("location_label")}
                  />
                </div>
                <FieldError
                  id="event-location-error"
                  message={errors.location_label?.message}
                />
              </div>

              <Controller
                control={control}
                name="participants"
                render={({ field }) => (
                  <EventParticipantSelector
                    value={field.value}
                    initialContacts={initialParticipants}
                    error={errors.participants?.message}
                    onChange={(nextValue) => {
                      field.onChange(nextValue);
                      setValue("participants", nextValue, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                )}
              />
            </div>
          </FormSection>

          <FormDisclosure
            icon={Sparkles}
            iconTone="violet"
            title="More details"
            description="Optional signals help this moment read naturally across your journal."
            collapsedSummary="Add significance, impact, interaction, or mood."
            defaultOpen={hasInitialContext}
            hasErrors={hasContextErrors}
            errorSummary="Check the highlighted context details."
          >
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="event-tier">Significance</Label>
                <select
                  id="event-tier"
                  className={selectClassName}
                  aria-invalid={Boolean(errors.tier)}
                  {...register("tier")}
                >
                  <option value="routine">Everyday moment</option>
                  <option value="milestone">Milestone</option>
                </select>
                <FieldError
                  id="event-tier-error"
                  message={errors.tier?.message}
                />
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="event-impact">Impact</Label>
                <select
                  id="event-impact"
                  className={selectClassName}
                  aria-invalid={Boolean(errors.impact)}
                  {...register("impact")}
                >
                  <option value="">Not recorded</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
                <FieldError
                  id="event-impact-error"
                  message={errors.impact?.message}
                />
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="event-mode">Interaction</Label>
                <select
                  id="event-mode"
                  className={selectClassName}
                  disabled={lookupsLoading}
                  aria-invalid={Boolean(errors.interaction_mode_id)}
                  {...register("interaction_mode_id")}
                >
                  <option value="">
                    {lookupsLoading ? "Loading interactions…" : "Not recorded"}
                  </option>
                  {interactionModeOptions.map((mode) => (
                    <option key={mode.id} value={String(mode.id)}>
                      {mode.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="event-mode-error"
                  message={errors.interaction_mode_id?.message}
                />
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="event-mood">Mood</Label>
                <select
                  id="event-mood"
                  className={selectClassName}
                  disabled={lookupsLoading}
                  aria-invalid={Boolean(errors.mood_id)}
                  {...register("mood_id")}
                >
                  <option value="">
                    {lookupsLoading ? "Loading moods…" : "Not recorded"}
                  </option>
                  {moodOptions.map((mood) => (
                    <option key={mood.id} value={String(mood.id)}>
                      {mood.emoji_icon ? `${mood.emoji_icon} ` : ""}
                      {mood.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="event-mood-error"
                  message={errors.mood_id?.message}
                />
              </div>
            </div>
          </FormDisclosure>
        </FormMain>

        <FormRail>
          <EventFormPreview
            values={values}
            contextCategories={contextCategories}
            interactionModes={interactionModeOptions}
            moods={moodOptions}
          />
        </FormRail>
      </FormLayout>

      <footer className="relative z-20 flex min-w-0 flex-col gap-3 rounded-xl border border-primary/15 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-sm md:sticky md:bottom-3 md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck
            className="size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          Your moments are private and only visible to you.
        </p>
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:shrink-0 sm:justify-end">
          <Button asChild variant="outline" className="h-10">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full sm:min-w-32"
          >
            {isSubmitting ? (isEditing ? "Saving…" : "Creating…") : submitLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}

type EventCategoryPickerProps = {
  categories: ContextCategory[];
  loading: boolean;
  invalid: boolean;
  value: string;
  title: string;
  tier: EventTier;
  onChange: (value: string) => void;
};

function EventCategoryPicker({
  categories,
  loading,
  invalid,
  value,
  title,
  tier,
  onChange,
}: EventCategoryPickerProps) {
  const hasResolvedValue =
    value === "" ||
    categories.some((category) => String(category.id) === value);
  const unresolvedCategory: ContextCategory | null =
    value && !hasResolvedValue
      ? {
          id: value,
          name: "Saved category unavailable",
          color: "",
          is_system_default: false,
        }
      : null;
  const options: Array<ContextCategory | null> = [
    null,
    ...categories,
    ...(unresolvedCategory ? [unresolvedCategory] : []),
  ];
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = options.findIndex((category) =>
    category == null ? value === "" : String(category.id) === value,
  );
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = options.length - 1;
    }

    if (nextIndex == null) return;
    event.preventDefault();

    const nextCategory = options[nextIndex];
    onChange(nextCategory == null ? "" : String(nextCategory.id));
    optionRefs.current[nextIndex]?.focus();
  }

  if (loading && categories.length === 0) {
    return (
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
        aria-label="Loading categories"
        aria-busy="true"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <span
            key={index}
            className="h-16 animate-pulse rounded-lg border border-border/70 bg-muted/35 motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby="event-category-label"
      aria-describedby={invalid ? "event-category-error" : undefined}
      aria-invalid={invalid || undefined}
      className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3"
    >
      {options.map((category, index) => {
        const optionValue = category == null ? "" : String(category.id);
        const selected = optionValue === value;
        const presentation = getEventPresentation({
          title,
          tier,
          context_category: category,
        }).context;

        return (
          <button
            key={optionValue || "uncategorized"}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === tabbableIndex ? 0 : -1}
            data-event-form-focus="context_category"
            ref={(element) => {
              optionRefs.current[index] = element;
            }}
            className={
              selected
                ? "relative flex min-h-16 min-w-0 items-center gap-2.5 rounded-lg border border-primary/45 bg-primary/5 px-3 py-2 text-left outline-none ring-1 ring-primary/15 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
                : "relative flex min-h-16 min-w-0 items-center gap-2.5 rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-left outline-none transition-colors hover:border-primary/30 hover:bg-muted/25 focus-visible:ring-3 focus-visible:ring-ring/50"
            }
            onClick={() => onChange(optionValue)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <EventIconTile presentation={presentation} size="compact" />
            <span className="line-clamp-2 min-w-0 flex-1 break-words text-sm leading-5 font-medium [overflow-wrap:anywhere]">
              {category?.name ?? "No category"}
            </span>
            {selected && (
              <Check
                className="size-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

function toLocalDateTimeInput(
  value?: string | null,
  precision: "minute" | "second" = "minute",
) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localTime = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localTime.toISOString().slice(0, precision === "second" ? 19 : 16);
}

function localDateTimeToIso(value: string) {
  return new Date(value).toISOString();
}

function includeSelectedLookup<TLookup extends { id: string | number }>(
  lookups: TLookup[],
  selected: TLookup | null | undefined,
) {
  if (
    !selected ||
    lookups.some((lookup) => String(lookup.id) === String(selected.id))
  ) {
    return lookups;
  }

  return [selected, ...lookups];
}

function formatDateTime(value?: string | null) {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function scheduleInvalidFieldFocus(fieldNames: Array<keyof EventFormValues>) {
  if (fieldNames.length === 0) return;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const form = document.getElementById("event-form");
      if (!form) return;

      const field = fieldNames
        .map((fieldName) => {
          const explicitSelector = explicitFocusSelectors[fieldName];
          if (explicitSelector) {
            const explicitTarget =
              form.querySelector<HTMLElement>(explicitSelector);
            if (explicitTarget && !explicitTarget.hasAttribute("disabled")) {
              return explicitTarget;
            }
          }

          return Array.from(
            form.querySelectorAll<HTMLElement>(`[name="${fieldName}"]`),
          ).find(
            (candidate) =>
              candidate.getAttribute("type") !== "hidden" &&
              !candidate.hasAttribute("disabled"),
          );
        })
        .find(Boolean);

      if (!field) return;
      field.scrollIntoView({ block: "center", inline: "nearest" });
      field.focus({ preventScroll: true });
    });
  });
}

function applyApiError(
  apiError: ApiError,
  setError: ReturnType<typeof useForm<EventFormValues>>["setError"],
) {
  const aliases: Partial<Record<keyof EventFormValues, string[]>> = {
    interaction_mode_id: ["interaction_mode_id", "interaction_mode"],
    mood_id: ["mood_id", "mood"],
  };
  const handledFields: Array<keyof EventFormValues> = [];

  validationFocusOrder.forEach((fieldName) => {
    const keys = aliases[fieldName] ?? [fieldName];
    const message = keys
      .map((key) => apiError.fieldErrors?.[key]?.[0])
      .find(Boolean);
    if (!message) return;
    setError(fieldName, { message });
    handledFields.push(fieldName);
  });

  if (handledFields.length === 0) {
    setError("root", {
      message: apiError.message || "Unable to save this moment. Try again.",
    });
  }

  return handledFields;
}
