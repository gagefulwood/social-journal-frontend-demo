"use client";

import { Check, ChevronRight } from "lucide-react";

import {
  contactInitials,
  contactName,
} from "@/components/contacts/contact-utils";
import { cn } from "@/lib/utils";
import type { ContactListItem } from "@/types/contacts";

type JournalContactOptionCardProps = {
  contact: ContactListItem;
  selected: boolean;
  onToggle: () => void;
};

export function JournalContactOptionCard({
  contact,
  selected,
  onToggle,
}: JournalContactOptionCardProps) {
  const name = contactName(contact) || "Unnamed contact";

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={
        selected
          ? `${name}, selected. Clear related contact`
          : `Select related contact ${name}`
      }
      className={cn(
        "group flex min-h-16 w-full min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-left shadow-xs transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary/70 bg-primary/5 text-foreground ring-1 ring-primary/15"
          : "border-border/80 bg-card text-foreground hover:border-primary/30 hover:bg-muted/25",
      )}
      onClick={onToggle}
    >
      <JournalContactAvatar contact={contact} name={name} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className="min-w-0 max-w-full truncate text-sm font-semibold"
            title={name}
          >
            {name}
          </span>
          {contact.relation_name ? (
            <span className="min-w-0 max-w-full truncate text-xs font-medium text-primary">
              {contact.relation_name}
            </span>
          ) : null}
        </span>
        {contact.occupation_name ? (
          <span
            className="mt-1 block truncate text-xs text-muted-foreground"
            title={contact.occupation_name}
          >
            {contact.occupation_name}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
          selected
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground group-hover:text-primary",
        )}
      >
        {selected ? (
          <Check className="size-4" strokeWidth={2.5} />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </span>
    </button>
  );
}

function JournalContactAvatar({
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
        aria-label={
          contact.profile_picture.alt_text || `${name} profile picture`
        }
        className="size-10 shrink-0 overflow-hidden rounded-full border border-border/70 bg-muted bg-cover bg-center shadow-xs"
        style={{ backgroundImage: `url(${contact.profile_picture.url})` }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} initials`}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-accent text-sm font-semibold text-accent-foreground shadow-xs"
    >
      {contactInitials(contact)}
    </span>
  );
}
