import type { PresentationSource } from "@/lib/presentation/types";

export const JOURNAL_FAMILY_KEYS = [
  "journalFamily.log",
  "journalFamily.reflection",
  "journalFamily.unknown",
] as const;

export const JOURNAL_FORMAT_KEYS = [
  "journalFormat.episode",
  "journalFormat.socialEnergy",
  "journalFormat.sentiment",
  "journalFormat.unknown",
] as const;

export const REFLECTION_LENS_KEYS = [
  "reflectionLens.interaction",
  "reflectionLens.moment",
  "reflectionLens.emotional",
  "reflectionLens.free",
  "reflectionLens.unknown",
] as const;

export const JOURNAL_STATUS_KEYS = [
  "journalStatus.draft",
  "journalStatus.completed",
  "journalStatus.unknown",
] as const;

export const JOURNAL_PRESENTATION_KEYS = [
  ...JOURNAL_FAMILY_KEYS,
  ...JOURNAL_FORMAT_KEYS,
  ...REFLECTION_LENS_KEYS,
  ...JOURNAL_STATUS_KEYS,
] as const;

export type JournalFamilyKey = (typeof JOURNAL_FAMILY_KEYS)[number];
export type JournalFormatKey = (typeof JOURNAL_FORMAT_KEYS)[number];
export type ReflectionLensKey = (typeof REFLECTION_LENS_KEYS)[number];
export type JournalStatusKey = (typeof JOURNAL_STATUS_KEYS)[number];
export type JournalPresentationKey = (typeof JOURNAL_PRESENTATION_KEYS)[number];

export type JournalFamily = "log" | "reflection";
export type JournalLogFormat = "episode" | "socialEnergy" | "sentiment";
export type ReflectionLens = "interaction" | "moment" | "emotional" | "free";
export type JournalStatus = "draft" | "completed";
export const UNSPECIFIED_JOURNAL_FORMAT_LABEL = "Unspecified";

export type JournalIconIdentifier =
  | "activity"
  | "battery-medium"
  | "book-open"
  | "check-circle-2"
  | "circle"
  | "heart"
  | "notebook-tabs"
  | "pencil-line"
  | "smile"
  | "star"
  | "users-round";

type JournalTokenRole = "surface" | "foreground" | "border" | "emphasis";

type JournalSemanticTokenRef<Role extends JournalTokenRole = JournalTokenRole> =
  `${JournalPresentationKey}.${Role}`;

export type JournalPresentationTokens = {
  surface: JournalSemanticTokenRef<"surface">;
  foreground: JournalSemanticTokenRef<"foreground">;
  border: JournalSemanticTokenRef<"border">;
  emphasis: JournalSemanticTokenRef<"emphasis">;
};

export type JournalPresentationVariant =
  | "journalIconTile.family"
  | "journalIconTile.format"
  | "journalIconTile.lens"
  | "journalSemanticChip.family"
  | "journalSemanticChip.format"
  | "journalSemanticChip.lens"
  | "journalStatusIndicator.status";

export type JournalIdentityPresentation = {
  key: JournalFamilyKey | JournalFormatKey | ReflectionLensKey;
  label: string;
  icon: JournalIconIdentifier;
  tokens: JournalPresentationTokens;
  variants: {
    iconTile: JournalPresentationVariant;
    chip: JournalPresentationVariant;
  };
  source: PresentationSource;
};

export type JournalStatusPresentation = {
  key: JournalStatusKey;
  label: string;
  accessibleLabel: string;
  icon: JournalIconIdentifier;
  tokens: JournalPresentationTokens;
  variants: {
    indicator: "journalStatusIndicator.status";
  };
  source: PresentationSource;
};
export type JournalClassificationPresentation = {
  family: JournalFamily | "unknown";
  familyPresentation: JournalIdentityPresentation;
  formatPresentation: JournalIdentityPresentation | null;
  primaryPresentation: JournalIdentityPresentation;
};

type JournalTokenClassSet = Record<JournalTokenRole, string>;

const neutralTokens: JournalTokenClassSet = {
  surface: "bg-muted",
  foreground: "text-muted-foreground",
  border: "border-border",
  emphasis: "ring-border",
};

const accentTokens: JournalTokenClassSet = {
  surface: "bg-accent",
  foreground: "text-accent-foreground",
  border: "border-primary/20",
  emphasis: "ring-primary/20",
};

const successTokens: JournalTokenClassSet = {
  surface: "bg-success-muted",
  foreground: "text-success",
  border: "border-success/25",
  emphasis: "ring-success/25",
};

const infoTokens: JournalTokenClassSet = {
  surface: "bg-info-muted",
  foreground: "text-info",
  border: "border-info/25",
  emphasis: "ring-info/25",
};

const warningTokens: JournalTokenClassSet = {
  surface: "bg-warning-muted",
  foreground: "text-warning",
  border: "border-warning/25",
  emphasis: "ring-warning/25",
};

