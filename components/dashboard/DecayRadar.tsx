"use client";

import Link from "next/link";
import { HeartHandshake, TrendingDown, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardEmptyState,
  DashboardWidgetShell,
} from "@/components/dashboard/DashboardWidgetShell";
import {
  pluralize,
  type WidgetStateProps,
} from "@/components/dashboard/dashboard-utils";
import type { DashboardDecayContact } from "@/types/dashboard";

type DecayRadarProps = WidgetStateProps & {
  contacts: DashboardDecayContact[];
};

export function DecayRadar({
  contacts,
  loading,
  error,
  onRetry,
}: DecayRadarProps) {
  return (
    <DashboardWidgetShell
      title="Follow up gently"
      icon={<HeartHandshake aria-hidden="true" />}
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-40"
      action={
        <Link
          href="/contacts"
          className="shrink-0 rounded-sm text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          View all
        </Link>
      }
    >
      {contacts.length === 0 ? (
        <DashboardEmptyState
          icon={<HeartHandshake className="size-5" />}
          title="Nothing needs attention here"
          description="Fading or dormant recorded rhythms will appear here when available."
        />
      ) : (
        <div className="space-y-2">
          <p className="sr-only">Based on recorded moments only.</p>
          {contacts.map((contact) => (
            <DecayRadarItem key={contact.contact_id} contact={contact} />
          ))}
        </div>
      )}
    </DashboardWidgetShell>
  );
}

function DecayRadarItem({ contact }: { contact: DashboardDecayContact }) {
  const initials = contact.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid min-h-[76px] grid-cols-[2.75rem_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-md border border-border/80 bg-background px-3 py-2.5">
      <span
        aria-hidden="true"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
      >
        {initials}
      </span>
      <div className="min-w-0">
        <Link
          href={`/contacts/${contact.contact_id}`}
          className="block truncate rounded-sm text-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {contact.name}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          Last shared {pluralize(contact.days_since, "day")} ago
        </p>
      </div>
      <TrendBadge trend={contact.relationship_trend} />

      <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 whitespace-nowrap">
        <Link href={`/events/new?contact=${contact.contact_id}`}>Log moment</Link>
      </Button>
    </div>
  );
}

function TrendBadge({
  trend,
}: {
  trend: DashboardDecayContact["relationship_trend"];
}) {
  const isDormant = trend === "dormant";

  return (
    <span
      className={
        isDormant
          ? "inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-marker-rose px-2 text-xs font-medium text-marker-rose-foreground"
          : "inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-warning-muted px-2 text-xs font-medium text-warning"
      }
    >
      {isDormant ? <Wind className="size-3" /> : <TrendingDown className="size-3" />}
      {isDormant ? "Dormant" : "Fading"}
    </span>
  );
}
