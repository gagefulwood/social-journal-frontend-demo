export type ContactFormProgressStatus =
  | "ready"
  | "added"
  | "optional"
  | "needsAttention";

export type ContactFormProgressItem = {
  key:
    | "person"
    | "essentials"
    | "contact"
    | "relationship"
    | "location"
    | "workEducation";
  label: string;
  status: ContactFormProgressStatus;
  statusLabel: "Ready" | "Added" | "Optional" | "Needs attention";
};

type DraftContactMethod = {
  kind?: "email" | "phone";
  value?: string;
  is_primary?: boolean;
};

type DraftAddress = {
  label?: string;
  line_1?: string;
  line_2?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country_code?: string;
  is_primary?: boolean;
};

type DraftEmployment = {
  title?: string;
  organization?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
};

type DraftEducation = {
  credential?: string;
  field_of_study?: string;
  institution?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
};

export type ContactFormDraftInput = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  preferred_name?: string;
  relation?: string | number | null;
  gender_identity?: string;
  pronouns?: string;
  birth_date?: string | null;
  birthday?: string | null;
  timezone?: string;
  first_met_on?: string | null;
  first_met_date?: string | null;
  met_through?: string;
  met_location?: string;
  email?: string;
  phone_number?: string;
  contact_methods?: Array<DraftContactMethod | undefined>;
  address?: string;
  addresses?: Array<DraftAddress | undefined>;
  occupation?: string | number | null;
  custom_occupation?: string;
  company?: string;
  employment?: Array<DraftEmployment | undefined>;
  education_level?: string | number | null;
  custom_education_level?: string;
  school?: string;
  education?: Array<DraftEducation | undefined>;
};

export type ContactDraftSummary = {
  title: string;
  detail: string | null;
};

export type ContactFormDraftPresentation = {
  displayName: string | null;
  initials: string;
  relationshipLabel: string | null;
  identityMetadata: string[];
  firstMetLabel: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  work: ContactDraftSummary | null;
  education: ContactDraftSummary | null;
  isBlank: boolean;
};

export type ContactFormCollapsedSummaries = {
  contact: string;
  location: string;
  relationship: string;
  workEducation: string;
};

type DraftPresentationOptions = {
  relationshipLabel?: string | null;
  legacyOccupationLabel?: string | null;
  legacyEducationLabel?: string | null;
  today?: Date;
};

export function getContactFormDraftPresentation(
  draft: ContactFormDraftInput,
  options: DraftPresentationOptions = {},
): ContactFormDraftPresentation {
  const firstName = text(draft.first_name);
  const middleName = text(draft.middle_name);
  const lastName = text(draft.last_name);
  const preferredName = text(draft.preferred_name);
  const displayName = joinText(
    preferredName
      ? [preferredName, lastName]
      : [firstName, middleName, lastName],
    " ",
  );
  const initials = getInitials(displayName);
  const age = calculateAgeFromBirthDate(
    text(draft.birth_date) || text(draft.birthday),
    options.today,
  );
  const identityMetadata = [
    text(draft.gender_identity),
    text(draft.pronouns),
    age == null ? null : String(age),
  ].filter((value): value is string => Boolean(value));
  const firstMet = text(draft.first_met_on) || text(draft.first_met_date);
  const relationshipLabel = hasValue(draft.relation)
    ? text(options.relationshipLabel)
    : null;
  const contactMethods = compact(draft.contact_methods);
  const addresses = compact(draft.addresses);
  const employment = compact(draft.employment);
  const education = compact(draft.education);
  const phone = getContactMethodValue(
    contactMethods,
    "phone",
    draft.phone_number,
  );
  const email = getContactMethodValue(contactMethods, "email", draft.email);
  const location = getAddressSummary(addresses, draft.address);
  const work = getWorkSummary(employment, draft, options);
  const educationSummary = getEducationSummary(education, draft, options);
  const firstMetLabel = firstMet ? formatDraftDate(firstMet) : null;
  const isBlank = ![
    displayName,
    relationshipLabel,
    ...identityMetadata,
    firstMetLabel,
    phone,
    email,
    location,
    work?.title,
    educationSummary?.title,
  ].some(Boolean);

  return {
    displayName,
    initials,
    relationshipLabel,
    identityMetadata,
    firstMetLabel,
    phone,
    email,
    location,
    work,
    education: educationSummary,
    isBlank,
  };
}

