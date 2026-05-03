"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import type { ContactListItem } from "@/types/contacts";
import {
  contactInitials,
  contactName,
  scorePercent,
  trendLabel,
} from "@/components/contacts/contact-utils";

type ContactCardProps = {
  contact: ContactListItem;
};

export function ContactCard({ contact }: ContactCardProps) {
  const name = contactName(contact);
  const subtext = contact.relation_name || contact.occupation_name;

  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs transition hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
          {contact.profile_picture?.url ? (
            <div
              role="img"
              aria-label={contact.profile_picture.alt_text || name}
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${contact.profile_picture.url})` }}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-semibold">
              {contactInitials(contact)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{name}</h2>
              {subtext && (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {subtext}
                </p>
              )}
            </div>
            <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
              {trendLabel(contact.relationship_trend)}
            </span>
          </div>

          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            {contact.phone_number && (
              <p className="flex items-center gap-2 truncate">
                <Phone className="size-4" />
                {contact.phone_number}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted/50 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Connection</span>
          <span className="text-sm font-semibold text-foreground">
            {scorePercent(contact.connection_strength)}%
          </span>
        </div>
      </div>
    </Link>
  );
}
