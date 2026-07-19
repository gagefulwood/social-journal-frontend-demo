"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  CircleAlert,
  Link2,
  Loader2,
  Paperclip,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { ReflectionMediaField } from "@/components/journals/media/ReflectionMediaField";
import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { CarryForwardEditor } from "@/components/journals/reflections/CarryForwardEditor";
import { isLegacyReflection } from "@/components/journals/reflections/LegacyReflectionDetailView";
import {
  EmotionalReflectionFields,
  FreeReflectionFields,
  InteractionReflectionFields,
  MomentReflectionFields,
} from "@/components/journals/reflections/ReflectionLensFields";
import {
  REFLECTION_STEPS,
  createEmptyReflectionDraft,
  isMeaningfulReflectionDraft,
  reflectionToDraft,
  toCreateReflectionRequest,
  toUpdateReflectionRequest,
  validateReflectionForCompletion,
  type ReflectionDraft,
} from "@/components/journals/reflections/reflectionDraft";
import { JournalActionFooter } from "@/components/journals/shared/JournalActionFooter";
import { JournalDraftSaveStatus } from "@/components/journals/shared/JournalDraftSaveStatus";
import { JournalFormSection } from "@/components/journals/shared/JournalFormSection";
import { JournalFormSectionHeader } from "@/components/journals/shared/JournalFormSectionHeader";
import { JournalOccurrencePicker } from "@/components/journals/shared/JournalOccurrencePicker";
import { JournalRelatedContextSelector } from "@/components/journals/shared/JournalRelatedContextSelector";
import {
  JournalStepProgress,
  type JournalStep,
} from "@/components/journals/shared/JournalStepProgress";
import {
  JournalWorkspaceLayout,
  JournalWorkspaceMain,
  JournalWorkspaceRail,
} from "@/components/journals/shared/JournalWorkspaceLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useJournalAutosave } from "@/hooks/useJournalAutosave";
import { journalApi } from "@/lib/api/journalApi";
import { eventsApi } from "@/lib/api/eventsApi";
import {
  getReflectionLensPresentation,
  getJournalStatusPresentation,
} from "@/lib/presentation/journalPresentation";
import type { ApiId } from "@/types/api";
import type {
  EmotionalReflectionDetail,
  FreeReflectionDetail,
  InteractionReflectionDetail,
  MomentReflectionDetail,
  Reflection,
  ReflectionLens,
} from "@/types/journals";

type ReflectionEditorProps =
  | { lens: ReflectionLens; reflectionId?: never }
  | { lens?: never; reflectionId: ApiId };

const lensCopy: Record<
  ReflectionLens,
  { title: string; description: string; stepLabels: Record<string, string> }
> = {
  interaction: {
    title: "Reflect on an interaction",
    description: "Focus on one exchange and what it meant to you.",
    stepLabels: {
      focus: "Focus",
      exchange: "Exchange",
      meaning: "Meaning",
      carry_forward: "Carry forward",
      review: "Review",
    },
  },
  moment: {
    title: "Reflect on a moment",
    description: "Stay with one part of the experience and why it matters.",
    stepLabels: {
      focus: "Focus",
      notice: "Notice",
      meaning: "Meaning",
      carry_forward: "Carry forward",
      review: "Review",
    },
  },
  emotional: {
    title: "Understand what you felt",
    description:
      "Name the emotional experience, then explore what it was communicating.",
    stepLabels: {
      focus: "Focus",
      feelings: "Feelings",
      understand: "Understand",
      carry_forward: "Carry forward",
      review: "Review",
    },
  },
  free: {
    title: "Free reflection",
    description: "Write freely, with optional context and supporting media.",
    stepLabels: {
      writing: "Writing",
      carry_forward: "Carry forward",
      review: "Review",
    },
  },
};

