"use client";

import { Fragment } from "react";
import {
  BriefcaseBusiness,
  HeartHandshake,
  MapPin,
  UserRound,
} from "lucide-react";
import { formatDate } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { Contact } from "@/types/contacts";

type DetailRow = { label: string; value: string | null };
type DetailGroup = {
  title: string;
  icon: typeof UserRound;
  rows?: DetailRow[];
  blocks?: Array<{ title: string; lines: string[] }>;
};

function present(value: string | null | undefined) {
  return value?.trim() || null;
}

function dateWithAge(value: string | null, age: number | null) {
  if (!value) return null;
  return age == null ? formatDate(value) : `${formatDate(value)} · ${age}`;
}

function countryName(code: string) {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function ProfileDetailsContent({ contact }: { contact: Contact }) {
  const { getEducationLevelById, getOccupationById } = useLookups();
  const legacyOccupation =
    present(contact.custom_occupation) ||
    (contact.occupation
      ? present(getOccupationById(contact.occupation)?.name)
      : null);
  const legacyEducation =
    present(contact.custom_education_level) ||
    (contact.education_level
      ? present(getEducationLevelById(contact.education_level)?.name)
      : null);
  const methods = contact.contact_methods ?? [];
  const addresses = contact.addresses ?? [];
  const jobs = contact.employment ?? [];
  const education = contact.education ?? [];

  const contactRows: DetailRow[] = methods.map((method) => ({
    label:
      present(method.label) || (method.kind === "email" ? "Email" : "Phone"),
    value: present(method.value),
  }));
  if (
    present(contact.email) &&
    !methods.some(
      (method) =>
        method.kind === "email" && method.value.trim() === contact.email.trim(),
    )
  ) {
    contactRows.push({
      label: methods.some((method) => method.kind === "email")
        ? "Legacy email"
        : "Email",
      value: present(contact.email),
    });
  }
  if (
    present(contact.phone_number) &&
    !methods.some(
      (method) =>
        method.kind === "phone" &&
        method.value.trim() === contact.phone_number.trim(),
    )
  ) {
    contactRows.push({
      label: methods.some((method) => method.kind === "phone")
        ? "Legacy phone"
        : "Phone",
      value: present(contact.phone_number),
    });
  }

  const locationRows: DetailRow[] = addresses.flatMap((address) => {
    const locality = [address.city, address.region, address.postal_code]
      .map(present)
      .filter(Boolean)
      .join(", ")
      .replace(/, ([^,]+)$/, " $1");
    return [
      {
        label:
          addresses.length > 1 && present(address.label)
            ? `${present(address.label)} street`
            : "Street",
        value: [present(address.line_1), present(address.line_2)]
          .filter(Boolean)
          .join(", "),
      },
      { label: "City / state / ZIP", value: locality || null },
      { label: "Country", value: countryName(address.country_code) },
    ];
  });
  if (present(contact.address)) {
    locationRows.push({
      label: addresses.length ? "Legacy address" : "Address",
      value: present(contact.address),
    });
  }

  const workBlocks = jobs.map((job) => ({
    title: job.title,
    lines: [
      job.organization,
      formatRange(job.start_date, job.end_date, job.is_current),
    ].filter(Boolean),
  }));
  if (!workBlocks.length && (legacyOccupation || present(contact.company))) {
    workBlocks.push({
      title: legacyOccupation || "Work",
      lines: [present(contact.company)].filter(Boolean) as string[],
    });
  }
  const educationBlocks = education.map((entry) => ({
    title:
      [entry.credential, entry.field_of_study]
        .map(present)
        .filter(Boolean)
        .join(" ") || entry.institution,
    lines: [
      entry.institution,
      formatRange(entry.start_date, entry.end_date, entry.is_current),
    ].filter(Boolean),
  }));
  if (!educationBlocks.length && (legacyEducation || present(contact.school))) {
    educationBlocks.push({
      title: legacyEducation || "Education",
      lines: [present(contact.school)].filter(Boolean) as string[],
    });
  }

  const groups: DetailGroup[] = [
    {
      title: "Basics",
      icon: UserRound,
      rows: [
        { label: "Preferred name", value: present(contact.preferred_name) },
        { label: "Gender", value: present(contact.gender_identity) },
        { label: "Pronouns", value: present(contact.pronouns) },
        {
          label: "Birthday",
          value: dateWithAge(
            contact.birth_date ?? contact.birthday,
            contact.age,
          ),
        },
      ],
    },
    { title: "Contact", icon: UserRound, rows: contactRows },
    { title: "Location", icon: MapPin, rows: locationRows },
    {
      title: "Relationship",
      icon: HeartHandshake,
      rows: [
        { label: "Relationship", value: present(contact.relation_name) },
        {
          label: "First met",
          value:
            (contact.first_met_on ?? contact.first_met_date)
              ? formatDate(contact.first_met_on ?? contact.first_met_date)
              : null,
        },
        { label: "Met through", value: present(contact.met_through) },
        { label: "Met location", value: present(contact.met_location) },
      ],
    },
    {
      title: "Work & education",
      icon: BriefcaseBusiness,
      blocks: [...workBlocks, ...educationBlocks],
    },
  ]
    .map((group) => ({
      ...group,
      rows: group.rows?.filter((row) => row.value),
      blocks: group.blocks?.filter(
        (block) => block.title || block.lines.length,
      ),
    }))
    .filter(
      (group) => (group.rows?.length ?? 0) + (group.blocks?.length ?? 0) > 0,
    );

  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Add profile details when they become useful.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <section key={group.title} className="py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <h3>{group.title}</h3>
            </div>
            {group.rows?.length ? (
              <dl className="mt-2.5 space-y-2.5">
                {group.rows.map((row, index) => (
                  <div
                    key={`${row.label}-${index}`}
                    className="grid min-w-0 grid-cols-[minmax(0,5.75rem)_minmax(0,1fr)] gap-x-3"
                  >
                    <dt className="text-xs leading-5 text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd
                      className="min-w-0 break-words text-sm leading-5"
                      title={row.value ?? undefined}
                    >
                      <SoftWrappingValue value={row.value!} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {group.blocks?.length ? (
              <div className="mt-2.5 space-y-3">
                {group.blocks.map((block, index) => (
                  <div key={`${block.title}-${index}`} className="min-w-0">
                    <p className="break-words text-sm font-medium [overflow-wrap:anywhere]">
                      {block.title}
                    </p>
                    {block.lines.map((line) => (
                      <p
                        key={line}
                        className="break-words text-xs leading-5 text-muted-foreground [overflow-wrap:anywhere]"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function SoftWrappingValue({ value }: { value: string }) {
  if (!value.includes("@")) {
    return value;
  }

  return value.split(/([@.])/).map((part, index) => (
    <Fragment key={`${part}-${index}`}>
      {part}
      {(part === "@" || part === ".") && <wbr />}
    </Fragment>
  ));
}

function formatRange(
  start: string | null,
  end: string | null,
  current: boolean,
) {
  if (!start && !end && !current) return "";
  return [
    start ? formatDate(start) : null,
    current ? "Present" : end ? formatDate(end) : null,
  ]
    .filter(Boolean)
    .join(" – ");
}
