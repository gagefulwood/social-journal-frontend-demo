import type { ApiId } from "@/types/api";
import type { Fact, Observation } from "@/types/contacts";
import type { ObservationMarker } from "@/types/lookups";

export type ContextFactCategory = {
  id: ApiId;
  icon: string | null;
  name: string;
  parent: {
    id: ApiId;
    name: string;
  } | null;
};

export type ContextFact = {
  category: ContextFactCategory | null;
  id: ApiId;
  isConversationCue: boolean;
  isPinned: boolean;
  label: string | null;
  pinnedAt: string | null;
  value: string;
};

export type ContextObservationType =
  | "notice"
  | "conversation_cue"
  | "appreciation"
  | "change"
  | "unknown";

export type ContextObservationStatus = "current" | "revisit_later" | "archived";

export type ContextObservationMarker = {
  color: string | null;
  icon: string | null;
  id: ApiId;
  name: string;
};

export type ContextObservation = {
  archivedAt: string | null;
  body: string;
  event: {
    id: ApiId;
    occurredAt: string | null;
    title: string;
  } | null;
  id: ApiId;
  isPinned: boolean;
  marker: ContextObservationMarker | null;
  occurredAt: string | null;
  pinnedAt: string | null;
  recordedAt: string | null;
  status: ContextObservationStatus;
  type: ContextObservationType;
};

export function mapContextFact(fact: Fact): ContextFact {
  return {
    id: fact.id,
    label: fact.label?.trim() || null,
    value: fact.value || fact.detail_value,
    category: fact.category_summary
      ? {
          id: fact.category_summary.id,
          name: fact.category_summary.name,
          icon: fact.category_summary.icon_reference || null,
          parent: fact.category_summary.parent,
        }
      : null,
    isConversationCue: fact.is_conversation_cue,
    isPinned: fact.is_pinned,
    pinnedAt: fact.pinned_at,
  };
}

export function mapContextFacts(facts: Fact[]): ContextFact[] {
  return facts.map(mapContextFact);
}

export function mapContextObservation(
  observation: Observation,
  markers: ObservationMarker[],
): ContextObservation {
  const marker = markers.find((item) => idsMatch(item.id, observation.marker));

  return {
    id: observation.id,
    body: observation.body,
    type: normalizeObservationType(observation.observation_type),
    status: observation.status,
    occurredAt: observation.occurred_at,
    recordedAt: observation.created_timestamp,
    archivedAt: observation.archived_at,
    isPinned: observation.is_pinned,
    pinnedAt: observation.pinned_at,
    event: observation.event_summary
      ? {
          id: observation.event_summary.id,
          title: observation.event_summary.title,
          occurredAt: observation.event_summary.event_timestamp,
        }
      : null,
    marker: marker
      ? {
          id: marker.id,
          name: marker.name,
          icon: marker.icon_reference || null,
          color: marker.color_hex || null,
        }
      : null,
  };
}

export function mapContextObservations(
  observations: Observation[],
  markers: ObservationMarker[],
): ContextObservation[] {
  return observations.map((observation) =>
    mapContextObservation(observation, markers),
  );
}

export function getContextObservationTypeLabel(
  type: ContextObservationType,
): string | null {
  const labels: Record<Exclude<ContextObservationType, "unknown">, string> = {
    notice: "Notice",
    conversation_cue: "Conversation cue",
    appreciation: "Appreciation",
    change: "Change",
  };

  return type === "unknown" ? null : labels[type];
}

function normalizeObservationType(
  type: Observation["observation_type"],
): ContextObservationType {
  if (
    type === "notice" ||
    type === "conversation_cue" ||
    type === "appreciation" ||
    type === "change"
  ) {
    return type;
  }

  return "unknown";
}

function idsMatch(
  left: ApiId | null | undefined,
  right: ApiId | null | undefined,
): boolean {
  return left != null && right != null && String(left) === String(right);
}
