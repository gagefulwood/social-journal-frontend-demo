import { getObservationStatusPresentation } from "@/lib/presentation/observationStatusPresentation";
import {
  getPinPresentation,
  type PinPresentation,
} from "@/lib/presentation/pinPresentation";
import { getPresentationTokens } from "@/lib/presentation/semanticTokens";
import type {
  IconIdentifier,
  ObservationMarkerKey,
  ObservationSourceKey,
  ObservationTypeKey,
  SemanticPresentation,
} from "@/lib/presentation/types";
import type { ObservationStatus, ObservationType } from "@/types/contacts";

export type ObservationMarkerPresentationInput = {
  name?: string | null;
  icon?: string | null;
  icon_reference?: string | null;
};

export type ObservationPresentationInput = {
  type?: Exclude<ObservationType, null> | "unknown" | null;
  observation_type?: ObservationType;
  status: ObservationStatus;
  marker?: ObservationMarkerPresentationInput | null;
  isPinned?: boolean;
  is_pinned?: boolean;
  event?: unknown;
};

export type ObservationTypePresentation =
  SemanticPresentation<ObservationTypeKey>;
export type ObservationMarkerPresentation =
  SemanticPresentation<ObservationMarkerKey>;
export type ObservationPrimaryPresentation = SemanticPresentation<
  ObservationTypeKey | ObservationMarkerKey
>;
export type ObservationSourcePresentation =
  SemanticPresentation<ObservationSourceKey>;

export type ObservationPresentation = {
  type: ObservationTypePresentation;
  marker: ObservationMarkerPresentation;
  status: ReturnType<typeof getObservationStatusPresentation>;
  pin: PinPresentation;
  primary: ObservationPrimaryPresentation;
  sourceEvent: ObservationSourcePresentation | null;
};

type PresentationDefinition<Key extends string> = {
  key: Key;
  label: string;
  icon: IconIdentifier;
};

const typeDefinitions = {
  notice: {
    key: "observationType.notice",
    label: "Notice",
    icon: "lightbulb",
  },
  conversation_cue: {
    key: "observationType.conversationCue",
    label: "Conversation cue",
    icon: "message-square-text",
  },
  appreciation: {
    key: "observationType.appreciation",
    label: "Appreciation",
    icon: "heart",
  },
  change: {
    key: "observationType.change",
    label: "Change",
    icon: "refresh-cw",
  },
} satisfies Record<string, PresentationDefinition<ObservationTypeKey>>;

const markerDefinitions = {
  general: {
    key: "observationMarker.general",
    label: "General",
    icon: "message-square-text",
  },
  important: {
    key: "observationMarker.important",
    label: "Important",
    icon: "star",
  },
  reminder: {
    key: "observationMarker.reminder",
    label: "Reminder",
    icon: "bell",
  },
} satisfies Record<string, PresentationDefinition<ObservationMarkerKey>>;

const markerIconReferences: Record<string, IconIdentifier> = {
  FiBell: "bell",
  FiFileText: "message-square-text",
  FiInfo: "message-square-text",
  FiStar: "star",
};

const typeVariants = {
  iconTile: "observationIconTile.type",
  timelineNode: "observationTimelineNode.type",
  chip: "observationTypeTag.type",
} as const;

const markerVariants = {
  iconTile: "observationIconTile.type",
  timelineNode: "observationTimelineNode.type",
  chip: "observationTypeTag.type",
} as const;

const sourceEventPresentation: ObservationSourcePresentation = {
  key: "observationSource.event",
  label: "Event",
  icon: "map-pin",
  tokens: getPresentationTokens("observationSource.event"),
  variants: { chip: "sourceEventChip.observation" },
  source: "derived",
};

export function getObservationPresentation(
  observation: ObservationPresentationInput,
  resolvedMarker?: ObservationMarkerPresentationInput | null,
  pinPending = false,
): ObservationPresentation {
  const type = getObservationTypePresentation(
    observation.type ?? observation.observation_type ?? "unknown",
  );
  const markerInput =
    resolvedMarker === undefined ? observation.marker : resolvedMarker;
  const marker = getObservationMarkerPresentation(markerInput);
  const primary =
    type.key === "observationType.unknown" &&
    marker.key !== "observationMarker.none"
      ? marker
      : type;
  const isPinned = observation.isPinned ?? observation.is_pinned ?? false;

  return {
    type,
    marker,
    status: getObservationStatusPresentation(observation.status),
    pin: getPinPresentation(isPinned, pinPending, "observation"),
    primary,
    sourceEvent: observation.event ? sourceEventPresentation : null,
  };
}

export function getObservationTypePresentation(
  type: Exclude<ObservationType, null> | "unknown",
): ObservationTypePresentation {
  const definition =
    typeDefinitions[type as keyof typeof typeDefinitions] ?? undefined;

  if (definition) {
    return createTypePresentation(definition, "enum");
  }

  return createTypePresentation(
    {
      key: "observationType.unknown",
      label: "Observation",
      icon: "message-square-text",
    },
    "fallback",
  );
}

export function getObservationMarkerPresentation(
  marker: ObservationMarkerPresentationInput | null | undefined,
): ObservationMarkerPresentation {
  if (!marker) {
    return createMarkerPresentation(
      {
        key: "observationMarker.none",
        label: "No marker",
        icon: "circle",
      },
      "fallback",
    );
  }

  const normalizedName = normalizeMarkerName(marker.name);
  const definition = normalizedName
    ? markerDefinitions[normalizedName as keyof typeof markerDefinitions]
    : undefined;

  if (definition) {
    return createMarkerPresentation(definition, "lookup");
  }

  const iconReference = marker.icon_reference || marker.icon || "";

  return createMarkerPresentation(
    {
      key: "observationMarker.custom",
      label: marker.name?.trim() || "Custom marker",
      icon: markerIconReferences[iconReference] ?? "circle",
    },
    "lookup",
  );
}

function createTypePresentation(
  definition: PresentationDefinition<ObservationTypeKey>,
  source: ObservationTypePresentation["source"],
): ObservationTypePresentation {
  return {
    ...definition,
    tokens: getPresentationTokens(definition.key),
    variants: typeVariants,
    source,
  };
}

function createMarkerPresentation(
  definition: PresentationDefinition<ObservationMarkerKey>,
  source: ObservationMarkerPresentation["source"],
): ObservationMarkerPresentation {
  return {
    ...definition,
    tokens: getPresentationTokens(definition.key),
    variants: markerVariants,
    source,
  };
}

function normalizeMarkerName(value: string | null | undefined) {
  const normalized = value
    ?.trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ");

  return normalized || null;
}
