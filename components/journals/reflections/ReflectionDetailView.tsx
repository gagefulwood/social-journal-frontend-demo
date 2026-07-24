"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  FileHeart,
  Link2,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { ReflectionMediaGallery } from "@/components/journals/media/ReflectionMediaGallery";
import { DeleteReflectionAction } from "@/components/journals/reflections/DeleteReflectionAction";
import {
  LegacyReflectionDetailView,
  isLegacyReflection,
  type LegacyReflection,
} from "@/components/journals/reflections/LegacyReflectionDetailView";
import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { JournalStatusIndicator } from "@/components/presentation/JournalStatusIndicator";
import { JournalFormSection } from "@/components/journals/shared/JournalFormSection";
import { JournalFormSectionHeader } from "@/components/journals/shared/JournalFormSectionHeader";
import { JournalReferenceCard } from "@/components/journals/shared/JournalReferenceCard";
import {
  JournalWorkspaceLayout,
  JournalWorkspaceMain,
  JournalWorkspaceRail,
} from "@/components/journals/shared/JournalWorkspaceLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReflection } from "@/hooks/useJournal";
import {
  getJournalClassificationPresentation,
  getJournalStatusPresentation,
  UNSPECIFIED_JOURNAL_FORMAT_LABEL,
} from "@/lib/presentation/journalPresentation";
import type { ApiId } from "@/types/api";
import type {
  EmotionalReflectionDetail,
  FreeReflectionDetail,
  InteractionReflectionDetail,
  MomentReflectionDetail,
  Reflection,
} from "@/types/journals";

export function ReflectionDetailView({
  reflectionId,
}: {
  reflectionId: ApiId;
}) {
  const query = useReflection(reflectionId);
  const reflection = query.entry as Reflection | LegacyReflection | null;

  if (query.loading) return <ReflectionDetailSkeleton />;
  if (query.error || !reflection) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <JournalFormSection className="p-6 text-center">
          <CircleAlert className="mx-auto size-6 text-destructive" />
          <h1 className="mt-3 text-xl font-semibold">Reflection unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.error?.message ?? "This reflection was not found."}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/journals">Back to journals</Link>
          </Button>
        </JournalFormSection>
      </main>
    );
  }

  if (isLegacyReflection(reflection)) {
    return <LegacyReflectionDetailView reflection={reflection} />;
  }

  return <CompletedReflection key={reflection.id} reflection={reflection} />;
}

