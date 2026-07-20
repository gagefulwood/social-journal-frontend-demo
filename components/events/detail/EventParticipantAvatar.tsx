"use client";

import Link from "next/link";

import {
  contactInitials,
  contactName,
} from "@/components/contacts/contact-utils";
import { useRefreshableMediaUrl } from "@/hooks/useRefreshableMediaUrl";
import { cn } from "@/lib/utils";
import type { EventParticipant } from "@/types/events";
import type { ContactListItem } from "@/types/contacts";

type EventParticipantAvatarProps = {
  participant?: EventParticipant;
  contact?: ContactListItem;
  size?: "sm" | "md" | "lg";
  linked?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-16 text-base",
} as const;

export function EventParticipantAvatar({
  participant,
  contact: contactProp,
  size = "md",
  linked = true,
  className,
}: EventParticipantAvatarProps) {
  const contact = contactProp ?? participant?.contact;
  const mediaSource = useRefreshableMediaUrl(contact?.profile_picture);
  if (!contact) return null;
  const name = contactName(contact) || "Unnamed contact";
  const showImage =
    Boolean(mediaSource.url) &&
    !mediaSource.isRefreshing &&
    !mediaSource.failed;
  const visual = (
    <span
      role="img"
      aria-label={
        contact.profile_picture?.alt_text ||
        (showImage ? `${name} profile picture` : `${name} initials`)
      }
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-accent font-semibold text-accent-foreground shadow-xs",
        sizeClasses[size],
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={mediaSource.revision}
          src={mediaSource.url ?? undefined}
          alt=""
          aria-hidden="true"
          className="size-full object-cover"
          onError={mediaSource.refreshAfterError}
        />
      ) : (
        contactInitials(contact)
      )}
    </span>
  );

  if (!linked) return visual;
  return (
    <Link
      href={`/contacts/${contact.id}`}
      aria-label={`Open ${name}`}
      className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {visual}
    </Link>
  );
}
