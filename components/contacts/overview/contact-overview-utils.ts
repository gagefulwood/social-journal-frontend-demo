import type { ApiId } from "@/types/api";
import type {
  Contact,
  Fact,
  Observation,
  RelationshipTrend,
  SentimentProfile,
} from "@/types/contacts";
import type { EventListItem, EventTier } from "@/types/events";

export type OverviewTone = "positive" | "neutral" | "watch" | "muted";

export type ConnectionBand = {
  label: "Strong" | "Steady" | "Needs context" | "Quiet";
  tone: OverviewTone;
  score: number;
};

export type TrendPresentation = {
  label: "Growing" | "Steady" | "Slowing" | "Quiet" | "Unknown";
  eyebrow: "Trend";
  tone: OverviewTone;
  value: RelationshipTrend;
};

export type SentimentSummary = {
  label: string;
  detail: string;
  tone: OverviewTone;
  total: number;
  dominantMood: string | null;
  parts: SentimentSummaryPart[];
};

export type SentimentSummaryPart = {
  label: string;
  count: number;
  percent: number;
};

export type RememberNextTimeItem = {
  id: string;
  sourceId: ApiId;
  source: "fact" | "observation";
  text: string;
  fullText: string;
};

export type StorySoFarEvent = {
  id: ApiId;
  title: string;
  dateLabel: string;
  eventTimestamp: string;
  tier: EventTier;
  locationLabel: string;
  journaled: boolean;
};

export type RelationshipSnapshot = {
  headline: string;
  details: string[];
  latestEvent: EventListItem | null;
  eventCount: number;
  emptyState: "Add events to build this story" | null;
};

export type ContactOverviewModel = {
  contactId: ApiId;
  displayName: string;
  relationshipLabel: string | null;
  contextLine: string;
  connectionBand: ConnectionBand;
  trend: TrendPresentation;
  frequencyLabel: string;
  diversityLabel: string;
  sentiment: SentimentSummary;
  rememberNextTimeItems: RememberNextTimeItem[];
  rememberNextTimeEmptyState:
    | "No facts saved yet"
    | "No recent observations"
    | null;
  storySoFarEvents: StorySoFarEvent[];
  storySoFarEmptyState: "Add events to build this story" | null;
  relationshipSnapshot: RelationshipSnapshot;
};

type BuildOverviewInput = {
  contact: Contact;
  facts: Fact[];
  observations: Observation[];
  events: EventListItem[];
};

const POSITIVE_SENTIMENT_KEYS = new Set([
  "calm",
  "content",
  "excited",
  "good",
  "grateful",
  "happy",
  "hopeful",
  "joy",
  "joyful",
  "peaceful",
  "positive",
  "proud",
]);

const NEUTRAL_SENTIMENT_KEYS = new Set(["fine", "neutral", "okay", "ok"]);

const NEGATIVE_SENTIMENT_KEYS = new Set([
  "afraid",
  "angry",
  "anxious",
  "bad",
  "depressed",
  "difficult",
  "fear",
  "frustrated",
  "lonely",
  "negative",
  "overwhelmed",
  "sad",
  "stressed",
  "upset",
]);

export function getConnectionBand(connection_strength: number): ConnectionBand {
  const score = clampScore(connection_strength);

  if (score >= 76) {
    return { label: "Strong", tone: "positive", score };
  }

  if (score >= 51) {
    return { label: "Steady", tone: "neutral", score };
  }

  if (score >= 26) {
    return { label: "Needs context", tone: "watch", score };
  }

  return { label: "Quiet", tone: "muted", score };
}

export function getTrendPresentation(
  relationship_trend: RelationshipTrend,
): TrendPresentation {
  if (relationship_trend === "growing") {
    return {
      label: "Growing",
      eyebrow: "Trend",
      tone: "positive",
      value: relationship_trend,
    };
  }

  if (relationship_trend === "stable") {
    return {
      label: "Steady",
      eyebrow: "Trend",
      tone: "neutral",
      value: relationship_trend,
    };
  }

  if (relationship_trend === "fading") {
    return {
      label: "Slowing",
      eyebrow: "Trend",
      tone: "watch",
      value: relationship_trend,
    };
  }

  if (relationship_trend === "dormant") {
    return {
      label: "Quiet",
      eyebrow: "Trend",
      tone: "muted",
      value: relationship_trend,
    };
  }

  return {
    label: "Unknown",
    eyebrow: "Trend",
    tone: "muted",
    value: relationship_trend,
  };
}

export function getFrequencyLabel(interaction_frequency_score: number): string {
  const score = clampScore(interaction_frequency_score);

  if (score === 0) {
    return "No rhythm yet";
  }

  if (score >= 76) {
    return "Frequent";
  }

  if (score >= 51) {
    return "Occasional";
  }

  return "Quiet rhythm";
}