function CompletedReflection({ reflection }: { reflection: Reflection }) {
  const emotionalDetail =
    reflection.format === "emotional"
      ? (reflection.detail as EmotionalReflectionDetail)
      : null;
  const emotionNames =
    emotionalDetail?.emotion_summaries
      ?.map((emotion) => emotion.name)
      .join(", ") ||
    (emotionalDetail?.emotion_ids.length
      ? "Selected feelings unavailable."
      : "");

  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation("reflection", reflection.format);
  const statusPresentation = getJournalStatusPresentation(reflection.status);
  const title = getReflectionTitle(reflection);
  const isCompletedFreeTitle =
    reflection.format === "free" &&
    reflection.status === "completed" &&
    Boolean(reflection.title?.trim());
  const carryItems = [
    ...reflection.carry_forward.facts.map((item) => ({
      kind: "Fact" as const,
      item,
    })),
    ...reflection.carry_forward.observations.map((item) => ({
      kind: "Observation" as const,
      item,
    })),
  ];
  const visibleCarryItems = carryItems.slice(0, 3);
  const occurredAt = reflection.occurred_at
    ? new Date(reflection.occurred_at).toLocaleString()
    : null;

  return (
    <main className="mx-auto w-full max-w-[88rem] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/journals">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <JournalSemanticChip
          presentation={familyPresentation}
          size="compact"
          showIcon={false}
        />
        {formatPresentation ? (
          <JournalSemanticChip
            presentation={formatPresentation}
            size="compact"
            showIcon={false}
          />
        ) : null}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <JournalStatusIndicator presentation={statusPresentation} />
          {
            <Button asChild>
              <Link href={`/journals/reflections/${reflection.id}/edit`}>
                <Pencil className="size-4" />
                {reflection.status === "draft"
                  ? "Continue writing"
                  : "Edit reflection"}
              </Link>
            </Button>
          }
          <DeleteReflectionAction reflectionId={reflection.id} />
        </div>
      </div>

      <header className="mb-5 flex min-w-0 items-start gap-3">
        <JournalIconTile presentation={primaryPresentation} />
        <div className="min-w-0">
          <h1
            className={
              isCompletedFreeTitle
                ? "font-display text-3xl break-words md:text-4xl"
                : "font-sans text-3xl font-semibold tracking-tight break-words"
            }
          >
            {title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {reflection.primary_contact ? (
              <Link
                href={`/contacts/${reflection.primary_contact.id}`}
                className="font-medium text-primary hover:underline"
              >
                {reflection.primary_contact.display_name}
              </Link>
            ) : null}
            {reflection.primary_contact && reflection.event ? (
              <span aria-hidden="true">·</span>
            ) : null}
            {reflection.event ? (
              <Link
                href={`/events/${reflection.event.id}`}
                className="font-medium text-primary hover:underline"
              >
                {reflection.event.title}
              </Link>
            ) : null}
            {(reflection.primary_contact || reflection.event) && occurredAt ? (
              <span aria-hidden="true">·</span>
            ) : null}
            {occurredAt ? <span>{occurredAt}</span> : null}
          </div>
        </div>
      </header>

      {reflection.status === "draft" ? (
        <div className="mb-4 rounded-lg border border-primary/20 bg-accent/45 p-3 text-sm text-muted-foreground">
          This reflection is still a draft. Continue writing to review and
          complete it.
        </div>
      ) : null}

      <JournalWorkspaceLayout>
        <JournalWorkspaceMain>
          <ReflectionBody reflection={reflection} emotionNames={emotionNames} />
          <ReflectionMediaGallery
            attachments={reflection.attachments}
            limit={4}
          />

          {visibleCarryItems.length ? (
            <JournalFormSection className="space-y-4">
              <JournalFormSectionHeader
                icon={Sparkles}
                title="Carried forward"
                description={`${reflection.carry_forward.facts.length} facts · ${reflection.carry_forward.observations.length} observations`}
              />
              <div className="grid gap-3 border-t border-border/70 pt-4 md:grid-cols-3">
                {visibleCarryItems.map(({ kind, item }, index) => {
                  const contactId = item.target_contact_id;
                  const text = kind === "Fact" ? item.detail_value : item.body;
                  const published =
                    kind === "Fact"
                      ? item.published_fact_id != null
                      : item.published_observation_id != null;
                  return (
                    <article
                      key={item.id ?? `${kind}-${index}`}
                      className="rounded-md border border-border/80 bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-primary">
                          {kind}
                        </span>
                        {published ? (
                          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-success">
                            <CheckCircle2 className="size-3" /> Published
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 line-clamp-4 text-sm leading-5">
                        {text}
                      </p>
                      <Link
                        href={`/contacts/${contactId}`}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <UserRound className="size-3" /> View contact
                      </Link>
                    </article>
                  );
                })}
              </div>
              {carryItems.length > 3 ? (
                <p className="text-xs text-muted-foreground">
                  {carryItems.length - 3} more carried-forward{" "}
                  {carryItems.length - 3 === 1 ? "item" : "items"} recorded.
                </p>
              ) : null}
            </JournalFormSection>
          ) : null}
        </JournalWorkspaceMain>

        <JournalWorkspaceRail>
          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader
              icon={FileHeart}
              title="Reflection details"
            />
            <dl className="grid gap-3 border-t border-border/70 pt-3 text-sm">
              <DetailRow label="Family" value={familyPresentation.label} />
              <DetailRow
                label="Format"
                value={
                  formatPresentation?.label ?? UNSPECIFIED_JOURNAL_FORMAT_LABEL
                }
              />
              <DetailRow
                label="Occurred"
                value={occurredAt ?? "Not recorded"}
              />
              <DetailRow
                label="Completed"
                value={
                  reflection.completed_at
                    ? new Date(reflection.completed_at).toLocaleString()
                    : "Draft"
                }
              />
              <DetailRow
                label="Last edited"
                value={new Date(reflection.updated_timestamp).toLocaleString()}
              />
            </dl>
          </JournalFormSection>

          {reflection.event || reflection.contacts.length ? (
            <JournalFormSection className="space-y-3">
              <JournalFormSectionHeader icon={Link2} title="Related context" />
              <div className="space-y-2 border-t border-border/70 pt-3">
                {reflection.event ? (
                  <JournalReferenceCard
                    title={reflection.event.title}
                    eyebrow="Moment"
                    href={`/events/${reflection.event.id}`}
                    metadata={new Date(
                      reflection.event.start_timestamp,
                    ).toLocaleDateString()}
                    leading={
                      <CalendarDays className="size-4 shrink-0 text-warning" />
                    }
                  />
                ) : null}
                {reflection.contacts.map((contact) => (
                  <JournalReferenceCard
                    key={contact.id}
                    title={contact.display_name}
                    eyebrow="Contact"
                    href={`/contacts/${contact.id}`}
                    leading={
                      <UserRound className="size-4 shrink-0 text-primary" />
                    }
                  />
                ))}
              </div>
            </JournalFormSection>
          ) : null}

          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader icon={ShieldCheck} title="Privacy" />
            <div className="space-y-2 border-t border-border/70 pt-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <LockKeyhole className="size-4 shrink-0" /> Only you
              </p>
              {reflection.attachments.some((item) => item.is_sensitive) ? (
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0" /> Sensitive previews
                  hidden
                </p>
              ) : null}
            </div>
          </JournalFormSection>
        </JournalWorkspaceRail>
      </JournalWorkspaceLayout>
    </main>
  );
}

function ReflectionBody({
  reflection,
  emotionNames,
}: {
  reflection: Reflection;
  emotionNames: string;
}) {
  if (reflection.format === "free") {
    const detail = reflection.detail as FreeReflectionDetail;
    return (
      <JournalFormSection className="p-5 md:p-6">
        <div className="whitespace-pre-wrap text-base leading-8">
          {detail.body || "No writing recorded."}
        </div>
      </JournalFormSection>
    );
  }

  const groups = getGuidedGroups(reflection, emotionNames);
  return (
    <JournalFormSection className="space-y-5 p-5 md:p-6">
      <JournalFormSectionHeader
        icon={BookOpen}
        title="Reflection"
        description="Your recorded responses"
      />
      {groups.map((group) => (
        <section key={group.title} className="border-t border-border/70 pt-4">
          <h2 className="text-sm font-semibold text-primary">{group.title}</h2>
          <dl className="mt-3 grid gap-4 md:grid-cols-2">
            {group.rows.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm leading-6">
                  {row.value.trim() || "Not recorded"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </JournalFormSection>
  );
}

function getGuidedGroups(reflection: Reflection, emotionNames: string) {
  if (reflection.format === "interaction") {
    const detail = reflection.detail as InteractionReflectionDetail;
    return [
      {
        title: "The exchange",
        rows: [
          { label: "Topic or activity", value: detail.topic_or_activity },
          { label: "What you said or did", value: detail.user_actions },
          { label: "What they said or did", value: detail.contact_actions },
          { label: "How they responded", value: detail.contact_response },
          { label: "How you responded", value: detail.user_response },
        ],
      },
      {
        title: "What it meant",
        rows: [
          { label: "How you feel now", value: detail.feelings_now },
          {
            label: "Important to understand",
            value: detail.important_to_understand,
          },
          { label: "Additional writing", value: detail.additional_writing },
        ],
      },
    ];
  }

  if (reflection.format === "moment") {
    const detail = reflection.detail as MomentReflectionDetail;
    return [
      {
        title: "The moment",
        rows: [
          { label: "Chosen focus", value: detail.focus_moment },
          { label: "What happened", value: detail.what_happened },
          { label: "What you noticed", value: detail.noticed_around },
          { label: "How you responded", value: detail.response },
        ],
      },
      {
        title: "What it means now",
        rows: [
          { label: "What stood out", value: detail.stood_out },
          { label: "Meaning now", value: detail.meaning_now },
          { label: "What to remember", value: detail.remember },
          { label: "Additional writing", value: detail.additional_writing },
        ],
      },
    ];
  }

  const detail = reflection.detail as EmotionalReflectionDetail;
  return [
    {
      title: "Feelings and context",
      rows: [
        { label: "Situation", value: detail.situation },
        { label: "Selected feelings", value: emotionNames },
        {
          label: "How the feelings showed up",
          value: detail.manifestations
            .map((item) => `${capitalize(item.kind)}: ${item.text}`)
            .join("\n"),
        },
      ],
    },
    {
      title: "Understanding",
      rows: [
        { label: "Connected factors", value: detail.connected_factors },
        {
          label: "What the feelings communicated",
          value: detail.communicating,
        },
        { label: "Understanding now", value: detail.understanding_now },
        { label: "Additional writing", value: detail.additional_writing },
      ],
    },
  ];
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{value}</dd>
    </div>
  );
}

function getReflectionTitle(reflection: Reflection) {
  if (reflection.title?.trim()) return reflection.title;
  return {
    interaction: "Interaction reflection",
    moment: "Moment reflection",
    emotional: "Emotional reflection",
    free: "Free reflection",
  }[reflection.format];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ReflectionDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-[88rem] px-4 py-8 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="mt-6 h-10 w-2/3" />
      <Skeleton className="mt-3 h-4 w-1/2" />
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Skeleton className="h-[34rem]" />
        <Skeleton className="h-80" />
      </div>
    </main>
  );
}
