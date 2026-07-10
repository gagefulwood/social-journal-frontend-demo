"use client";

import Link from "next/link";
import {
  ChevronRight,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ContactListItem } from "@/types/contacts";
import {
  contactInitials,
  contactName,
} from "@/components/contacts/contact-utils";
import {
  getTrendPresentation,
  type OverviewTone,
} from "@/components/contacts/overview/contact-overview-utils";

type ContactCardProps = {
  contact: ContactListItem;
};

export function ContactCard({ contact }: ContactCardProps) {
  const name = contactName(contact);
  const trend = getTrendPresentation(contact.relationship_trend);

  return (
    <Link
      href={`/contacts/${contact.id}`}
      aria-label={`Open ${name}`}
      className="group relative flex min-h-34 min-w-0 items-center gap-3 rounded-lg border border-border/80 bg-card p-4 pr-10 text-card-foreground shadow-sm transition duration-200 hover:border-border hover:bg-muted/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
    >
      <ContactAvatar contact={contact} name={name} />
      <div className="min-w-0 flex-1 self-stretch py-0.5">
        <h3 className="truncate text-sm font-semibold" title={name}>
          {name}
        </h3>
        {contact.relation_name && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground" title={contact.relation_name}>
            {contact.relation_name}
          </p>
        )}
        {contact.occupation_name && (
          <p
            className="mt-2 truncate text-xs text-muted-foreground"
            title={contact.occupation_name}
          >
            {contact.occupation_name}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <TrendChip tone={trend.tone} label={trend.label} />
        </div>
      </div>
      <ChevronRight
        className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </Link>
  );
}

function ContactAvatar({
  contact,
  name,
}: {
  contact: ContactListItem;
  name: string;
}) {
  if (contact.profile_picture?.url) {
    return (
      <span
        role="img"
        aria-label={contact.profile_picture.alt_text || `${name} profile picture`}
        className="size-14 shrink-0 overflow-hidden rounded-full bg-muted bg-cover bg-center"
        style={{ backgroundImage: `url(${contact.profile_picture.url})` }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} initials`}
      className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground"
    >
      {contactInitials(contact)}
    </span>
  );
}

function TrendChip({
  tone,
  label,
}: {
  tone: OverviewTone;
  label: string;
}) {
  const presentation = trendChipPresentation[tone];
  const Icon = presentation.icon;

  return (
    <span
      className={`inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium ${presentation.className}`}
    >
      <Icon className="size-3" aria-hidden="true" />
      <span className="sr-only">Relationship trend: </span>
      {label}
    </span>
  );
}

const trendChipPresentation: Record<
  OverviewTone,
  { className: string; icon: LucideIcon }
> = {
  positive: { className: "bg-success-muted text-success", icon: TrendingUp },
  neutral: { className: "bg-muted text-muted-foreground", icon: HeartPulse },
  watch: { className: "bg-warning-muted text-warning", icon: TrendingDown },
  muted: { className: "bg-marker-indigo text-marker-indigo-foreground", icon: Wind },
};