export function getDiversityLabel(interaction_diversity_score: number): string {
  const score = clampScore(interaction_diversity_score);

  if (score === 0) {
    return "Not enough context";
  }

  if (score >= 76) {
    return "Varied";
  }

  if (score >= 51) {
    return "Some variety";
  }

  return "Narrow";
}

export function getSentimentSummary(
  sentiment_profile: SentimentProfile | null | undefined,
): SentimentSummary {
  const parts = Object.entries(sentiment_profile ?? {})
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label);
    });
  const total = parts.reduce((sum, part) => sum + part.count, 0);

  if (total === 0) {
    return {
      label: "No mood signal",
      detail: "No mood signals yet",
      tone: "muted",
      total: 0,
      dominantMood: null,
      parts: [],
    };
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let otherCount = 0;

  for (const part of parts) {
    const normalizedLabel = normalizeSentimentKey(part.label);

    if (POSITIVE_SENTIMENT_KEYS.has(normalizedLabel)) {
      positiveCount += part.count;
    } else if (NEUTRAL_SENTIMENT_KEYS.has(normalizedLabel)) {
      neutralCount += part.count;
    } else if (NEGATIVE_SENTIMENT_KEYS.has(normalizedLabel)) {
      negativeCount += part.count;
    } else {
      otherCount += part.count;
    }
  }

  const dominantPart = parts[0] ?? null;
  const secondPart = parts[1] ?? null;
  const dominantMood = dominantPart?.label ?? null;
  const dominantShare = dominantPart ? dominantPart.count / total : 0;
  const hasClearDominantMood =
    parts.length === 1 ||
    (dominantShare >= 0.6 &&
      (!secondPart || dominantPart.count > secondPart.count));
  const summaryParts = parts.map((part) => ({
    ...part,
    percent: Math.round((part.count / total) * 100),
  }));

  if (dominantMood && hasClearDominantMood) {
    return {
      label: formatMoodLabel(dominantMood),
      detail: moodSignalDetail(total, dominantMood),
      tone: toneForSentimentKey(dominantMood),
      total,
      dominantMood,
      parts: summaryParts,
    };
  }

  if (total <= 2) {
    return {
      label: "Limited signal",
      detail: moodSignalDetail(total, dominantMood),
      tone: "watch",
      total,
      dominantMood,
      parts: summaryParts,
    };
  }

  if (positiveCount > negativeCount + neutralCount + otherCount) {
    return {
      label: "Mostly positive",
      detail: moodSignalDetail(total, dominantMood),
      tone: "positive",
      total,
      dominantMood,
      parts: summaryParts,
    };
  }

  if (negativeCount > positiveCount + neutralCount + otherCount) {
    return {
      label: "Mostly difficult",
      detail: moodSignalDetail(total, dominantMood),
      tone: "watch",
      total,
      dominantMood,
      parts: summaryParts,
    };
  }

  return {
    label: "Mixed",
    detail: moodSignalDetail(total, dominantMood),
    tone: "neutral",
    total,
    dominantMood,
    parts: summaryParts,
  };
}

export function selectRememberNextTimeItems(
  facts: Fact[],
  observations: Observation[],
): RememberNextTimeItem[] {
  const factItems = facts
    .map((fact, index) => ({
      fact,
      index,
      text: normalizeText(fact.detail_value),
    }))
    .filter((item) => item.text.length > 0)
    .sort((left, right) => {
      if (left.text.length !== right.text.length) {
        return left.text.length - right.text.length;
      }

      return left.index - right.index;
    })
    .map(({ fact, text }) => ({
      id: `fact-${String(fact.id)}`,
      sourceId: fact.id,
      source: "fact" as const,
      text: truncateText(text, 96),
      fullText: text,
    }));

  const observationItems = observations
    .filter((observation) => observation.is_active)
    .map((observation) => ({
      observation,
      text: normalizeText(observation.body),
    }))
    .filter((item) => item.text.length > 0)
    .sort(
      (left, right) =>
        timestampValue(right.observation.created_timestamp) -
        timestampValue(left.observation.created_timestamp),
    )
    .map(({ observation, text }) => ({
      id: `observation-${String(observation.id)}`,
      sourceId: observation.id,
      source: "observation" as const,
      text: truncateText(text, 96),
      fullText: text,
    }));

  return [...factItems, ...observationItems].slice(0, 2);
}

export function selectStorySoFarEvents(
  events: EventListItem[],
): StorySoFarEvent[] {
  return [...events]
    .sort((left, right) => {
      const tierDifference = tierRank(right.tier) - tierRank(left.tier);

      if (tierDifference !== 0) {
        return tierDifference;
      }

      return (
        timestampValue(right.event_timestamp) -
        timestampValue(left.event_timestamp)
      );
    })
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      title: normalizeText(event.title) || "Untitled event",
      dateLabel: formatDateLabel(event.event_timestamp),
      eventTimestamp: event.event_timestamp,
      tier: event.tier,
      locationLabel: normalizeText(event.location_label),
      journaled: event.journaled,
    }));
}

