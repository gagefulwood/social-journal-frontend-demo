"use client";

import Link from "next/link";
import { ArrowRight, Radar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DashboardEmptyState,
  DashboardWidgetShell,
} from "@/components/dashboard/DashboardWidgetShell";
import { pluralize, type WidgetStateProps } from "@/components/dashboard/dashboard-utils";
import { scorePercent, trendLabel } from "@/components/contacts/contact-utils";
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
      title="Decay Radar"
      description="Relationships that may need attention."
      loading={loading}
      error={error}
      onRetry={onRetry}
      skeletonClassName="h-72"
      className="lg:col-span-4"
      action={
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/contacts?trend=fading,dormant">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      }
    >
      {contacts.length === 0 ? (
        <DashboardEmptyState
          icon={<Radar className="size-5" />}
          title="No fading relationships"
          description="Contacts with fading or dormant trends will appear here when they need attention."
        />
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <DecayRadarItem key={contact.contact_id} contact={contact} />
          ))}
        </div>
      )}
    </DashboardWidgetShell>
  );
}

function DecayRadarItem({ contact }: { contact: DashboardDecayContact }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/contacts/${contact.contact_id}`}
            className="truncate text-base font-semibold hover:underline"
          >
            {contact.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {pluralize(contact.days_since, "day")} since last interaction
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
          {trendLabel(contact.relationship_trend)}
        </span>
      </div>

      <div className="mt-4 rounded-md bg-muted/50 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Connection</span>
          <span className="text-sm font-semibold text-foreground">
            {scorePercent(contact.connection_strength)}%
          </span>
        </div>
      </div>

      <Button asChild variant="outline" size="sm" className="mt-3 w-full gap-2">
        <Link href={`/events/new?contact=${contact.contact_id}`}>
          <Send className="size-4" />
          Reach out
        </Link>
      </Button>
    </div>
  );
}