export function getContactFormProgress(
  draft: ContactFormDraftInput,
  errors?: unknown,
): ContactFormProgressItem[] {
  const methods = compact(draft.contact_methods);
  const addresses = compact(draft.addresses);
  const employment = compact(draft.employment);
  const education = compact(draft.education);
  const personReady = Boolean(text(draft.first_name) && text(draft.last_name));
  const contactHasData = Boolean(
    methods.length || text(draft.email) || text(draft.phone_number),
  );
  const contactComplete = methods.length
    ? methods.every(
        (method) =>
          (method.kind === "email" || method.kind === "phone") &&
          Boolean(text(method.value)),
      )
    : contactHasData;
  const locationHasData = Boolean(addresses.length || text(draft.address));
  const locationComplete = addresses.length
    ? addresses.every((address) => Boolean(text(address.line_1)))
    : locationHasData;
  const workEducationHasData = Boolean(
    employment.length ||
    education.length ||
    hasLegacyWork(draft) ||
    hasLegacyEducation(draft),
  );
  const workEducationComplete =
    employment.every((entry) => Boolean(text(entry.title))) &&
    education.every((entry) => Boolean(text(entry.institution)));

  return [
    progressItem(
      "person",
      "Person",
      hasGroupError(errors, [
        "first_name",
        "middle_name",
        "last_name",
        "preferred_name",
        "profile_picture_id",
      ])
        ? "needsAttention"
        : personReady
          ? "ready"
          : "optional",
    ),
    progressItem(
      "essentials",
      "Essentials",
      optionalGroupStatus(
        [
          draft.gender_identity,
          draft.pronouns,
          draft.birth_date,
          draft.timezone,
        ].some(hasValue),
        hasGroupError(errors, [
          "gender_identity",
          "pronouns",
          "birth_date",
          "timezone",
        ]),
      ),
    ),
    progressItem(
      "contact",
      "Contact",
      optionalGroupStatus(
        contactHasData,
        hasGroupError(errors, ["contact_methods", "email", "phone_number"]) ||
          (contactHasData && !contactComplete),
      ),
    ),
    progressItem(
      "relationship",
      "Relationship",
      optionalGroupStatus(
        [
          draft.relation,
          draft.first_met_on,
          draft.met_through,
          draft.met_location,
        ].some(hasValue),
        hasGroupError(errors, [
          "relation",
          "first_met_on",
          "met_through",
          "met_location",
        ]),
      ),
    ),
    progressItem(
      "location",
      "Location",
      optionalGroupStatus(
        locationHasData,
        hasGroupError(errors, ["addresses", "address"]) ||
          (locationHasData && !locationComplete),
      ),
    ),
    progressItem(
      "workEducation",
      "Work & education",
      optionalGroupStatus(
        workEducationHasData,
        hasGroupError(errors, [
          "employment",
          "education",
          "occupation",
          "custom_occupation",
          "company",
          "education_level",
          "custom_education_level",
          "school",
        ]) ||
          (workEducationHasData && !workEducationComplete),
      ),
    ),
  ];
}

export function getContactFormCollapsedSummaries(
  draft: ContactFormDraftInput,
): ContactFormCollapsedSummaries {
  const methods = compact(draft.contact_methods);
  const completeMethods = methods.filter(
    (method) =>
      (method.kind === "email" || method.kind === "phone") &&
      Boolean(text(method.value)),
  );
  const methodCount = methods.length
    ? completeMethods.length
    : [draft.email, draft.phone_number].filter(hasValue).length;

  const addresses = compact(draft.addresses);
  const completeAddresses = addresses.filter((address) =>
    Boolean(text(address.line_1)),
  );
  const addressCount = addresses.length
    ? completeAddresses.length
    : text(draft.address)
      ? 1
      : 0;
  const singleAddress = completeAddresses[0];
  const addressLabel = text(singleAddress?.label);

  const metThrough = text(draft.met_through);
  const metLocation = text(draft.met_location);
  const firstMet = text(draft.first_met_on) || text(draft.first_met_date);
  const formattedFirstMet = firstMet ? formatDraftDate(firstMet) : null;
  const relationship =
    joinText([metThrough, metLocation], " · ") ||
    (formattedFirstMet ? `First met ${formattedFirstMet}` : null) ||
    "Add context about how you met";

  const employment = compact(draft.employment);
  const education = compact(draft.education);
  const jobCount = employment.length
    ? employment.filter((entry) => Boolean(text(entry.title))).length
    : hasLegacyWork(draft)
      ? 1
      : 0;
  const schoolCount = education.length
    ? education.filter((entry) => Boolean(text(entry.institution))).length
    : hasLegacyEducation(draft)
      ? 1
      : 0;
  const workEducation = joinText(
    [
      jobCount ? pluralizedCount(jobCount, "job") : null,
      schoolCount ? pluralizedCount(schoolCount, "school") : null,
    ],
    " · ",
  );

  return {
    contact:
      methodCount > 0
        ? pluralizedCount(methodCount, "method")
        : "No contact methods yet",
    location:
      addressCount === 1 && addressLabel
        ? /address$/i.test(addressLabel)
          ? addressLabel
          : `${addressLabel} address`
        : addressCount > 0
          ? pluralizedCount(addressCount, "address", "addresses")
          : "No address yet",
    relationship,
    workEducation: workEducation || "Add a job, school, or both",
  };
}

export function calculateAgeFromBirthDate(
  birthDate: string | null | undefined,
  today = new Date(),
) {
  const parsed = parseDateOnly(birthDate);
  if (!parsed) return null;
  const current = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (parsed > current) return null;

  return (
    current.getFullYear() -
    parsed.getFullYear() -
    (current.getMonth() < parsed.getMonth() ||
    (current.getMonth() === parsed.getMonth() &&
      current.getDate() < parsed.getDate())
      ? 1
      : 0)
  );
}

