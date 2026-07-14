import Link from "next/link";
import {
  CalendarCheck2,
  CalendarClock,
  HeartHandshake,
  NotebookPen,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { ContactTabHeader } from "@/components/contacts/ContactTabHeader";
import { Button } from "@/components/ui/button";
import type { EventListItem } from "@/types/events";
import type { ContactOverviewModel } from "./contact-overview-utils";

export type OverviewHeaderData = {
  lastShared: EventListItem | null;
  lastSharedLoading: boolean;
  lastSharedUnavailable: boolean;
  nextPlan: EventListItem | null;
  nextPlanLoading: boolean;
  nextPlanUnavailable: boolean;
  toJournalCount: number | null;
  toJournalLoading: boolean;
  toJournalUnavailable: boolean;
};

type RelationshipOverviewCardProps = {
  model: ContactOverviewModel;
  summary: OverviewHeaderData;
};

export function RelationshipOverviewCard({
  model,
  summary,
}: RelationshipOverviewCardProps) {
  return (
    <ContactTabHeader
      headingId="contact-overview-title"
      icon={HeartHandshake}
      title={`Relationship with ${model.firstName}`}
      subtitle="Shared activity and next steps."
      metadata={
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <OverviewMetadata
            icon={CalendarClock}
            label="Last shared"
            value={
              summary.lastSharedUnavailable
                ? "Unavailable"
                : summary.lastSharedLoading
                  ? "Loading…"
                  : summary.lastShared
                    ? formatOverviewDate(summary.lastShared.event_timestamp)
                    : "None yet"
            }
          />
          <MetadataSeparator />
          <OverviewMetadata
            icon={CalendarCheck2}
            label="Next plan"
            value={
              summary.nextPlanUnavailable
                ? "Unavailable"
                : summary.nextPlanLoading
                  ? "Loading…"
                  : summary.nextPlan
                    ? formatOverviewDate(summary.nextPlan.event_timestamp)
                    : "None scheduled"
            }
          />
          <MetadataSeparator />
          <OverviewMetadata
            icon={NotebookPen}
            value={
              summary.toJournalUnavailable
                ? "Unjournaled unavailable"
                : summary.toJournalLoading || summary.toJournalCount == null
                  ? "Loading unjournaled…"
                  : `${summary.toJournalCount} unjournaled`
            }
          />
        </div>
      }
      actions={
        <Button asChild className="h-11 w-full sm:w-auto xl:h-9 xl:px-2.5">
          <Link href={`/events/new?contact=${model.contactId}`}>
            <Plus className="size-4 shrink-0" />
            Log moment
          </Link>
        </Button>
      }
    />
  );
}

function MetadataSeparator() {
  return (
    <span
      aria-hidden="true"
      className="hidden h-4 w-px shrink-0 bg-border xl:block"
    />
  );
}

function OverviewMetadata({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label?: string;
  value: string;
}) {
  return (
    <span className="inline-flex h-9 min-w-0 items-center gap-1.5 text-sm leading-5 whitespace-nowrap">
      <Icon
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      {label && <span className="text-muted-foreground">{label} ·</span>}
      <strong className="font-semibold text-foreground">{value}</strong>
    </span>
  );
}

function formatOverviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}