export function buildRelationshipSnapshot({
  contact,
  events,
}: BuildOverviewInput): RelationshipSnapshot {
  const sortedEvents = sortRecentEvents(events);
  const latestEvent = sortedEvents[0] ?? null;
  const eventCount = events.length;
  const displayName = getContactDisplayName(contact);
  const firstName = normalizeText(contact.first_name) || displayName;
  const details: string[] = [];

  if (contact.relation_name) {
    details.push(`${displayName} is saved as ${contact.relation_name}.`);
  }

  if (!latestEvent) {
    return {
      headline:
        "Not enough shared moments yet. Add an event to start building this relationship story.",
      details: [],
      latestEvent: null,
      eventCount: 0,
      emptyState: "Add events to build this story",
    };
  }

  if (eventCount === 1) {
    return {
      headline: `You have one recorded moment with ${firstName} so far. Add a few facts or observations to build a fuller picture of your relationship over time.`,
      details: [],
      latestEvent,
      eventCount,
      emptyState: null,
    };
  }

  return {
    headline: `You have shared ${eventCount} recorded moments with ${firstName}. The latest was ${normalizeText(latestEvent.title) || "Untitled event"}.`,
    details,
    latestEvent,
    eventCount,
    emptyState: null,
  };
}

export function buildContactOverviewModel({
  contact,
  facts,
  observations,
  events,
}: BuildOverviewInput): ContactOverviewModel {
  const rememberNextTimeItems = selectRememberNextTimeItems(
    facts,
    observations,
  );
  const storySoFarEvents = selectStorySoFarEvents(events);

  return {
    contactId: contact.id,
    displayName: getContactDisplayName(contact),
    relationshipLabel: contact.relation_name,
    contextLine: buildContextLine(contact),
    connectionBand: getConnectionBand(contact.connection_strength),
    trend: getTrendPresentation(contact.relationship_trend),
    frequencyLabel: getFrequencyLabel(contact.interaction_frequency_score),
    diversityLabel: getDiversityLabel(contact.interaction_diversity_score),
    sentiment: getSentimentSummary(contact.sentiment_profile),
    rememberNextTimeItems,
    rememberNextTimeEmptyState: getRememberNextTimeEmptyState(
      facts,
      observations,
      rememberNextTimeItems,
    ),
    storySoFarEvents,
    storySoFarEmptyState:
      events.length === 0 ? "Add events to build this story" : null,
    relationshipSnapshot: buildRelationshipSnapshot({
      contact,
      facts,
      observations,
      events,
    }),
  };
}

function getRememberNextTimeEmptyState(
  facts: Fact[],
  observations: Observation[],
  items: RememberNextTimeItem[],
): ContactOverviewModel["rememberNextTimeEmptyState"] {
  if (items.length > 0) {
    return null;
  }

  return "No facts saved yet";
}

function buildContextLine(contact: Contact): string {
  const role = normalizeText(
    contact.custom_occupation || contact.occupation_name || "",
  );
  const relation = normalizeText(contact.relation_name || "");
  const parts = [relation, role].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Saved contact";
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatDateLabel(value: string): string {
  const normalized = normalizeText(value);

  if (!normalized) {
    return "";
  }

  const dateOnly = /^(\d{4}-\d{2}-\d{2})/.exec(normalized);

  return dateOnly?.[1] ?? normalized;
}

function getContactDisplayName(contact: Contact): string {
  const name = [contact.first_name, contact.middle_name, contact.last_name]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");

  return name || "Unnamed contact";
}

function normalizeSentimentKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

function toneForSentimentKey(label: string): OverviewTone {
  const normalizedLabel = normalizeSentimentKey(label);

  if (POSITIVE_SENTIMENT_KEYS.has(normalizedLabel)) {
    return "positive";
  }

  if (NEGATIVE_SENTIMENT_KEYS.has(normalizedLabel)) {
    return "watch";
  }

  return "neutral";
}

function formatMoodLabel(label: string): string {
  const displayLabel = label
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[\s_-]+/g, " ");

  return displayLabel
    ? `${displayLabel.charAt(0).toUpperCase()}${displayLabel.slice(1)}`
    : "Mood";
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function sortRecentEvents(events: EventListItem[]): EventListItem[] {
  return [...events].sort(
    (left, right) =>
      timestampValue(right.event_timestamp) -
      timestampValue(left.event_timestamp),
  );
}

function tierRank(tier: EventTier): number {
  return tier === "milestone" ? 1 : 0;
}

function timestampValue(value: string): number {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function moodSignalDetail(total: number, dominantMood: string | null): string {
  const signalCopy = `${total} mood ${total === 1 ? "signal" : "signals"}`;

  return dominantMood ? `${signalCopy} (${dominantMood})` : signalCopy;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}
