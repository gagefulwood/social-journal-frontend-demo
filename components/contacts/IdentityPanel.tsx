"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  Cake,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/contacts";
import { useLookups } from "@/hooks/useLookups";
import {
  contactInitials,
  contactName,
  formatDate,
} from "@/components/contacts/contact-utils";

type IdentityPanelProps = {
  contact: Contact;
};

export function IdentityPanel({ contact }: IdentityPanelProps) {
  const { getOccupationById, getEducationLevelById } = useLookups();
  const occupation = contact.occupation
    ? getOccupationById(contact.occupation)?.name
    : null;
  const education = contact.education_level
    ? getEducationLevelById(contact.education_level)?.name
    : null;
  const name = contactName(contact);
  const subtitleParts = [
    contact.relation_name,
    contact.custom_occupation || occupation || contact.company,
  ].filter(Boolean);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col items-center text-center">
        <div className="size-24 overflow-hidden rounded-2xl bg-muted">
          {contact.profile_picture?.url ? (
            <div
              role="img"
              aria-label={contact.profile_picture.alt_text || name}
              className="size-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${contact.profile_picture.url})`,
              }}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted via-background to-muted text-xl font-medium text-muted-foreground">
              {contactInitials(contact)}
            </div>
          )}
        </div>

        <h1 className="mt-4 text-2xl font-semibold">{name}</h1>
        {subtitleParts.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {subtitleParts.join(" · ")}
          </p>
        )}

        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={`/contacts/${contact.id}/edit`}>Edit Contact</Link>
        </Button>
      </div>

      <dl className="mt-5 space-y-0.5 border-t border-border pt-3">
        <Detail
          icon={<Mail className="size-4" />}
          label="Email"
          value={contact.email || "Not set"}
        />
        <Detail
          icon={<Phone className="size-4" />}
          label="Phone"
          value={contact.phone_number || "Not set"}
        />
        <Detail
          icon={<Cake className="size-4" />}
          label="Birthday"
          value={formatDate(contact.birthday)}
        />
        <Detail
          icon={<MapPin className="size-4" />}
          label="Address"
          value={contact.address || "Not set"}
        />
        <Detail
          icon={<CalendarDays className="size-4" />}
          label="First Met"
          value={formatDate(contact.first_met_date)}
        />
        <Detail
          icon={<BriefcaseBusiness className="size-4" />}
          label="Company"
          value={contact.company || "Not set"}
        />
        <Detail
          icon={<GraduationCap className="size-4" />}
          label="Education"
          value={contact.custom_education_level || education || "Not set"}
        />
      </dl>
    </section>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-left">
      <dt className="mt-0.5 text-muted-foreground">{icon}</dt>
      <dd className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium">{value}</p>
      </dd>
    </div>
  );
}