const roseTokens: JournalTokenClassSet = {
  surface: "bg-marker-rose",
  foreground: "text-marker-rose-foreground",
  border: "border-marker-rose",
  emphasis: "ring-marker-rose-foreground/25",
};

const indigoTokens: JournalTokenClassSet = {
  surface: "bg-marker-indigo",
  foreground: "text-marker-indigo-foreground",
  border: "border-marker-indigo",
  emphasis: "ring-marker-indigo-foreground/25",
};

const JOURNAL_TOKEN_STYLES = {
  "journalFamily.log": warningTokens,
  "journalFamily.reflection": accentTokens,
  "journalFamily.unknown": neutralTokens,
  "journalFormat.episode": warningTokens,
  "journalFormat.socialEnergy": infoTokens,
  "journalFormat.sentiment": roseTokens,
  "journalFormat.unknown": neutralTokens,
  "reflectionLens.interaction": accentTokens,
  "reflectionLens.moment": indigoTokens,
  "reflectionLens.emotional": roseTokens,
  "reflectionLens.free": accentTokens,
  "reflectionLens.unknown": neutralTokens,
  "journalStatus.draft": accentTokens,
  "journalStatus.completed": successTokens,
  "journalStatus.unknown": neutralTokens,
} satisfies Record<JournalPresentationKey, JournalTokenClassSet>;

const familyPresentations: Record<
  JournalFamily | "unknown",
  JournalIdentityPresentation
> = {
  log: createIdentityPresentation({
    key: "journalFamily.log",
    label: "Log",
    icon: "notebook-tabs",
    iconTile: "journalIconTile.family",
    chip: "journalSemanticChip.family",
  }),
  reflection: createIdentityPresentation({
    key: "journalFamily.reflection",
    label: "Reflection",
    icon: "book-open",
    iconTile: "journalIconTile.family",
    chip: "journalSemanticChip.family",
  }),
  unknown: createIdentityPresentation({
    key: "journalFamily.unknown",
    label: "Journal",
    icon: "notebook-tabs",
    iconTile: "journalIconTile.family",
    chip: "journalSemanticChip.family",
    source: "fallback",
  }),
};

const logFormatPresentations: Record<
  JournalLogFormat | "unknown",
  JournalIdentityPresentation
> = {
  episode: createIdentityPresentation({
    key: "journalFormat.episode",
    label: "Episode",
    icon: "activity",
    iconTile: "journalIconTile.format",
    chip: "journalSemanticChip.format",
  }),
  socialEnergy: createIdentityPresentation({
    key: "journalFormat.socialEnergy",
    label: "Social energy",
    icon: "battery-medium",
    iconTile: "journalIconTile.format",
    chip: "journalSemanticChip.format",
  }),
  sentiment: createIdentityPresentation({
    key: "journalFormat.sentiment",
    label: "Sentiment",
    icon: "smile",
    iconTile: "journalIconTile.format",
    chip: "journalSemanticChip.format",
  }),
  unknown: createIdentityPresentation({
    key: "journalFormat.unknown",
    label: "Log",
    icon: "notebook-tabs",
    iconTile: "journalIconTile.format",
    chip: "journalSemanticChip.format",
    source: "fallback",
  }),
};

const reflectionLensPresentations: Record<
  ReflectionLens | "unknown",
  JournalIdentityPresentation
> = {
  interaction: createIdentityPresentation({
    key: "reflectionLens.interaction",
    label: "Interaction",
    icon: "users-round",
    iconTile: "journalIconTile.lens",
    chip: "journalSemanticChip.lens",
  }),
  moment: createIdentityPresentation({
    key: "reflectionLens.moment",
    label: "Moment",
    icon: "star",
    iconTile: "journalIconTile.lens",
    chip: "journalSemanticChip.lens",
  }),
  emotional: createIdentityPresentation({
    key: "reflectionLens.emotional",
    label: "Emotional",
    icon: "heart",
    iconTile: "journalIconTile.lens",
    chip: "journalSemanticChip.lens",
  }),
  free: createIdentityPresentation({
    key: "reflectionLens.free",
    label: "Free reflection",
    icon: "pencil-line",
    iconTile: "journalIconTile.lens",
    chip: "journalSemanticChip.lens",
  }),
  unknown: createIdentityPresentation({
    key: "reflectionLens.unknown",
    label: "Reflection",
    icon: "book-open",
    iconTile: "journalIconTile.lens",
    chip: "journalSemanticChip.lens",
    source: "fallback",
  }),
};

const statusPresentations: Record<
  JournalStatus | "unknown",
  JournalStatusPresentation
