import { getJournalClassificationPresentation } from "@/lib/presentation/journalPresentation";
import type {
  JournalFamily,
  JournalFormat,
  JournalListItem,
  LogFormat,
} from "@/types/journals";

export type JournalHubView = "all" | "logs" | "reflections" | "drafts";

export const JOURNAL_HUB_PAGE_SIZE = 20;
export const JOURNAL_DRAFT_PREVIEW_SIZE = 10;

export const LOG_FORMATS: readonly LogFormat[] = [
  "episode",
  "social_energy",
  "sentiment",
];

export const REFLECTION_FORMATS = [
  "interaction",
  "moment",
  "emotional",
  "free",
] as const;

function journalFormatOption(
  value: Exclude<JournalFormat, "legacy">,
  family: JournalFamily,
) {
  const { formatPresentation } = getJournalClassificationPresentation(
    family,
    value,
  );

  if (!formatPresentation) {
    throw new Error("Journal format must be specific.");
  }

  return { value, label: formatPresentation.label, family };
}

export const JOURNAL_FORMAT_OPTIONS: ReadonlyArray<{
  value: Exclude<JournalFormat, "legacy">;
  label: string;
  family: JournalFamily;
}> = [
  journalFormatOption("episode", "log"),
  journalFormatOption("social_energy", "log"),
  journalFormatOption("sentiment", "log"),
  journalFormatOption("interaction", "reflection"),
  journalFormatOption("moment", "reflection"),
  journalFormatOption("emotional", "reflection"),
  journalFormatOption("free", "reflection"),
];

export function parseHubView(value: string | null): JournalHubView {
  if (value === "logs" || value === "reflections" || value === "drafts") {
    return value;
  }

  return "all";
}

export function parseJournalFormat(value: string | null) {
  return JOURNAL_FORMAT_OPTIONS.some((option) => option.value === value)
    ? (value as Exclude<JournalFormat, "legacy">)
    : undefined;
}

export function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function familyForHubView(
  view: JournalHubView,
): JournalFamily | undefined {
  if (view === "logs") {
    return "log";
  }

  if (view === "reflections") {
    return "reflection";
  }

  return undefined;
}

export function isFormatCompatibleWithView(
  format: JournalFormat | undefined,
  view: JournalHubView,
) {
  if (!format || view === "all" || view === "drafts") {
    return true;
  }

  const option = JOURNAL_FORMAT_OPTIONS.find(
    (candidate) => candidate.value === format,
  );
  const family = familyForHubView(view);
  return !option || !family || option.family === family;
}

export function isLogFormat(
  format: JournalFormat | undefined,
): format is LogFormat {
  return Boolean(format && LOG_FORMATS.includes(format as LogFormat));
}

export function getJournalHref(entry: JournalListItem) {
  return `/journals/${entry.family === "log" ? "logs" : "reflections"}/${entry.id}`;
}

export function getJournalEditHref(entry: JournalListItem) {
  if (entry.format === "legacy") {
    return getJournalHref(entry);
  }

  return `${getJournalHref(entry)}/edit`;
}

export function getJournalResumeHref(entry: JournalListItem) {
  if (entry.format === "legacy") {
    return getJournalHref(entry);
  }

  const params = new URLSearchParams();
  const step = entry.current_step || entry.progress.current_step;

  if (step) {
    params.set("step", step);
  }

  const query = params.toString();
  return `${getJournalEditHref(entry)}${query ? `?${query}` : ""}`;
}

export function formatJournalDate(
  value: string | null | undefined,
  includeTime = false,
) {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : undefined),
  }).format(date);
}

export function formatDuration(minutes: number) {
  if (minutes <= 0) {
    return "No duration recorded";
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder} min`;
  }

  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function wasEditedAfterCompletion(entry: JournalListItem) {
  if (!entry.completed_at) {
    return false;
  }

  return (
    new Date(entry.updated_timestamp).getTime() -
      new Date(entry.completed_at).getTime() >
    1_000
  );
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
