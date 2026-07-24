"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Link2,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { LogEditor } from "@/components/journals/logs/LogEditor";
import {
  JournalWorkspaceLayout,
  JournalWorkspaceMain,
  JournalWorkspaceRail,
} from "@/components/journals/shared/JournalWorkspaceLayout";
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
import { JournalIconTile } from "@/components/presentation/JournalIconTile";
import { JournalSemanticChip } from "@/components/presentation/JournalSemanticChip";
import { JournalStatusIndicator } from "@/components/presentation/JournalStatusIndicator";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLog, useLogPatterns } from "@/hooks/useJournal";
import { journalApi } from "@/lib/api/journalApi";
import {
  getJournalClassificationPresentation,
  getJournalStatusPresentation,
  UNSPECIFIED_JOURNAL_FORMAT_LABEL,
} from "@/lib/presentation/journalPresentation";
import type { ApiId } from "@/types/api";
import type {
  EpisodeDetail,
  Log,
  SentimentDetail,
  SocialEnergyDetail,
} from "@/types/journals";

const labelMaps = {
  before_state: {
    open: "Open to socializing",
    neutral: "Neutral",
    reserved: "Reserved",
    depleted: "Already depleted",
  },
  battery_effect: {
    reduced: "Reduced",
    unchanged: "Unchanged",
    increased: "Increased",
  },
  mood_shift: {
    worse: "Worse",
    unchanged: "Unchanged",
    improved: "Improved",
  },
  behavioral_effect: {
    quieter: "Quieter",
    unchanged: "Unchanged",
    more_social: "More social",
    withdrew: "Withdrew",
  },
  recovery_timing: {
    not_yet: "Not yet",
    right_away: "Right away",
    later_day: "Later that day",
    next_day: "Next day",
  },
  interaction_context: {
    one_on_one: "One-on-one",
    small_group: "Small group",
    large_group: "Large group",
  },
  familiarity: {
    very_familiar: "Very familiar",
    familiar: "Familiar",
    mixed: "Mixed",
    unfamiliar: "Unfamiliar",
  },
  setting: {
    structured: "Structured",
    unstructured: "Unstructured",
  },
  connection: {
    close: "Close",
    neutral: "Neutral",
    distant: "More distant",
  },
  initiated_by: {
    me: "Me",
    them: "Them",
    mutual: "Mutual",
  },
  overall_exchange: {
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
  },
} as const;

