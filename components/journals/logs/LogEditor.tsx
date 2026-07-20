"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BatteryMedium,
  CalendarClock,
  CheckCircle2,
  HeartHandshake,
  Link2,
  Loader2,
  Smile,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  JournalField,
  JournalValuePicker,
  LookupTagSelector,
} from "@/components/journals/fields/JournalFields";
import { JournalActionFooter } from "@/components/journals/shared/JournalActionFooter";
import { JournalDraftSaveStatus } from "@/components/journals/shared/JournalDraftSaveStatus";
import { JournalFormSection } from "@/components/journals/shared/JournalFormSection";
import { JournalFormSectionHeader } from "@/components/journals/shared/JournalFormSectionHeader";
import { JournalOccurrencePicker } from "@/components/journals/shared/JournalOccurrencePicker";
import { JournalRelatedContextSelector } from "@/components/journals/shared/JournalRelatedContextSelector";
import { JournalChapterSelector } from "@/components/journals/shared/JournalChapterSelector";
import { JournalTimeRangePicker } from "@/components/journals/shared/JournalTimeRangePicker";
import {
  JournalWorkspaceLayout,
  JournalWorkspaceMain,
  JournalWorkspaceRail,
} from "@/components/journals/shared/JournalWorkspaceLayout";
import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLogPatterns } from "@/hooks/useJournal";
import {
  type JournalAutosaveStatus,
  useJournalAutosave,
} from "@/hooks/useJournalAutosave";
import { eventsApi } from "@/lib/api/eventsApi";
import { journalApi } from "@/lib/api/journalApi";
import { getJournalLogFormatPresentation } from "@/lib/presentation/journalPresentation";
import {
  getLogFormOptionPresentation,
  getSentimentShiftPresentation,
  SOCIAL_ENERGY_GROUP_SIZE_PRESENTATION,
} from "@/lib/presentation/logFormOptionPresentation";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  CreateLogRequest,
  EpisodeDetail,
  Log,
  LogFormat,
  SentimentDetail,
  JournalLookupOption,
  SocialEnergyDetail,
  UpdateLogRequest,
} from "@/types/journals";

type LogDraft = {
  format: LogFormat;
  title: string;
  event_id: ApiId | null;
  chapter_id: ApiId | null;
  primary_contact_id: ApiId | null;
  occurred_at: string | null;
  current_step: string;
  detail: EpisodeDetail | SocialEnergyDetail | SentimentDetail;
};

type DetailPatch = Partial<
  EpisodeDetail & SocialEnergyDetail & SentimentDetail
>;

const formatCopy = {
  episode: {
    title: "Log an episode",
    description: "Track a recurring state without diagnosing it.",
    icon: Activity,
  },
  social_energy: {
    title: "Log social energy",
    description:
      "Notice how socializing affected your capacity, mood, and behavior.",
    icon: BatteryMedium,
  },
  sentiment: {
    title: "Log a sentiment shift",
    description: "Record how an interaction affected the way you felt.",
    icon: Smile,
  },
} satisfies Record<
  LogFormat,
  { title: string; description: string; icon: typeof Activity }
>;

const beforeStateOptions = [
  ["open", "Open to socializing"],
  ["neutral", "Neutral"],
  ["reserved", "Reserved"],
  ["depleted", "Already depleted"],
] as const;
const batteryOptions = [
  ["reduced", "Reduced"],
  ["unchanged", "Unchanged"],
  ["increased", "Increased"],
] as const;
const moodOptions = [
  ["worse", "Worse"],
  ["unchanged", "Unchanged"],
  ["improved", "Improved"],
] as const;
const behaviorOptions = [
  ["quieter", "Quieter"],
  ["unchanged", "Unchanged"],
  ["more_social", "More social"],
  ["withdrew", "Withdrew"],
] as const;
const recoveryOptions = [
  ["not_yet", "Not yet"],
  ["right_away", "Right away"],
  ["later_day", "Later that evening"],
  ["next_day", "Next day"],
] as const;
const interactionContextOptions = [
  ["one_on_one", "One-on-one"],
  ["small_group", "Small group"],
  ["large_group", "Large group"],
] as const;
const familiarityOptions = [
  ["very_familiar", "Very familiar"],
  ["familiar", "Familiar"],
  ["mixed", "Mixed"],
  ["unfamiliar", "Unfamiliar"],
] as const;
const settingOptions = [
  ["structured", "Structured"],
  ["unstructured", "Unstructured"],
] as const;
const connectionOptions = [
  ["close", "Close"],
  ["neutral", "Neutral"],
  ["distant", "More distant"],
] as const;
const initiatedByOptions = [
  ["me", "Me"],
  ["them", "Them"],
  ["mutual", "Mutual"],
] as const;
const exchangeOptions = [
  ["positive", "Positive"],
  ["neutral", "Neutral"],
  ["negative", "Negative"],
] as const;