function getContactMethodValue(
  methods: DraftContactMethod[],
  kind: "email" | "phone",
  legacyValue: string | undefined,
) {
  const methodsOfKind = methods.filter((method) => method.kind === kind);
  if (methodsOfKind.length) {
    return (
      text(methodsOfKind.find((method) => method.is_primary)?.value) || null
    );
  }
  return text(legacyValue);
}

function getAddressSummary(
  addresses: DraftAddress[],
  legacyAddress: string | undefined,
) {
  if (addresses.length) {
    const address =
      addresses.find((candidate) => candidate.is_primary) ?? addresses[0];
    return formatAddress(address);
  }
  return text(legacyAddress);
}

function formatAddress(address: DraftAddress) {
  const regionAndPostal = joinText(
    [text(address.region), text(address.postal_code)],
    " ",
  );
  const locality = joinText([text(address.city), regionAndPostal], ", ");
  return joinText(
    [
      text(address.line_1),
      text(address.line_2),
      locality,
      countryName(text(address.country_code)),
    ],
    ", ",
  );
}

function countryName(code: string | null) {
  if (!code) return null;
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(
        code.toUpperCase(),
      ) ?? code.toUpperCase()
    );
  } catch {
    return code.toUpperCase();
  }
}

function getWorkSummary(
  employment: DraftEmployment[],
  draft: ContactFormDraftInput,
  options: DraftPresentationOptions,
): ContactDraftSummary | null {
  if (employment.length) {
    const entry =
      employment.find((candidate) => candidate.is_current) ?? employment[0];
    const title = text(entry.title) || text(entry.organization);
    if (!title) return null;
    return {
      title,
      detail:
        text(entry.title) && text(entry.organization)
          ? text(entry.organization)
          : null,
    };
  }

  const title =
    text(draft.custom_occupation) ||
    text(options.legacyOccupationLabel) ||
    text(draft.company);
  if (!title) return null;
  return {
    title,
    detail: title !== text(draft.company) ? text(draft.company) : null,
  };
}

function getEducationSummary(
  education: DraftEducation[],
  draft: ContactFormDraftInput,
  options: DraftPresentationOptions,
): ContactDraftSummary | null {
  if (education.length) {
    const entry =
      education.find((candidate) => candidate.is_current) ?? education[0];
    const title =
      joinText([text(entry.credential), text(entry.field_of_study)], " ") ||
      text(entry.institution);
    if (!title) return null;
    return {
      title,
      detail:
        title !== text(entry.institution) ? text(entry.institution) : null,
    };
  }

  const title =
    text(draft.custom_education_level) ||
    text(options.legacyEducationLabel) ||
    text(draft.school);
  if (!title) return null;
  return {
    title,
    detail: title !== text(draft.school) ? text(draft.school) : null,
  };
}

function hasLegacyWork(draft: ContactFormDraftInput) {
  return [draft.occupation, draft.custom_occupation, draft.company].some(
    hasValue,
  );
}

function hasLegacyEducation(draft: ContactFormDraftInput) {
  return [
    draft.education_level,
    draft.custom_education_level,
    draft.school,
  ].some(hasValue);
}

function optionalGroupStatus(
  hasData: boolean,
  needsAttention: boolean,
): ContactFormProgressStatus {
  if (needsAttention) return "needsAttention";
  return hasData ? "added" : "optional";
}

function progressItem(
  key: ContactFormProgressItem["key"],
  label: string,
  status: ContactFormProgressStatus,
): ContactFormProgressItem {
  const statusLabels: Record<
    ContactFormProgressStatus,
    ContactFormProgressItem["statusLabel"]
  > = {
    ready: "Ready",
    added: "Added",
    optional: "Optional",
    needsAttention: "Needs attention",
  };
  return { key, label, status, statusLabel: statusLabels[status] };
}

function pluralizedCount(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function hasGroupError(errors: unknown, fields: string[]) {
  if (!isRecord(errors)) return false;
  return fields.some((field) => containsError(errors[field]));
}

function containsError(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.some(containsError);
  if (!isRecord(value)) return false;
  if (typeof value.message === "string" && value.message) return true;
  return Object.entries(value).some(
    ([key, nested]) => key !== "ref" && containsError(nested),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatDraftDate(value: string) {
  const date = parseDateOnly(value);
  if (!date) return null;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function parseDateOnly(value: string | null | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function getInitials(displayName: string | null) {
  if (!displayName) return "";
  const parts = displayName.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function joinText(values: Array<string | null | undefined>, separator: string) {
  const joined = values.filter(Boolean).join(separator);
  return joined || null;
}

function compact<T>(values: Array<T | undefined> | undefined): T[] {
  return (values ?? []).filter((value): value is T => Boolean(value));
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function hasValue(value: unknown) {
  return (
    text(value) !== null ||
    (typeof value === "number" && Number.isFinite(value))
  );
}