export function ReflectionEditor(props: ReflectionEditorProps) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(Boolean(props.reflectionId));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!props.reflectionId) return;
    let active = true;
    void journalApi
      .getReflection(props.reflectionId)
      .then((result) => {
        if (!active) return;
        if (isLegacyReflection(result)) {
          setLoadError(
            "Legacy reflections are read-only and cannot be edited.",
          );
          return;
        }
        if (!(String(result.format) in REFLECTION_STEPS)) {
          setLoadError("This reflection format cannot be edited.");
          return;
        }
        setReflection(result);
      })
      .catch(() => {
        if (active) setLoadError("This reflection could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [props.reflectionId]);

  if (loading) return <ReflectionEditorSkeleton />;

  if (loadError || (props.reflectionId && !reflection)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <JournalFormSection className="p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />
          <h1 className="mt-3 text-xl font-semibold">
            {loadError?.includes("read-only")
              ? "Reflection is read only"
              : "Reflection unavailable"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loadError ?? "This reflection was not found."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/journals">Back to journals</Link>
            </Button>
            {props.reflectionId ? (
              <Button asChild>
                <Link href={`/journals/reflections/${props.reflectionId}`}>
                  View reflection
                </Link>
              </Button>
            ) : null}
          </div>
        </JournalFormSection>
      </main>
    );
  }

  const lens = reflection?.format ?? props.lens;
  if (!lens) return null;

  return (
    <ReflectionEditorForm
      key={reflection ? `${reflection.id}-${reflection.revision}` : lens}
      lens={lens}
      initialReflection={reflection}
    />
  );
}

function ReflectionEditorForm({
  lens,
  initialReflection,
}: {
  lens: ReflectionLens;
  initialReflection: Reflection | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEventId = initialReflection ? null : searchParams.get("event");
  const queryContactId = initialReflection ? null : searchParams.get("contact");
  const [draft, setDraft] = useState<ReflectionDraft>(() => {
    const next = initialReflection
      ? reflectionToDraft(initialReflection)
      : createEmptyReflectionDraft(lens);

    if (!initialReflection) {
      next.eventId = queryEventId;
      if (queryContactId != null) {
        next.primaryContactId = queryContactId;
        next.contactIds = [queryContactId];
      }
    }

    return next;
  });
  useEffect(() => {
    if (initialReflection || queryEventId == null) {
      return;
    }

    let active = true;
    void eventsApi
      .get(queryEventId)
      .then((event) => {
        if (!active) return;
        const eventOccurredAt = toLocalDateTimeInput(event.event_timestamp);
        setDraft((current) => {
          if (String(current.eventId) !== String(queryEventId)) {
            return current;
          }

          if (current.occurredAt) return current;
          return {
            ...current,
            occurredAt: eventOccurredAt,
          };
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [initialReflection, queryEventId]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [completing, setCompleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const presentation = getReflectionLensPresentation(lens);
  const copy = lensCopy[lens];
  const steps = REFLECTION_STEPS[lens];
  const currentStepIndex = Math.max(0, steps.indexOf(draft.currentStep));
  const currentStep = steps[currentStepIndex] ?? steps[0];

  const autosave = useJournalAutosave<ReflectionDraft, Reflection>({
    value: draft,
    existingEntry: initialReflection,
    isMeaningful: isMeaningfulReflectionDraft,
    getId: (entry) => entry.id,
    getRevision: (entry) => entry.revision,
    create: (value) =>
      journalApi.createReflection(toCreateReflectionRequest(value)),
    update: (id, value, revision) => {
      const request = toUpdateReflectionRequest(value, revision);
      if (initialReflection?.status === "completed") {
        delete request.carry_forward;
      }

      return journalApi.updateReflection(id, request);
    },
    onCreated: (entry) => {
      window.history.replaceState(
        window.history.state,
        "",
        `/journals/reflections/${entry.id}/edit`,
      );
    },
  });

  const progressSteps = useMemo<JournalStep[]>(
    () =>
      steps.map((step, index) => ({
        id: step,
        label: copy.stepLabels[step] ?? step,
        state:
          index < currentStepIndex
            ? "completed"
            : index === currentStepIndex
              ? "current"
              : step === "carry_forward"
                ? "optional"
                : "upcoming",
        canNavigate:
          initialReflection?.status === "completed" ||
          index <= currentStepIndex,
      })),
    [copy.stepLabels, currentStepIndex, initialReflection?.status, steps],
  );

  function setStep(step: string) {
    setDraft((current) => ({ ...current, currentStep: step }));
    setValidationErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setDetail(detail: ReflectionDraft["detail"]) {
    setDraft((current) => ({ ...current, detail }));
  }

  function handleContactChange(value: ApiId | ApiId[] | null) {
    const contactIds = Array.isArray(value)
      ? value
      : value == null
        ? []
        : [value];
    setDraft((current) => {
      const primaryStillSelected = contactIds.some(
        (id) => String(id) === String(current.primaryContactId),
      );
      return {
        ...current,
        contactIds,
        primaryContactId: primaryStillSelected
          ? current.primaryContactId
          : (contactIds[0] ?? null),
      };
    });
  }

  async function saveDraft() {
    await autosave.flush();
    if (autosave.getCurrentEntryId() != null) {
      toast.success(
        initialReflection?.status === "completed"
          ? "Changes saved"
          : "Draft saved",
      );
    }
  }

  async function completeReflection() {
    const errors = validateReflectionForCompletion(draft);
    if (errors.length) {
      toast.error(
        "Review the missing information before completing this reflection.",
      );
      setStep("review");
      setValidationErrors(errors);
      return;
    }

    setCompleting(true);
    setValidationErrors([]);
    try {
      await autosave.flush();
      const id = autosave.getCurrentEntryId();
      const revision = autosave.getCurrentRevision();
      if (id == null) {
        throw new Error("The draft was not saved.");
      }
      await journalApi.completeReflection(id, { expected_revision: revision });
      toast.success("Reflection completed");
      router.push(`/journals/reflections/${id}`);
    } catch (caught) {
      const message =
        typeof caught === "object" && caught && "message" in caught
          ? String(caught.message)
          : "The reflection could not be completed.";
      setValidationErrors([message]);
      toast.error(message);
    } finally {
      setCompleting(false);
    }
  }

  async function navigateAfterSave(href: string) {
    if (leaving) return;

    setLeaving(true);
    try {
      await autosave.flush();
      router.push(href);
    } catch {
      setLeaving(false);
      toast.error(
        "Your latest changes could not be saved. Retry before leaving this reflection.",
      );
    }
  }

  async function finishEditing() {
    const id = autosave.getCurrentEntryId();
    if (id != null) await navigateAfterSave(`/journals/reflections/${id}`);
  }

  const saveState = {
    idle: "pristine",
    dirty: "unsaved",
    saving: "saving",
    saved: "saved",
    error: "error",
  }[autosave.status] as "pristine" | "unsaved" | "saving" | "saved" | "error";

  return (
    <main className="mx-auto w-full max-w-[88rem] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={leaving}
          onClick={() => void navigateAfterSave("/journals")}
        >
          {leaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowLeft className="size-4" />
          )}
          Back
        </Button>
      </div>

      <header className="mb-5 flex min-w-0 items-start gap-3">
        <JournalIconTile presentation={presentation} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-sans text-2xl font-semibold tracking-tight md:text-3xl">
              {copy.title}
            </h1>
            <JournalSemanticChip presentation={presentation} size="compact" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {copy.description}
          </p>
        </div>
      </header>

      <JournalStepProgress
        steps={progressSteps}
        className="mb-5"
        onStepChange={setStep}
      />

      <JournalWorkspaceLayout>
        <JournalWorkspaceMain>
          {lens === "free" && currentStep === "writing" ? (
            <JournalFormSection className="space-y-4">
              <JournalFormSectionHeader
                icon={BookOpenText}
                title="Title"
                description="Use a title that will help you recognize this reflection later."
              />
              <Input
                value={draft.title}
                placeholder="What is this reflection about?"
                className="h-11 text-base font-semibold"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </JournalFormSection>
          ) : null}

          {(currentStep === "focus" ||
            (lens === "free" && currentStep === "writing")) && (
            <ReflectionContextFields
              lens={lens}
              draft={draft}
              onContactChange={handleContactChange}
              onChange={setDraft}
            />
          )}

          {lens === "interaction" && currentStep === "exchange" ? (
            <InteractionReflectionFields
              step="exchange"
              value={draft.detail as InteractionReflectionDetail}
              onChange={(detail) => setDetail(detail)}
            />
          ) : null}
          {lens === "interaction" && currentStep === "meaning" ? (
            <InteractionReflectionFields
              step="meaning"
              value={draft.detail as InteractionReflectionDetail}
              onChange={(detail) => setDetail(detail)}
            />
          ) : null}

          {lens === "moment" &&
          ["focus", "notice", "meaning"].includes(currentStep) ? (
            <MomentReflectionFields
              step={currentStep}
              value={draft.detail as MomentReflectionDetail}
              onChange={(detail) => setDetail(detail)}
            />
          ) : null}

          {lens === "emotional" &&
          ["feelings", "understand"].includes(currentStep) ? (
            <EmotionalReflectionFields
              step={currentStep}
              value={draft.detail as EmotionalReflectionDetail}
              onChange={(detail) => setDetail(detail)}
            />
          ) : null}

          {lens === "free" && currentStep === "writing" ? (
            <FreeReflectionFields
              value={draft.detail as FreeReflectionDetail}
              onChange={(detail) => setDetail(detail)}
            />
          ) : null}

          {(currentStep === "meaning" ||
            currentStep === "understand" ||
            (lens === "free" && currentStep === "writing")) && (
            <JournalFormSection className="space-y-4">
              <JournalFormSectionHeader
                icon={Paperclip}
                title="Supporting media"
                description="Optional photos, audio, video, or files that support your own reflection."
              />
              <ReflectionMediaField
                value={draft.attachments}
                coverMediaAssetId={draft.coverMediaAssetId}
                onChange={(attachments) =>
                  setDraft((current) => ({ ...current, attachments }))
                }
                onCoverChange={(coverMediaAssetId) =>
                  setDraft((current) => ({ ...current, coverMediaAssetId }))
                }
              />
            </JournalFormSection>
          )}

          {currentStep === "carry_forward" ? (
            <JournalFormSection className="space-y-4">
              <JournalFormSectionHeader
                icon={Sparkles}
                title="Carry something forward"
                description={
                  initialReflection?.status === "completed"
                    ? "Published carry-forward items are locked and remain connected to this reflection."
                    : "Optional facts and observations are published only when you complete the reflection."
                }
              />
              <CarryForwardEditor
                value={draft.carryForward}
                suggestedContactId={draft.primaryContactId}
                suggestedEventId={draft.eventId}
                readOnly={initialReflection?.status === "completed"}
                onChange={(carryForward) =>
                  setDraft((current) => ({ ...current, carryForward }))
                }
              />
            </JournalFormSection>
          ) : null}

          {currentStep === "review" ? (
            <ReflectionReview
              draft={draft}
              validationErrors={validationErrors}
              onStepChange={setStep}
            />
          ) : null}

          <JournalActionFooter
            saveStatus={
              <JournalDraftSaveStatus
                state={saveState}
                message={
                  autosave.status === "saved" && autosave.savedAt
                    ? `${initialReflection?.status === "completed" ? "Changes" : "Draft"} saved at ${autosave.savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                    : autosave.error?.message
                }
                onRetry={autosave.retry}
              />
            }
            actions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !autosave.hasMeaningfulDraft || autosave.status === "saving"
                  }
                  onClick={() => void saveDraft()}
                >
                  {initialReflection?.status === "completed"
                    ? "Save changes"
                    : "Save draft"}
                </Button>
                {currentStepIndex > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(steps[currentStepIndex - 1])}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                ) : null}
                {initialReflection?.status === "completed" &&
                currentStepIndex < steps.length - 1 ? (
                  <Button
                    type="button"
                    disabled={autosave.status === "saving"}
                    onClick={() => setStep(steps[currentStepIndex + 1])}
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                ) : initialReflection?.status === "completed" ? (
                  <Button
                    type="button"
                    disabled={autosave.status === "saving"}
                    onClick={() => void finishEditing()}
                  >
                    Done
                  </Button>
                ) : currentStepIndex < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(steps[currentStepIndex + 1])}
                  >
                    Continue
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={completing || autosave.status === "saving"}
                    onClick={() => void completeReflection()}
                  >
                    {completing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Complete reflection
                  </Button>
                )}
              </>
            }
          />
        </JournalWorkspaceMain>

        <JournalWorkspaceRail>
          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader
              icon={BookOpenText}
              title="Reflection outline"
            />
            <ol className="space-y-2 border-t border-border/70 pt-3">
              {progressSteps.map((step, index) => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-full border text-xs ${step.state === "completed" ? "border-success bg-success-muted text-success" : step.state === "current" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
                  >
                    {step.state === "completed" ? (
                      <Check className="size-3" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={step.state === "current" ? "font-semibold" : ""}
                  >
                    {step.label}
                  </span>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {step.state === "completed"
                      ? "Complete"
                      : step.state === "current"
                        ? "In progress"
                        : step.state === "optional"
                          ? "Optional"
                          : "Not started"}
                  </span>
                </li>
              ))}
            </ol>
          </JournalFormSection>

          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader icon={Link2} title="Attached context" />
            <div className="space-y-2 border-t border-border/70 pt-3 text-sm">
              <ContextLink
                icon={UsersRound}
                label={
                  draft.contactIds.length
                    ? `${draft.contactIds.length} ${draft.contactIds.length === 1 ? "contact" : "contacts"}`
                    : "No contacts linked"
                }
                href={
                  draft.primaryContactId != null
                    ? `/contacts/${draft.primaryContactId}`
                    : undefined
                }
                onNavigate={(href) => void navigateAfterSave(href)}
              />
              <ContextLink
                icon={CalendarDays}
                label={
                  draft.eventId != null ? "Related moment" : "No moment linked"
                }
                href={
                  draft.eventId != null ? `/events/${draft.eventId}` : undefined
                }
                onNavigate={(href) => void navigateAfterSave(href)}
              />
            </div>
          </JournalFormSection>

          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader
              icon={ShieldCheck}
              title="Private by default"
            />
            <p className="border-t border-border/70 pt-3 text-sm leading-5 text-muted-foreground">
              Only you can view this reflection. Sensitive previews stay hidden
              until you choose to reveal them.
            </p>
            {initialReflection ? (
              <div className="pt-1">
                <span className="text-xs text-muted-foreground">Status: </span>
                <span className="text-xs font-medium">
                  {getJournalStatusPresentation(initialReflection.status).label}
                </span>
              </div>
            ) : null}
          </JournalFormSection>
        </JournalWorkspaceRail>
      </JournalWorkspaceLayout>
    </main>
  );
}

function ReflectionContextFields({
  lens,
  draft,
  onContactChange,
  onChange,
}: {
  lens: ReflectionLens;
  draft: ReflectionDraft;
  onContactChange: (value: ApiId | ApiId[] | null) => void;
  onChange: React.Dispatch<React.SetStateAction<ReflectionDraft>>;
}) {
  return (
    <JournalFormSection className="space-y-4">
      <JournalFormSectionHeader
        icon={UsersRound}
        iconSize="md"
        title="Context for this reflection"
        description={
          lens === "interaction"
            ? "Choose the people involved and optionally link a saved moment."
            : "Link people or a saved moment only when they help ground your reflection."
        }
      />
      <div className="space-y-4 border-t border-border/70 pt-4">
        <JournalRelatedContextSelector
          eventValue={draft.eventId}
          onEventChange={(eventId) =>
            onChange((current) => ({ ...current, eventId }))
          }
          eventLabel="Related moment"
          eventDescription="Optional"
          contactValue={draft.contactIds}
          onContactChange={onContactChange}
          contactMultiple
          contactLabel={
            lens === "interaction" ? "People in this interaction" : "People"
          }
          contactDescription={
            lens === "interaction"
              ? "At least one saved contact is required to complete."
              : "Optional"
          }
          collapseSelected
        />
        <JournalOccurrencePicker
          label="When did this occur?"
          description={
            lens === "interaction" ? "Required to complete" : "Optional"
          }
          value={draft.occurredAt}
          showRelativeLabel
          required={lens === "interaction"}
          onChange={(value) =>
            onChange((current) => ({ ...current, occurredAt: value }))
          }
        />
      </div>
    </JournalFormSection>
  );
}

function ReflectionReview({
  draft,
  validationErrors,
  onStepChange,
}: {
  draft: ReflectionDraft;
  validationErrors: string[];
  onStepChange: (step: string) => void;
}) {
  const rows = getReviewRows(draft);
  return (
    <div className="grid gap-4">
      {validationErrors.length ? (
        <ValidationErrors errors={validationErrors} />
      ) : null}
      <JournalFormSection className="space-y-4">
        <JournalFormSectionHeader
          icon={Check}
          iconTone="success"
          title="Review your reflection"
          description="Check what you recorded. Completing publishes only the carry-forward items you explicitly added."
        />
        <dl className="grid gap-3 border-t border-border/70 pt-4 md:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="rounded-md bg-muted/30 p-3">
              <dt className="text-xs font-medium text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-5">
                {row.value.trim() || "Not answered"}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2 border-t border-border/70 pt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onStepChange(
                draft.lens === "free"
                  ? "writing"
                  : REFLECTION_STEPS[draft.lens][1],
              )
            }
          >
            Edit reflection
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            {draft.attachments.length} media ·{" "}
            {draft.carryForward.facts.length +
              draft.carryForward.observations.length}{" "}
            carried forward
          </span>
        </div>
      </JournalFormSection>
    </div>
  );
}

function ValidationErrors({ errors }: { errors: string[] }) {
  return (
    <section
      role="alert"
      className="rounded-lg border border-destructive/25 bg-destructive/5 p-4"
    >
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <h2 className="text-sm font-semibold text-destructive">
            Complete the missing information
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Your work remains saved as a draft.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContextLink({
  icon: Icon,
  label,
  href,
  onNavigate,
}: {
  icon: typeof UsersRound;
  label: string;
  href?: string;
  onNavigate?: (href: string) => void;
}) {
  const content = (
    <span className="flex min-w-0 items-center gap-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
  return href ? (
    <Link
      href={href}
      className="block rounded-md outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={(event) => {
        if (!onNavigate) return;
        event.preventDefault();
        onNavigate(href);
      }}
    >
      {content}
    </Link>
  ) : (
    content
  );
}

function getReviewRows(draft: ReflectionDraft) {
  if (draft.lens === "free") {
    const detail = draft.detail as FreeReflectionDetail;
    return [
      { label: "Title", value: draft.title },
      { label: "Reflection", value: detail.body },
    ];
  }
  if (draft.lens === "interaction") {
    const detail = draft.detail as InteractionReflectionDetail;
    return [
      { label: "Topic or activity", value: detail.topic_or_activity },
      { label: "What you did", value: detail.user_actions },
      { label: "What they did", value: detail.contact_actions },
      { label: "Their response", value: detail.contact_response },
      { label: "Your response", value: detail.user_response },
      { label: "How you feel now", value: detail.feelings_now },
      { label: "Meaning now", value: detail.important_to_understand },
    ];
  }
  if (draft.lens === "moment") {
    const detail = draft.detail as MomentReflectionDetail;
    return [
      { label: "Chosen moment", value: detail.focus_moment },
      { label: "What happened", value: detail.what_happened },
      { label: "What you noticed", value: detail.noticed_around },
      { label: "Your response", value: detail.response },
      { label: "What stood out", value: detail.stood_out },
      { label: "Meaning now", value: detail.meaning_now },
      { label: "What to remember", value: detail.remember },
    ];
  }
  const detail = draft.detail as EmotionalReflectionDetail;
  return [
    { label: "Situation", value: detail.situation },
    {
      label: "How it showed up",
      value: detail.manifestations
        .map((item) => `${item.kind}: ${item.text}`)
        .join("\n"),
    },
    { label: "Connected factors", value: detail.connected_factors },
    { label: "What it communicated", value: detail.communicating },
    { label: "Understanding now", value: detail.understanding_now },
  ];
}

function ReflectionEditorSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[88rem] px-4 py-8 md:px-6">
      <Skeleton className="h-9 w-24" />
      <div className="mt-5 flex items-center gap-3">
        <Skeleton className="size-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>
      <Skeleton className="mt-6 h-24 w-full" />
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-[32rem] w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  );
}

function toLocalDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
