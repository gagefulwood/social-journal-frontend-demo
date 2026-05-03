"use client";

import { BookOpenText, CalendarClock, FileText, MessageSquareText } from "lucide-react";
import { Children, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { StatsPanel } from "@/components/contacts/StatsPanel";
import { formatDate } from "@/components/contacts/contact-utils";
import type { Contact, Fact, Observation } from "@/types/contacts";

type ContactOverviewTabProps = {
  contact: Contact;
  facts: Fact[];
  observations: Observation[];
  onViewFactsAndObservations: () => void;
};

export function ContactOverviewTab({
  contact,
  facts,
  observations,
  onViewFactsAndObservations,
}: ContactOverviewTabProps) {
  const factPreview = facts.slice(0, 3);
  const observationPreview = [...observations]
    .sort(
      (left, right) =>
        new Date(right.created_timestamp).getTime() -
        new Date(left.created_timestamp).getTime()
    )
    .slice(0, 3);

  return (
    <div className="space-y-5">
      <StatsPanel contact={contact} />

      <div className="grid gap-5 md:grid-cols-2">
        <PreviewCard
          title="Facts"
          icon={<FileText className="size-4" />}
          emptyTitle="No facts saved yet."
          emptyCopy="Add preferences, family details, or useful context as you learn them."
          onViewAll={onViewFactsAndObservations}
        >
          {factPreview.map((fact) => (
            <li key={fact.id} className="rounded-md bg-muted px-3 py-2 text-sm">
              {fact.detail_value}
            </li>
          ))}
        </PreviewCard>

        <PreviewCard
          title="Observations"
          icon={<MessageSquareText className="size-4" />}
          emptyTitle="No observations yet."
          emptyCopy="Capture patterns, changes, or context you want to revisit."
          onViewAll={onViewFactsAndObservations}
        >
          {observationPreview.map((observation) => (
            <li key={observation.id} className="rounded-md bg-muted px-3 py-2">
              <p className="line-clamp-2 text-sm">{observation.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(observation.created_timestamp)}
              </p>
            </li>
          ))}
        </PreviewCard>
      </div>

      <PlaceholderWidget
        title="Journals"
        icon={<BookOpenText className="size-4" />}
        copy="Journal entries will appear here once journals are rebuilt."
      />
      <PlaceholderWidget
        title="Timeline"
        icon={<CalendarClock className="size-4" />}
        copy="Recent events will appear here once events are rebuilt."
      />
    </div>
  );
}

function PreviewCard({
  title,
  icon,
  emptyTitle,
  emptyCopy,
  onViewAll,
  children,
}: {
  title: string;
  icon: ReactNode;
  emptyTitle: string;
  emptyCopy: string;
  onViewAll: () => void;
  children: ReactNode;
}) {
  const hasItems = Children.count(children) > 0;

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {icon}
          </span>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Button type="button" variant="link" size="sm" onClick={onViewAll}>
          View all -&gt;
        </Button>
      </div>

      {hasItems ? (
        <ul className="space-y-2">{children}</ul>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm font-medium">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyCopy}</p>
        </div>
      )}
    </section>
  );
}

function PlaceholderWidget({
  title,
  icon,
  copy,
}: {
  title: string;
  icon: ReactNode;
  copy: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{copy}</p>
        </div>
      </div>
    </section>
  );
}