export function LogEditor({
  format,
  existingLog = null,
}: {
  format: LogFormat;
  existingLog?: Log | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = existingLog ? null : searchParams.get("event");
  const queryChapterId = existingLog
    ? null
    : normalizeChapterQuery(searchParams.get("chapter"), queryEventId);
  const queryContactId = existingLog ? null : searchParams.get("contact");
  const copy = formatCopy[format];
  const presentation = getJournalLogFormatPresentation(format);
  const [draft, setDraft] = useState<LogDraft>(() =>
    makeInitialDraft(
      format,
      existingLog,
      queryEventId,
      queryChapterId,
      queryContactId,
    ),
  );
  const [completionError, setCompletionError] = useState<string[] | null>(null);
  const [completing, setCompleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (existingLog || queryEventId == null) {
      return;
    }

    let active = true;
    void eventsApi
      .get(queryEventId)
      .then((event) => {
        if (!active) {
          return;
        }

        setDraft((current) => {
          if (String(current.event_id) !== String(queryEventId)) {
            return current;
          }

          const occurredAt = current.occurred_at ?? event.event_timestamp;
          const chapterIsValid =
            current.chapter_id == null ||
            event.chapters?.some(
              (chapter) => String(chapter.id) === String(current.chapter_id),
            );
          if (occurredAt === current.occurred_at && chapterIsValid) {
            return current;
          }

          return {
            ...current,
            occurred_at: occurredAt,
            chapter_id: chapterIsValid ? current.chapter_id : null,
          };
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [existingLog, queryEventId]);

  const patternsParams = useMemo(() => ({ format, days: 30 }), [format]);
  const patterns = useLogPatterns(patternsParams);
  const autosave = useJournalAutosave<LogDraft, Log>({
    value: draft,
    existingEntry: existingLog,
    isMeaningful: isMeaningfulLogDraft,
    getId: (entry) => entry.id,
    getRevision: (entry) => entry.revision,
    create: createLog,
    update: updateLog,
    onCreated: (entry) => {
      window.history.replaceState(
        window.history.state,
        "",
        `/journals/logs/${entry.id}/edit`,
      );
    },
    delay: 700,
  });

  function setCommon<K extends keyof Omit<LogDraft, "detail" | "format">>(
    key: K,
    value: LogDraft[K],
  ) {
    setCompletionError(null);
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function setDetail(patch: DetailPatch) {
    setCompletionError(null);
    setDraft((current) => ({
      ...current,
      detail: { ...current.detail, ...patch },
    }));
  }

  async function saveOrComplete() {
    const localErrors = validateForCompletion(draft);
    if (localErrors.length) {
      setCompletionError(localErrors);
      return;
    }

    setCompleting(true);
    setCompletionError(null);
    try {
      await autosave.flush();
      const id = autosave.getCurrentEntryId();
      if (id == null) {
        setCompletionError([
          "Add at least one meaningful detail before completing this log.",
        ]);
        return;
      }
      if (existingLog?.status === "completed") {
        router.push(`/journals/logs/${id}`);
        return;
      }

      const completed = await journalApi.completeLog(id, {
        expected_revision: autosave.getCurrentRevision(),
      });
      router.push(`/journals/logs/${completed.id}`);
    } catch (caught) {
      setCompletionError(apiErrorMessages(caught as ApiError));
    } finally {
      setCompleting(false);
    }
  }

  async function leaveEditor() {
    const destination =
      existingLog?.status === "completed"
        ? `/journals/logs/${existingLog.id}`
        : "/journals";
    setLeaving(true);
    setCompletionError(null);

    try {
      await autosave.flush();
      router.push(destination);
    } catch (caught) {
      setCompletionError(apiErrorMessages(caught as ApiError));
      setLeaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 lg:px-6">
        <header className="mb-4 flex min-w-0 flex-wrap items-start gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={leaving}
            onClick={() => void leaveEditor()}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div className="flex min-w-0 flex-1 basis-full items-start gap-3 sm:basis-auto">
            <JournalIconTile presentation={presentation} />
            <div className="min-w-0">
              <h1 className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {copy.description}
              </p>
            </div>
          </div>
        </header>

        <JournalWorkspaceLayout>
          <JournalWorkspaceMain>
            <JournalFormSection>
              <JournalFormSectionHeader
                icon={CalendarClock}
                iconSize="md"
                title={format === "episode" ? "Episode" : "Timing"}
                description={
                  format === "episode"
                    ? "Give this recurring state a neutral label and timeframe."
                    : "Anchor the log to when the social moment happened."
                }
              />
              <div className="mt-4">
                {format === "episode" ? (
                  <EpisodeIdentityAndTimingFields
                    title={draft.title}
                    startedAt={draft.occurred_at}
                    detail={draft.detail as EpisodeDetail}
                    titleError={completionError?.includes(
                      "Add an episode label.",
                    )}
                    startedError={completionError?.includes(
                      "Add when this happened.",
                    )}
                    endedError={completionError?.includes(
                      "Add an end time or mark the episode as still ongoing.",
                    )}
                    onTitleChange={(value) => setCommon("title", value)}
                    onStartedAtChange={(value) =>
                      setCommon("occurred_at", value)
                    }
                    onChange={setDetail}
                  />
                ) : (
                  <JournalOccurrencePicker
                    label="When did this happen?"
                    value={toDateTimeInput(draft.occurred_at)}
                    showRelativeLabel
                    error={
                      completionError?.includes("Add when this happened.")
                        ? "Choose when this happened."
                        : undefined
                    }
                    onChange={(value) =>
                      setCommon("occurred_at", toIsoTimestamp(value))
                    }
                  />
                )}
              </div>
            </JournalFormSection>

            {format === "episode" ? (
              <EpisodeFields
                detail={draft.detail as EpisodeDetail}
                onChange={setDetail}
              />
            ) : null}
            {format === "social_energy" ? (
              <SocialEnergyFields
                detail={draft.detail as SocialEnergyDetail}
                onChange={setDetail}
              />
            ) : null}
            {format === "sentiment" ? (
              <SentimentFields
                detail={draft.detail as SentimentDetail}
                onChange={setDetail}
              />
            ) : null}

            <JournalFormSection>
              <JournalFormSectionHeader
                icon={Link2}
                title="Related context"
                description={
                  format === "sentiment"
                    ? "Connect this log to a moment and the person involved."
                    : "Optionally connect this log to a moment and person."
                }
              />
              <JournalRelatedContextSelector
                className="mt-4"
                eventValue={draft.event_id}
                onEventChange={(value) => {
                  setCompletionError(null);
                  setDraft((current) => ({
                    ...current,
                    event_id: value,
                    chapter_id:
                      String(value) === String(current.event_id)
                        ? current.chapter_id
                        : null,
                  }));
                }}
                eventLabel="Related moment"
                eventDescription="Search five recent moments at a time."
                contactValue={draft.primary_contact_id}
                onContactChange={(value) =>
                  setCommon(
                    "primary_contact_id",
                    Array.isArray(value) ? (value[0] ?? null) : value,
                  )
                }
                contactLabel={
                  format === "sentiment"
                    ? "Person in this interaction"
                    : "Primary person"
                }
                contactDescription={
                  format === "sentiment" ? "Required to complete" : "Optional"
                }
              />
              <JournalChapterSelector
                eventId={draft.event_id}
                chapterId={draft.chapter_id}
                onChapterChange={(chapterId) =>
                  setDraft((current) => ({ ...current, chapter_id: chapterId }))
                }
              />
            </JournalFormSection>

            {completionError?.length ? (
              <SurfaceCard
                role="alert"
                className="border-destructive/30 bg-destructive/5 p-4"
              >
                <p className="font-medium text-destructive">
                  Please review this draft before continuing.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
                  {completionError.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </SurfaceCard>
            ) : null}

            <JournalActionFooter
              saveStatus={
                <JournalDraftSaveStatus
                  state={mapAutosaveStatus(autosave.status)}
                  message={
                    autosave.status === "error"
                      ? autosave.error?.message
                      : undefined
                  }
                  onRetry={autosave.retry}
                />
              }
              actions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={leaving || completing}
                    onClick={() => void leaveEditor()}
                  >
                    {leaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {existingLog?.status === "completed"
                      ? "Back to entry"
                      : "Save as draft"}
                  </Button>
                  <Button
                    type="button"
                    disabled={
                      leaving || completing || !autosave.hasMeaningfulDraft
                    }
                    onClick={() => void saveOrComplete()}
                  >
                    {completing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    {existingLog?.status === "completed"
                      ? "Save changes"
                      : "Complete log"}
                  </Button>
                </>
              }
            />
          </JournalWorkspaceMain>

          <JournalWorkspaceRail>
            <LogAtAGlance draft={draft} />
            <LogPatternsCard
              loading={patterns.loading}
              error={patterns.error}
              data={patterns.data}
            />
          </JournalWorkspaceRail>
        </JournalWorkspaceLayout>
      </div>
    </main>
  );
}

function EpisodeIdentityAndTimingFields({
  title,
  startedAt,
  detail,
  titleError,
  startedError,
  endedError,
  onTitleChange,
  onStartedAtChange,
  onChange,
}: {
  title: string;
  startedAt: string | null;
  detail: EpisodeDetail;
  titleError?: boolean;
  startedError?: boolean;
  endedError?: boolean;
  onTitleChange: (value: string) => void;
  onStartedAtChange: (value: string | null) => void;
  onChange: (patch: DetailPatch) => void;
}) {
  const labelId = useId();
  const startedInput = toDateTimeInput(startedAt);
  const endedInput = toDateTimeInput(detail.ended_at);
  const invalidRange = Boolean(
    startedAt &&
    detail.ended_at &&
    new Date(detail.ended_at) < new Date(startedAt),
  );

  return (
    <div className="space-y-4">
      <JournalField
        label="Episode label"
        htmlFor={labelId}
        error={titleError ? "Add an episode label." : undefined}
      >
        <Input
          id={labelId}
          className="h-11"
          value={title}
          placeholder="e.g. Rumination spiral"
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </JournalField>

      <JournalTimeRangePicker
        startedAt={startedInput}
        endedAt={endedInput}
        ongoing={detail.is_ongoing}
        invalidRange={invalidRange}
        startedError={startedError ? "Choose a start time." : undefined}
        endedError={
          endedError ? "Choose an end time or mark ongoing." : undefined
        }
        onStartedAtChange={(value) => onStartedAtChange(toIsoTimestamp(value))}
        onEndedAtChange={(value) =>
          onChange({ ended_at: toIsoTimestamp(value) })
        }
        onOngoingChange={(isOngoing) =>
          onChange({
            is_ongoing: isOngoing,
            ended_at: isOngoing ? null : detail.ended_at,
          })
        }
      />
    </div>
  );
}

function EpisodeFields({
  detail,
  onChange,
}: {
  detail: EpisodeDetail;
  onChange: (patch: DetailPatch) => void;
}) {
  return (
    <JournalFormSection>
      <JournalFormSectionHeader
        icon={Activity}
        iconSize="md"
        title="Characteristics"
        description="Record what you noticed. These are descriptions, not diagnoses."
      />
      <div className="mt-4 space-y-3">
        <LookupTagSelector
          kind="episode-categories"
          label="Category"
          multiple={false}
          allowCustom={false}
          value={detail.category_id}
          presentation="tiles"
          onChange={(value) =>
            onChange({
              category_id: firstId(value),
            })
          }
        />
        <LookupTagSelector
          kind="episode-characteristics"
          label="Characteristics"
          value={detail.characteristic_ids}
          presentation="chips"
          addLabel="Add characteristic"
          onChange={(value) =>
            onChange({
              characteristic_ids: normalizeIds(value),
            })
          }
        />
        <LookupTagSelector
          kind="episode-context-tags"
          label="Possible context"
          value={detail.context_tag_ids}
          presentation="chips"
          addLabel="Add context"
          onChange={(value) =>
            onChange({
              context_tag_ids: normalizeIds(value),
            })
          }
        />
      </div>
    </JournalFormSection>
  );
}

function SocialEnergyFields({
  detail,
  onChange,
}: {
  detail: SocialEnergyDetail;
  onChange: (patch: DetailPatch) => void;
}) {
  const groupSizeId = useId();
  const GroupSizeIcon = SOCIAL_ENERGY_GROUP_SIZE_PRESENTATION.icon;

  return (
    <>
      <JournalFormSection>
        <JournalFormSectionHeader
          icon={BatteryMedium}
          iconSize="md"
          title="Before and after"
          description="Notice the shift without treating any answer as a score."
        />
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,2fr)] lg:items-center">
          <div className="rounded-lg border border-border bg-card p-3">
            <JournalValuePicker
              label="Before socializing"
              value={detail.before_state}
              options={beforeStateOptions}
              presentation={getLogFormOptionPresentation(
                "social-energy-before-state",
                detail.before_state,
              )}
              onChange={(value) => onChange({ before_state: value })}
            />
          </div>

          <div
            aria-hidden="true"
            className="flex items-center justify-center text-muted-foreground"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted">
              <ArrowRight className="size-5 rotate-90 lg:rotate-0" />
            </span>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">After socializing</h3>
            <div className="grid gap-3 xl:grid-cols-3">
              <JournalValuePicker
                label="Social battery"
                value={detail.battery_effect}
                options={batteryOptions}
                presentation={getLogFormOptionPresentation(
                  "social-energy-battery-effect",
                  detail.battery_effect,
                )}
                onChange={(value) => onChange({ battery_effect: value })}
              />
              <JournalValuePicker
                label="Mood shift"
                value={detail.mood_shift}
                options={moodOptions}
                presentation={getLogFormOptionPresentation(
                  "social-energy-mood-shift",
                  detail.mood_shift,
                )}
                onChange={(value) => onChange({ mood_shift: value })}
              />
              <JournalValuePicker
                label="Behavioral effect"
                value={detail.behavioral_effect}
                options={behaviorOptions}
                presentation={getLogFormOptionPresentation(
                  "social-energy-behavioral-effect",
                  detail.behavioral_effect,
                )}
                onChange={(value) => onChange({ behavioral_effect: value })}
              />
              <div className="border-t border-border pt-3 xl:col-span-3">
                <JournalValuePicker
                  label="Felt refreshed (optional)"
                  value={detail.recovery_timing}
                  options={recoveryOptions}
                  presentation={getLogFormOptionPresentation(
                    "social-energy-recovery-timing",
                    detail.recovery_timing,
                  )}
                  onChange={(value) => onChange({ recovery_timing: value })}
                />
              </div>
            </div>
          </div>
        </div>
      </JournalFormSection>

      <JournalFormSection>
        <JournalFormSectionHeader
          icon={UserRound}
          iconSize="md"
          title="Social context"
          description="Add factual details about the setting and people."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <JournalValuePicker
            label="Interaction"
            value={detail.interaction_context}
            options={interactionContextOptions}
            presentation={getLogFormOptionPresentation(
              "social-energy-interaction-context",
              detail.interaction_context,
            )}
            onChange={(value) => onChange({ interaction_context: value })}
          />
          <JournalField label="Group size" htmlFor={groupSizeId}>
            <div className="relative flex h-12 items-center rounded-md border border-border bg-card pr-3 pl-14 shadow-xs transition-[color,box-shadow] hover:border-primary/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg",
                  SOCIAL_ENERGY_GROUP_SIZE_PRESENTATION.iconTileClassName,
                )}
              >
                <GroupSizeIcon className="size-5" />
              </span>
              <Input
                id={groupSizeId}
                type="number"
                min={1}
                value={detail.group_size ?? ""}
                className="h-auto w-8 min-w-8 rounded-none border-0 bg-transparent p-0 font-semibold shadow-none [appearance:textfield] focus-visible:border-0 focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                onChange={(event) =>
                  onChange({
                    group_size: event.target.value
                      ? Number(event.target.value)
                      : null,
                  })
                }
              />
              {detail.group_size != null ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none ml-1 text-xs font-medium text-muted-foreground"
                >
                  {detail.group_size === 1 ? "person" : "people"}
                </span>
              ) : null}
            </div>
          </JournalField>
          <JournalValuePicker
            label="Familiarity"
            value={detail.familiarity}
            options={familiarityOptions}
            presentation={getLogFormOptionPresentation(
              "social-energy-familiarity",
              detail.familiarity,
            )}
            onChange={(value) => onChange({ familiarity: value })}
          />
          <JournalValuePicker
            label="Setting"
            value={detail.setting}
            options={settingOptions}
            presentation={getLogFormOptionPresentation(
              "social-energy-setting",
              detail.setting,
            )}
            onChange={(value) => onChange({ setting: value })}
          />
        </div>
      </JournalFormSection>

      <JournalFormSection>
        <JournalFormSectionHeader
          icon={Sparkles}
          iconSize="md"
          title="Contributing factors"
          description="Optionally note what may have influenced the experience."
        />
        <div className="mt-4">
          <LookupTagSelector
            kind="social-energy-factors"
            label="Factors"
            hideLabel
            indicatorStyle="selection-circle"
            addActionPlacement="after"
            value={detail.factor_ids}
            presentation="chips"
            addLabel="Add factor"
            onChange={(value) =>
              onChange({
                factor_ids: normalizeIds(value),
              })
            }
          />
        </div>
      </JournalFormSection>
    </>
  );
}

function SentimentFields({
  detail,
  onChange,
}: {
  detail: SentimentDetail;
  onChange: (patch: DetailPatch) => void;
}) {
  const [beforeEmotionOption, setBeforeEmotionOption] =
    useState<JournalLookupOption | null>(null);
  const [afterEmotionOption, setAfterEmotionOption] =
    useState<JournalLookupOption | null>(null);
  const shiftPresentation = getSentimentShiftPresentation(
    beforeEmotionOption?.name,
    afterEmotionOption?.name,
  );
  const ShiftIcon = shiftPresentation.icon;

  return (
    <>
      <JournalFormSection>
        <JournalFormSectionHeader
          icon={HeartHandshake}
          iconSize="md"
          title="Before and after"
          description="Record your own experience of the interaction."
        />
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">Before</h3>
            <LookupTagSelector
              kind="emotion-states"
              label="Emotional state"
              multiple={false}
              value={detail.before_state_id}
              presentation="chips"
              addLabel="Add emotional state"
              onSelectedOptionChange={setBeforeEmotionOption}
              onChange={(value) =>
                onChange({
                  before_state_id: firstId(value),
                })
              }
            />
            <div className="border-t border-border pt-3">
              <JournalValuePicker
                label="Connection (optional)"
                value={detail.before_connection}
                options={connectionOptions}
                presentation={getLogFormOptionPresentation(
                  "sentiment-connection",
                  detail.before_connection,
                )}
                onChange={(value) => onChange({ before_connection: value })}
              />
            </div>
          </div>

          <div
            role="status"
            aria-label={shiftPresentation.accessibleLabel}
            className="flex flex-col items-center justify-center gap-2"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full",
                shiftPresentation.indicatorClassName,
              )}
            >
              <ShiftIcon
                aria-hidden="true"
                strokeWidth={2.5}
                className={cn("size-8", shiftPresentation.iconClassName)}
              />
            </span>
            <span
              className={cn(
                "max-w-24 text-center text-xs font-semibold",
                shiftPresentation.labelClassName,
              )}
            >
              {shiftPresentation.label}
            </span>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <h3 className="text-sm font-semibold">After</h3>
            <LookupTagSelector
              kind="emotion-states"
              label="Emotional state"
              multiple={false}
              value={detail.after_state_id}
              presentation="chips"
              addLabel="Add emotional state"
              onSelectedOptionChange={setAfterEmotionOption}
              onChange={(value) =>
                onChange({
                  after_state_id: firstId(value),
                })
              }
            />
            <div className="border-t border-border pt-3">
              <JournalValuePicker
                label="Connection (optional)"
                value={detail.after_connection}
                options={connectionOptions}
                presentation={getLogFormOptionPresentation(
                  "sentiment-connection",
                  detail.after_connection,
                )}
                onChange={(value) => onChange({ after_connection: value })}
              />
            </div>
          </div>
        </div>
      </JournalFormSection>

      <JournalFormSection>
        <JournalFormSectionHeader
          icon={Activity}
          iconSize="md"
          title="Interaction dynamics"
          description="Optional context about how the exchange felt to you."
        />
        <div className="mt-4 space-y-3">
          <LookupTagSelector
            kind="interaction-dynamics"
            label="Key dynamics"
            indicatorStyle="selected-check"
            addActionPlacement="after"
            value={detail.dynamic_ids}
            presentation="chips"
            addLabel="Add dynamic"
            onChange={(value) =>
              onChange({
                dynamic_ids: normalizeIds(value),
              })
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            <JournalValuePicker
              label="Initiated by"
              value={detail.initiated_by}
              options={initiatedByOptions}
              presentation={getLogFormOptionPresentation(
                "sentiment-initiated-by",
                detail.initiated_by,
              )}
              onChange={(value) => onChange({ initiated_by: value })}
            />
            <JournalValuePicker
              label="Overall exchange"
              value={detail.overall_exchange}
              options={exchangeOptions}
              presentation={getLogFormOptionPresentation(
                "sentiment-overall-exchange",
                detail.overall_exchange,
              )}
              onChange={(value) => onChange({ overall_exchange: value })}
            />
          </div>
        </div>
      </JournalFormSection>
    </>
  );
}

function LogAtAGlance({ draft }: { draft: LogDraft }) {
  const Icon = formatCopy[draft.format].icon;
  const facts = getAtAGlanceFacts(draft);

  return (
    <SurfaceCard className="p-4">
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-primary" />
        <h2 className="font-sans text-base font-semibold">Log at a glance</h2>
      </div>
      <dl className="mt-3 divide-y divide-border">
        {facts.map(([label, value]) => (
          <div key={label} className="py-2.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 break-words text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </SurfaceCard>
  );
}

function LogPatternsCard({
  loading,
  error,
  data,
}: {
  loading: boolean;
  error: ApiError | null;
  data: ReturnType<typeof useLogPatterns>["data"];
}) {
  return (
    <SurfaceCard className="p-4">
      <div className="flex items-center gap-2.5">
        <BarChart3 className="size-4 text-primary" />
        <h2 className="font-sans text-base font-semibold">Recent pattern</h2>
      </div>
      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading recorded patterns...
        </p>
      ) : error ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Patterns are unavailable right now.
        </p>
      ) : data ? (
        <div className="mt-3 space-y-3">
          <p className="text-sm">
            <span className="font-semibold">{data.total}</span> completed logs
            in the last {data.window.days} days.
          </p>
          {data.episode.total_duration_minutes > 0 ? (
            <p className="text-sm text-muted-foreground">
              {data.episode.total_duration_minutes} recorded episode minutes.
            </p>
          ) : null}
          {(Object.entries(data.by_format) as Array<[LogFormat, number]>)
            .slice(0, 3)
            .map(([itemFormat, count]) => (
              <div
                key={itemFormat}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="truncate text-muted-foreground">
                  {getJournalLogFormatPresentation(itemFormat).label}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            Patterns reflect only what you have recorded.
          </p>
        </div>
      ) : null}
    </SurfaceCard>
  );
}

function makeInitialDraft(
  format: LogFormat,
  existingLog: Log | null,
  queryEvent: string | null,
  queryChapter: string | null,
  queryContact: string | null,
): LogDraft {
  if (existingLog && existingLog.format === format) {
    return {
      format,
      title: existingLog.title,
      event_id: existingLog.event?.id ?? null,
      chapter_id: existingLog.chapter?.id ?? null,
      primary_contact_id: existingLog.primary_contact?.id ?? null,
      occurred_at: existingLog.occurred_at,
      current_step: existingLog.current_step || "details",
      detail: cloneDetail(existingLog.detail),
    };
  }

  return {
    format,
    title: "",
    event_id: queryEvent || null,
    chapter_id: queryChapter,
    primary_contact_id: queryContact || null,
    occurred_at: queryEvent ? null : new Date().toISOString(),
    current_step: "details",
    detail: emptyDetail(format),
  };
}

function emptyDetail(format: LogFormat): LogDraft["detail"] {
  switch (format) {
    case "episode":
      return {
        category_id: null,
        ended_at: null,
        is_ongoing: false,
        characteristic_ids: [],
        context_tag_ids: [],
      };
    case "social_energy":
      return {
        before_state: "",
        battery_effect: "",
        mood_shift: "",
        behavioral_effect: "",
        recovery_timing: "",
        interaction_context: "",
        group_size: null,
        familiarity: "",
        setting: "",
        factor_ids: [],
      };
    case "sentiment":
      return {
        before_state_id: null,
        after_state_id: null,
        before_connection: "",
        after_connection: "",
        dynamic_ids: [],
        initiated_by: "",
        overall_exchange: "",
      };
  }
}

function cloneDetail(detail: Log["detail"]): LogDraft["detail"] {
  if ("characteristic_ids" in detail) {
    return {
      ...detail,
      characteristic_ids: [...detail.characteristic_ids],
      context_tag_ids: [...detail.context_tag_ids],
    };
  }
  if ("factor_ids" in detail) {
    return { ...detail, factor_ids: [...detail.factor_ids] };
  }
  return { ...detail, dynamic_ids: [...detail.dynamic_ids] };
}

async function createLog(draft: LogDraft): Promise<Log> {
  switch (draft.format) {
    case "episode":
      return journalApi.createLog({
        ...commonWrite(draft),
        format: "episode",
        detail: draft.detail as EpisodeDetail,
      } satisfies CreateLogRequest<"episode">);
    case "social_energy":
      return journalApi.createLog({
        ...commonWrite(draft),
        format: "social_energy",
        detail: draft.detail as SocialEnergyDetail,
      } satisfies CreateLogRequest<"social_energy">);
    case "sentiment":
      return journalApi.createLog({
        ...commonWrite(draft),
        format: "sentiment",
        detail: draft.detail as SentimentDetail,
      } satisfies CreateLogRequest<"sentiment">);
  }
}

async function updateLog(
  id: ApiId,
  draft: LogDraft,
  expectedRevision: number,
): Promise<Log> {
  const common = { ...commonWrite(draft), expected_revision: expectedRevision };
  switch (draft.format) {
    case "episode":
      return journalApi.updateLog(id, {
        ...common,
        detail: draft.detail as EpisodeDetail,
      } satisfies UpdateLogRequest<"episode">);
    case "social_energy":
      return journalApi.updateLog(id, {
        ...common,
        detail: draft.detail as SocialEnergyDetail,
      } satisfies UpdateLogRequest<"social_energy">);
    case "sentiment":
      return journalApi.updateLog(id, {
        ...common,
        detail: draft.detail as SentimentDetail,
      } satisfies UpdateLogRequest<"sentiment">);
  }
}

function commonWrite(draft: LogDraft) {
  return {
    title: draft.title,
    event_id: draft.event_id,
    chapter_id: draft.chapter_id,
    primary_contact_id: draft.primary_contact_id,
    occurred_at: draft.occurred_at,
    current_step: draft.current_step,
  };
}

function normalizeChapterQuery(
  chapter: string | null,
  event: string | null,
): string | null {
  return event && chapter && chapter !== "event" ? chapter : null;
}

function isMeaningfulLogDraft(draft: LogDraft) {
  if (
    draft.title.trim() ||
    draft.event_id != null ||
    draft.primary_contact_id != null
  ) {
    return true;
  }

  if (draft.format === "episode") {
    const detail = draft.detail as EpisodeDetail;
    return Boolean(
      detail.category_id ||
      detail.ended_at ||
      detail.is_ongoing ||
      detail.characteristic_ids.length ||
      detail.context_tag_ids.length,
    );
  }

  if (draft.format === "social_energy") {
    const detail = draft.detail as SocialEnergyDetail;
    return Boolean(
      detail.before_state ||
      detail.battery_effect ||
      detail.mood_shift ||
      detail.behavioral_effect ||
      detail.recovery_timing ||
      detail.interaction_context ||
      detail.group_size ||
      detail.familiarity ||
      detail.setting ||
      detail.factor_ids.length,
    );
  }

  const detail = draft.detail as SentimentDetail;
  return Boolean(
    detail.before_state_id ||
    detail.after_state_id ||
    detail.before_connection ||
    detail.after_connection ||
    detail.dynamic_ids.length ||
    detail.initiated_by ||
    detail.overall_exchange,
  );
}

function validateForCompletion(draft: LogDraft) {
  const errors: string[] = [];
  if (!draft.occurred_at) errors.push("Add when this happened.");

  if (draft.format === "episode") {
    const detail = draft.detail as EpisodeDetail;
    if (!draft.title.trim()) errors.push("Add an episode label.");
    if (!detail.category_id) errors.push("Choose a category.");
    if (!detail.is_ongoing && !detail.ended_at) {
      errors.push("Add an end time or mark the episode as still ongoing.");
    }
    if (
      draft.occurred_at &&
      detail.ended_at &&
      new Date(detail.ended_at) < new Date(draft.occurred_at)
    ) {
      errors.push("The end time cannot be before the start time.");
    }
  }

  if (draft.format === "social_energy") {
    const detail = draft.detail as SocialEnergyDetail;
    if (!detail.battery_effect)
      errors.push("Choose the social battery effect.");
    if (!detail.mood_shift) errors.push("Choose the mood shift.");
    if (!detail.behavioral_effect) {
      errors.push("Choose the behavioral effect.");
    }
    if (!detail.interaction_context) {
      errors.push("Choose the interaction context.");
    }
    if (detail.group_size == null || detail.group_size < 1) {
      errors.push("Add the group size.");
    }
    if (!detail.familiarity) {
      errors.push("Choose the familiarity.");
    }
    if (!detail.setting) {
      errors.push("Choose the setting.");
    }
  }

  if (draft.format === "sentiment") {
    const detail = draft.detail as SentimentDetail;
    if (!draft.primary_contact_id) {
      errors.push("Choose the person in this interaction.");
    }
    if (!detail.before_state_id) {
      errors.push("Choose the emotional state before.");
    }
    if (!detail.after_state_id) {
      errors.push("Choose the emotional state after.");
    }
  }

  return errors;
}

function getAtAGlanceFacts(draft: LogDraft): Array<[string, string]> {
  const occurred = draft.occurred_at
    ? new Date(draft.occurred_at).toLocaleString()
    : "Not set";
  if (draft.format === "episode") {
    const detail = draft.detail as EpisodeDetail;
    return [
      ["Label", draft.title.trim() || "Untitled episode"],
      ["Started", occurred],
      [
        "Timing",
        detail.is_ongoing
          ? "Still ongoing"
          : detail.ended_at
            ? `Ended ${new Date(detail.ended_at).toLocaleString()}`
            : "End not set",
      ],
    ];
  }
  if (draft.format === "social_energy") {
    const detail = draft.detail as SocialEnergyDetail;
    return [
      ["Occurred", occurred],
      ["Battery", optionLabel(batteryOptions, detail.battery_effect)],
      ["Mood", optionLabel(moodOptions, detail.mood_shift)],
      ["Behavior", optionLabel(behaviorOptions, detail.behavioral_effect)],
    ];
  }
  const detail = draft.detail as SentimentDetail;
  return [
    ["Occurred", occurred],
    [
      "Before connection",
      optionLabel(connectionOptions, detail.before_connection),
    ],
    [
      "After connection",
      optionLabel(connectionOptions, detail.after_connection),
    ],
    ["Exchange", optionLabel(exchangeOptions, detail.overall_exchange)],
  ];
}

function optionLabel(
  options: ReadonlyArray<readonly [string, string]>,
  value: string,
) {
  return (
    options.find(([optionValue]) => optionValue === value)?.[1] ?? "Not set"
  );
}

function normalizeIds(value: ApiId | ApiId[] | null) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function firstId(value: ApiId | ApiId[] | null) {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toDateTimeInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoTimestamp(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function mapAutosaveStatus(
  status: JournalAutosaveStatus,
): "pristine" | "unsaved" | "saving" | "saved" | "error" {
  return (
    {
      idle: "pristine",
      dirty: "unsaved",
      saving: "saving",
      saved: "saved",
      error: "error",
    } as const
  )[status];
}

function apiErrorMessages(error: ApiError) {
  const fieldMessages = error.fieldErrors
    ? Object.values(error.fieldErrors).flat()
    : [];
  return fieldMessages.length ? fieldMessages : [error.message];
}
