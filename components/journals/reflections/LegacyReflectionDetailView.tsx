import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileArchive,
  Link2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { DeleteReflectionAction } from "@/components/journals/reflections/DeleteReflectionAction";
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
import {
  getJournalClassificationPresentation,
  getJournalStatusPresentation,
  UNSPECIFIED_JOURNAL_FORMAT_LABEL,
} from "@/lib/presentation/journalPresentation";
import type { ApiId } from "@/types/api";
import type {
  CarryForwardDrafts,
  JournalContactSummary,
  JournalEventSummary,
} from "@/types/journals";

export type LegacyReflection = {
  id: ApiId;
  family: "reflection";
  format: "legacy";
  status: "completed";
  title: string;
  event: JournalEventSummary | null;
  primary_contact: JournalContactSummary | null;
  contacts: JournalContactSummary[];
  occurred_at: string | null;
  current_step: "legacy";
  revision: number;
  created_timestamp: string;
  updated_timestamp: string;
  completed_at: string | null;
  cover_attachment_id: ApiId | null;
  detail: {
    subtype: string;
    data: Record<string, unknown>;
    clarity_check: string;
  };
  attachments: [];
  carry_forward: CarryForwardDrafts;
};

export function isLegacyReflection(value: unknown): value is LegacyReflection {
  return (
    typeof value === "object" &&
    value !== null &&
    "family" in value &&
    value.family === "reflection" &&
    "format" in value &&
    value.format === "legacy"
  );
}

export function LegacyReflectionDetailView({
  reflection,
}: {
  reflection: LegacyReflection;
}) {
  const { familyPresentation, primaryPresentation } =
    getJournalClassificationPresentation(reflection.family, reflection.format);
  const statusPresentation = getJournalStatusPresentation("completed");
  const occurredAt = reflection.occurred_at
    ? new Date(reflection.occurred_at).toLocaleString()
    : null;
  const dataEntries = Object.entries(reflection.detail.data);

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
        <JournalStatusIndicator
          presentation={statusPresentation}
          className="ml-auto"
        />
        <DeleteReflectionAction reflectionId={reflection.id} />
      </div>

      <header className="mb-5 flex min-w-0 items-start gap-3">
        <JournalIconTile presentation={primaryPresentation} />
        <div className="min-w-0">
          <h1 className="font-sans text-3xl font-semibold tracking-tight break-words">
            {reflection.title || "Legacy reflection"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Preserved from an earlier journal format · Read only
          </p>
        </div>
      </header>

      <JournalWorkspaceLayout>
        <JournalWorkspaceMain>
          <JournalFormSection className="space-y-4 p-5 md:p-6">
            <JournalFormSectionHeader
              icon={FileArchive}
              iconTone="neutral"
              title="Preserved reflection"
              description="This is the original stored information. It has not been reclassified, summarized, or inferred."
            />
            <div className="grid gap-4 border-t border-border/70 pt-4">
              {reflection.detail.subtype ? (
                <LegacyField
                  label="Original type"
                  value={reflection.detail.subtype}
                />
              ) : null}
              {reflection.detail.clarity_check ? (
                <LegacyField
                  label="Clarity check"
                  value={reflection.detail.clarity_check}
                />
              ) : null}
              {dataEntries.length ? (
                dataEntries.map(([key, value]) => (
                  <LegacyField
                    key={key}
                    label={humanizeKey(key)}
                    value={formatStoredValue(value)}
                  />
                ))
              ) : (
                <p className="rounded-md bg-muted/30 p-4 text-sm text-muted-foreground">
                  No preserved reflection content was stored.
                </p>
              )}
            </div>
          </JournalFormSection>
        </JournalWorkspaceMain>

        <JournalWorkspaceRail>
          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader
              icon={FileArchive}
              iconTone="neutral"
              title="Legacy details"
            />
            <dl className="grid gap-3 border-t border-border/70 pt-3 text-sm">
              <DetailRow label="Family" value={familyPresentation.label} />
              <DetailRow
                label="Format"
                value={UNSPECIFIED_JOURNAL_FORMAT_LABEL}
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
                    : "Recorded as completed"
                }
              />
              <DetailRow
                label="Last preserved"
                value={new Date(reflection.updated_timestamp).toLocaleString()}
              />
            </dl>
          </JournalFormSection>

          {reflection.event || reflection.primary_contact ? (
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
                      <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                    }
                  />
                ) : null}
                {reflection.primary_contact ? (
                  <JournalReferenceCard
                    title={reflection.primary_contact.display_name}
                    eyebrow="Contact"
                    href={`/contacts/${reflection.primary_contact.id}`}
                    leading={
                      <UserRound className="size-4 shrink-0 text-muted-foreground" />
                    }
                  />
                ) : null}
              </div>
            </JournalFormSection>
          ) : null}

          <JournalFormSection className="space-y-3">
            <JournalFormSectionHeader icon={ShieldCheck} title="Privacy" />
            <div className="space-y-2 border-t border-border/70 pt-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <LockKeyhole className="size-4 shrink-0" /> Only you
              </p>
              <p>This completed legacy record cannot be edited.</p>
            </div>
          </JournalFormSection>
        </JournalWorkspaceRail>
      </JournalWorkspaceLayout>
    </main>
  );
}

function LegacyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border/70 bg-muted/20 p-4">
      <h2 className="text-xs font-medium text-muted-foreground">{label}</h2>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium break-words">{value}</dd>
    </div>
  );
}

function humanizeKey(value: string) {
  const withSpaces = value.replace(/[_-]+/g, " ").trim();
  return withSpaces
    ? withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
    : "Stored value";
}

function formatStoredValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "Not recorded";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