> = {
  draft: createStatusPresentation({
    key: "journalStatus.draft",
    label: "Draft",
    accessibleLabel: "Journal draft",
    icon: "pencil-line",
  }),
  completed: createStatusPresentation({
    key: "journalStatus.completed",
    label: "Completed",
    accessibleLabel: "Completed journal",
    icon: "check-circle-2",
  }),
  unknown: createStatusPresentation({
    key: "journalStatus.unknown",
    label: "Status unavailable",
    accessibleLabel: "Journal status unavailable",
    icon: "circle",
    source: "fallback",
  }),
};

export function getJournalFamilyPresentation(
  value: unknown,
): JournalIdentityPresentation {
  return familyPresentations[normalizeFamily(value)];
}

export function getJournalClassificationPresentation(
  familyValue: unknown,
  formatValue: unknown,
): JournalClassificationPresentation {
  const family = normalizeFamily(familyValue);
  const familyPresentation = familyPresentations[family];
  const candidate =
    family === "log"
      ? logFormatPresentations[normalizeLogFormat(formatValue)]
      : family === "reflection"
        ? reflectionLensPresentations[normalizeReflectionLens(formatValue)]
        : null;
  const formatPresentation =
    candidate &&
    normalizeExactLabel(candidate.label) !==
      normalizeExactLabel(familyPresentation.label)
      ? candidate
      : null;

  return {
    family,
    familyPresentation,
    formatPresentation,
    primaryPresentation: formatPresentation ?? familyPresentation,
  };
}

export function getJournalLogFormatPresentation(
  value: unknown,
): JournalIdentityPresentation {
  return logFormatPresentations[normalizeLogFormat(value)];
}

export function getReflectionLensPresentation(
  value: unknown,
): JournalIdentityPresentation {
  return reflectionLensPresentations[normalizeReflectionLens(value)];
}

export function getJournalStatusPresentation(
  value: unknown,
): JournalStatusPresentation {
  return statusPresentations[normalizeStatus(value)];
}

export function resolveJournalPresentationTokenClasses(
  tokens: JournalPresentationTokens,
) {
  return {
    surface: resolveJournalTokenClass(tokens.surface, "surface"),
    foreground: resolveJournalTokenClass(tokens.foreground, "foreground"),
    border: resolveJournalTokenClass(tokens.border, "border"),
    emphasis: resolveJournalTokenClass(tokens.emphasis, "emphasis"),
  };
}

function createIdentityPresentation({
  key,
  label,
  icon,
  iconTile,
  chip,
  source = "enum",
}: {
  key: JournalFamilyKey | JournalFormatKey | ReflectionLensKey;
  label: string;
  icon: JournalIconIdentifier;
  iconTile: JournalPresentationVariant;
  chip: JournalPresentationVariant;
  source?: PresentationSource;
}): JournalIdentityPresentation {
  return {
    key,
    label,
    icon,
    tokens: getJournalPresentationTokens(key),
    variants: { iconTile, chip },
    source,
  };
}

function createStatusPresentation({
  key,
  label,
  accessibleLabel,
  icon,
  source = "enum",
}: {
  key: JournalStatusKey;
  label: string;
  accessibleLabel: string;
  icon: JournalIconIdentifier;
  source?: PresentationSource;
}): JournalStatusPresentation {
  return {
    key,
    label,
    accessibleLabel,
    icon,
    tokens: getJournalPresentationTokens(key),
    variants: { indicator: "journalStatusIndicator.status" },
    source,
  };
}

function getJournalPresentationTokens(
  key: JournalPresentationKey,
): JournalPresentationTokens {
  return {
    surface: `${key}.surface`,
    foreground: `${key}.foreground`,
    border: `${key}.border`,
    emphasis: `${key}.emphasis`,
  };
}

function resolveJournalTokenClass<Role extends JournalTokenRole>(
  reference: JournalSemanticTokenRef<Role>,
  role: Role,
) {
  const suffix = `.${role}`;
  const key = reference.slice(0, -suffix.length) as JournalPresentationKey;
  return JOURNAL_TOKEN_STYLES[key][role];
}

function normalizeFamily(value: unknown): JournalFamily | "unknown" {
  if (value === "log" || value === "reflection") {
    return value;
  }

  return "unknown";
}

function normalizeLogFormat(value: unknown): JournalLogFormat | "unknown" {
  switch (value) {
    case "episode":
      return "episode";
    case "socialEnergy":
    case "social_energy":
    case "social-energy":
      return "socialEnergy";
    case "sentiment":
      return "sentiment";
    default:
      return "unknown";
  }
}

function normalizeReflectionLens(value: unknown): ReflectionLens | "unknown" {
  switch (value) {
    case "interaction":
      return "interaction";
    case "moment":
      return "moment";
    case "emotional":
      return "emotional";
    case "free":
    case "free_reflection":
    case "free-reflection":
      return "free";
    default:
      return "unknown";
  }
}

function normalizeStatus(value: unknown): JournalStatus | "unknown" {
  if (value === "draft" || value === "completed") {
    return value;
  }

  return "unknown";
}

function normalizeExactLabel(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