export function LogEditScreen() {
  const params = useParams<{ id: string }>();
  const { entry, loading, error, refetch } = useLog(params.id);

  if (loading) return <JournalScreenState message="Loading draft..." />;
  if (error) {
    return (
      <JournalScreenState
        message={error.message}
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }
  if (!entry) return <JournalScreenState message="Log not found." />;
  if (String(entry.format) === "legacy") {
    return (
      <JournalScreenState
        message="Legacy logs are read-only."
        action={
          <Button asChild>
            <Link href={`/journals/logs/${entry.id}`}>View log</Link>
          </Button>
        }
      />
    );
  }

  return <LogEditor format={entry.format} existingLog={entry} />;
}

export function LogDetailScreen() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { entry, loading, error, refetch } = useLog(params.id);
  const [deleting, setDeleting] = useState(false);

  async function remove(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!entry || deleting) return;
    setDeleting(true);
    try {
      await journalApi.removeLog(entry.id);
      toast.success("Log deleted");
      router.push("/journals");
      router.refresh();
    } catch {
      toast.error("The log could not be deleted. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) return <JournalScreenState message="Loading log..." />;
  if (error) {
    return (
      <JournalScreenState
        message={error.message}
        action={<Button onClick={refetch}>Retry</Button>}
      />
    );
  }
  if (!entry) return <JournalScreenState message="Log not found." />;

  return (
    <LogDetail
      log={entry}
      deleting={deleting}
      onDelete={(event) => void remove(event)}
    />
  );
}

function LogDetail({
  log,
  deleting,
  onDelete,
}: {
  log: Log;
  deleting: boolean;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const { familyPresentation, formatPresentation, primaryPresentation } =
    getJournalClassificationPresentation("log", log.format);
  const statusPresentation = getJournalStatusPresentation(log.status);
  const lookupNames = lookupNamesFor(log);
  const patternParams = useMemo(
    () => ({
      format: String(log.format) === "legacy" ? undefined : log.format,
      days: 30,
    }),
    [log.format],
  );
  const patterns = useLogPatterns(patternParams);
  const displayTitle =
    log.title.trim() ||
    `${primaryPresentation.label} \u00b7 ${formatDate(log.occurred_at)}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 lg:px-6">
        <header className="mb-4 flex min-w-0 flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/journals">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {String(log.format) !== "legacy" ? (
              <Button asChild>
                <Link href={`/journals/logs/${log.id}/edit`}>
                  <Pencil className="size-4" />
                  {log.status === "draft" ? "Continue editing" : "Edit log"}
                </Link>
              </Button>
            ) : null}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this log?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes the log and its journal links. This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={deleting}
                    onClick={onDelete}
                  >
                    {deleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    {deleting ? "Deleting..." : "Delete log"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <JournalWorkspaceLayout>
          <JournalWorkspaceMain>
            <SurfaceCard className="p-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <JournalIconTile presentation={primaryPresentation} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                    <JournalStatusIndicator presentation={statusPresentation} />
                  </div>
                  <h1 className="mt-1 break-words font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
                    {displayTitle}
                  </h1>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="size-4" />
                    {formatDateTime(log.occurred_at)}
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-4 sm:p-5">
              <h2 className="font-sans text-base font-semibold">
                Recorded details
              </h2>
              <div className="mt-3">
                <LogDetailBody log={log} lookupNames={lookupNames} />
              </div>
            </SurfaceCard>

            {log.event || log.primary_contact ? (
              <SurfaceCard className="p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-primary" />
                  <h2 className="font-sans text-base font-semibold">
                    Related context
                  </h2>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {log.event ? (
                    <Link
                      href={`/events/${log.event.id}`}
                      className="rounded-md border border-border p-3 transition-colors hover:bg-muted/40"
                    >
                      <p className="text-xs font-medium text-primary">Moment</p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        {log.event.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {log.event.location || "No location recorded"}
                      </p>
                    </Link>
                  ) : null}
                  {log.primary_contact ? (
                    <Link
                      href={`/contacts/${log.primary_contact.id}`}
                      className="rounded-md border border-border p-3 transition-colors hover:bg-muted/40"
                    >
                      <p className="text-xs font-medium text-primary">Person</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                        <UserRound className="size-4" />
                        {log.primary_contact.display_name}
                      </p>
                    </Link>
                  ) : null}
                </div>
              </SurfaceCard>
            ) : null}
          </JournalWorkspaceMain>

          <JournalWorkspaceRail>
            <SurfaceCard className="p-4">
              <h2 className="font-sans text-base font-semibold">
                Entry details
              </h2>
              <dl className="mt-3 divide-y divide-border">
                <DetailRow label="Family" value={familyPresentation.label} />
                <DetailRow
                  label="Format"
                  value={
                    formatPresentation?.label ??
                    UNSPECIFIED_JOURNAL_FORMAT_LABEL
                  }
                />
                <DetailRow label="Status" value={statusPresentation.label} />
                <DetailRow
                  label="Completed"
                  value={formatDateTime(log.completed_at)}
                />
                <DetailRow
                  label="Last updated"
                  value={formatDateTime(log.updated_timestamp)}
                />
              </dl>
            </SurfaceCard>
            <SurfaceCard className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <h2 className="font-sans text-base font-semibold">
                  Recent pattern
                </h2>
              </div>
              {patterns.loading ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Loading recorded patterns...
                </p>
              ) : patterns.data ? (
                <p className="mt-3 text-sm">
                  <span className="font-semibold">{patterns.data.total}</span>{" "}
                  completed logs in the last {patterns.data.window.days} days.
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No pattern summary is available.
                </p>
              )}
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
                Patterns reflect only what you have recorded.
              </p>
            </SurfaceCard>
          </JournalWorkspaceRail>
        </JournalWorkspaceLayout>
      </div>
    </main>
  );
}

function LogDetailBody({
  log,
  lookupNames,
}: {
  log: Log;
  lookupNames: Map<string, string>;
}) {
  if (String(log.format) === "legacy") {
    return <LegacyLogBody detail={log.detail as unknown as LegacyLogDetail} />;
  }

  if (log.format === "episode") {
    const detail = log.detail as EpisodeDetail;
    return (
      <>
        <dl className="grid gap-x-6 md:grid-cols-2">
          <DetailRow
            label="Category"
            value={lookupLabel(lookupNames, detail.category_id)}
          />
          <DetailRow
            label="Timing"
            value={
              detail.is_ongoing
                ? "Still ongoing"
                : formatDateTime(detail.ended_at)
            }
          />
        </dl>
        <TagGroup
          label="Characteristics"
          ids={detail.characteristic_ids}
          names={lookupNames}
        />
        <TagGroup
          label="Possible context"
          ids={detail.context_tag_ids}
          names={lookupNames}
        />
      </>
    );
  }

  if (log.format === "social_energy") {
    const detail = log.detail as SocialEnergyDetail;
    return (
      <dl className="grid gap-x-6 md:grid-cols-2">
        <DetailRow
          label="Before socializing"
          value={enumLabel(labelMaps.before_state, detail.before_state)}
        />
        <DetailRow
          label="Social battery"
          value={enumLabel(labelMaps.battery_effect, detail.battery_effect)}
        />
        <DetailRow
          label="Mood shift"
          value={enumLabel(labelMaps.mood_shift, detail.mood_shift)}
        />
        <DetailRow
          label="Behavioral effect"
          value={enumLabel(
            labelMaps.behavioral_effect,
            detail.behavioral_effect,
          )}
        />
        <DetailRow
          label="Recovery"
          value={enumLabel(labelMaps.recovery_timing, detail.recovery_timing)}
        />
        <DetailRow
          label="Interaction"
          value={enumLabel(
            labelMaps.interaction_context,
            detail.interaction_context,
          )}
        />
        <DetailRow
          label="Group size"
          value={detail.group_size ? String(detail.group_size) : "Not recorded"}
        />
        <DetailRow
          label="Familiarity"
          value={enumLabel(labelMaps.familiarity, detail.familiarity)}
        />
        <DetailRow
          label="Setting"
          value={enumLabel(labelMaps.setting, detail.setting)}
        />
        <TagGroup
          label="Contributing factors"
          ids={detail.factor_ids}
          names={lookupNames}
        />
      </dl>
    );
  }

  const detail = log.detail as SentimentDetail;
  return (
    <>
      <dl className="grid gap-x-6 md:grid-cols-2">
        <DetailRow
          label="Before state"
          value={lookupLabel(lookupNames, detail.before_state_id)}
        />
        <DetailRow
          label="After state"
          value={lookupLabel(lookupNames, detail.after_state_id)}
        />
        <DetailRow
          label="Connection before"
          value={enumLabel(labelMaps.connection, detail.before_connection)}
        />
        <DetailRow
          label="Connection after"
          value={enumLabel(labelMaps.connection, detail.after_connection)}
        />
        <DetailRow
          label="Initiated by"
          value={enumLabel(labelMaps.initiated_by, detail.initiated_by)}
        />
        <DetailRow
          label="Overall exchange"
          value={enumLabel(labelMaps.overall_exchange, detail.overall_exchange)}
        />
      </dl>
      <TagGroup
        label="Interaction dynamics"
        ids={detail.dynamic_ids}
        names={lookupNames}
      />
    </>
  );
}

type LegacyLogDetail = {
  subtype?: string;
  body?: string;
  data?: Record<string, unknown>;
};

function LegacyLogBody({ detail }: { detail: LegacyLogDetail }) {
  const values = Object.entries(detail.data ?? {}).slice(0, 6);

  return (
    <div className="space-y-4">
      <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
        This historical Log is preserved in its original read-only format.
      </p>
      {detail.body?.trim() ? (
        <p className="whitespace-pre-wrap text-sm leading-6">{detail.body}</p>
      ) : null}
      <dl className="grid gap-x-6 md:grid-cols-2">
        {detail.subtype ? (
          <DetailRow label="Historical type" value={detail.subtype} />
        ) : null}
        {values.map(([key, value]) => (
          <DetailRow
            key={key}
            label={key.replaceAll("_", " ")}
            value={formatLegacyValue(value)}
          />
        ))}
      </dl>
    </div>
  );
}

function formatLegacyValue(value: unknown) {
  if (value == null || value === "") return "Not recorded";
  if (Array.isArray(value)) return value.map(String).slice(0, 6).join(", ");
  if (typeof value === "object") return "Structured value preserved";
  return String(value);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function TagGroup({
  label,
  ids,
  names,
}: {
  label: string;
  ids: ApiId[];
  names: Map<string, string>;
}) {
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {ids.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {ids.map((id) => (
            <span
              key={String(id)}
              className="rounded-md bg-primary/10 px-2 py-1 text-sm text-primary"
            >
              {lookupLabel(names, id)}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm">Not recorded</p>
      )}
    </div>
  );
}

function JournalScreenState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background p-4">
      <SurfaceCard className="mx-auto max-w-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </SurfaceCard>
    </main>
  );
}

function lookupNamesFor(log: Log) {
  const names = new Map<string, string>();
  if (String(log.format) === "legacy") return names;

  const summaries =
    log.format === "episode"
      ? [
          (log.detail as EpisodeDetail).category_summary,
          ...((log.detail as EpisodeDetail).characteristic_summaries ?? []),
          ...((log.detail as EpisodeDetail).context_tag_summaries ?? []),
        ]
      : log.format === "social_energy"
        ? [...((log.detail as SocialEnergyDetail).factor_summaries ?? [])]
        : [
            (log.detail as SentimentDetail).before_state_summary,
            (log.detail as SentimentDetail).after_state_summary,
            ...((log.detail as SentimentDetail).dynamic_summaries ?? []),
          ];

  summaries.forEach((summary) => {
    if (summary) names.set(String(summary.id), summary.name);
  });
  return names;
}

function lookupLabel(names: Map<string, string>, id: ApiId | null) {
  if (id == null) return "Not recorded";
  return names.get(String(id)) ?? "Recorded option";
}

function enumLabel<T extends Record<string, string>>(labels: T, value: string) {
  return labels[value as keyof T] ?? "Not recorded";
}

function formatDate(value: string | null) {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date not recorded"
    : date.toLocaleDateString();
}

function formatDateTime(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleString();
}
