import { getPresentationTokens } from "@/lib/presentation/semanticTokens";
import type {
  DerivedEventKindKey,
  EventContextKey,
  EventImpactKey,
  EventTierKey,
  IconIdentifier,
  InteractionModeKey,
  PresentationSource,
  PresentationVariant,
  SemanticPresentation,
} from "@/lib/presentation/types";
import type { ApiId } from "@/types/api";
import type { DashboardEvent } from "@/types/dashboard";
import type {
  Event,
  EventImpact,
  EventListItem,
  EventTier,
} from "@/types/events";

type EventLookupValue =
  | ApiId
  | {
      id?: ApiId;
      name?: string | null;
    }
  | null;

export type EventPresentationInput = {
  title?: string | null;
  tier: EventTier;
  impact?: EventImpact | null;
  context_category?: EventLookupValue;
  context_category_name?: string | null;
  interaction_mode?: EventLookupValue;
  interaction_mode_name?: string | null;
  description?: string | null;
  location_label?: string | null;
  mood?: EventLookupValue;
};

export type EventPresentationSource =
  | Event
  | EventListItem
  | DashboardEvent
  | EventPresentationInput;

export type NormalizedEventPresentationInput = {
  title: string;
  tier: EventTier;
  impact: EventImpact | null;
  context: {
    isRecorded: boolean;
    name: string | null;
  };
  interactionMode: {
    isRecorded: boolean;
    name: string | null;
  };
};

export type EventVisualPresentation = SemanticPresentation<
  DerivedEventKindKey | EventTierKey
>;

export type EventPresentation = {
  context: SemanticPresentation<EventContextKey>;
  tier: SemanticPresentation<EventTierKey>;
  impact: SemanticPresentation<EventImpactKey>;
  interactionMode: SemanticPresentation<InteractionModeKey>;
  derivedKind: SemanticPresentation<DerivedEventKindKey> | null;
  icon: EventVisualPresentation;
  semanticChip: SemanticPresentation<EventContextKey | EventTierKey>;
};

type PresentationDefinition<Key extends string> = {
  key: Key;
  label: string;
  icon: IconIdentifier;
};

const contextDefinitions = {
  social: {
    key: "eventContext.social",
    label: "Social",
    icon: "users-round",
  },
  professional: {
    key: "eventContext.professional",
    label: "Professional",
    icon: "briefcase-business",
  },
  family: {
    key: "eventContext.family",
    label: "Family",
    icon: "heart",
  },
} satisfies Record<string, PresentationDefinition<EventContextKey>>;

const interactionModeDefinitions = {
  "in person": {
    key: "interactionMode.inPerson",
    label: "In person",
    icon: "users-round",
  },
  "phone call": {
    key: "interactionMode.phoneCall",
    label: "Phone call",
    icon: "phone",
  },
  "video call": {
    key: "interactionMode.videoCall",
    label: "Video call",
    icon: "video",
  },
  "text message": {
    key: "interactionMode.textMessage",
    label: "Text message",
    icon: "message-square-text",
  },
  email: {
    key: "interactionMode.email",
    label: "Email",
    icon: "mail",
  },
  "social media": {
    key: "interactionMode.socialMedia",
    label: "Social media",
    icon: "share-2",
  },
  other: {
    key: "interactionMode.other",
    label: "Other",
    icon: "more-horizontal",
  },
} satisfies Record<string, PresentationDefinition<InteractionModeKey>>;

export function normalizeEventPresentationInput(
  input: EventPresentationInput,
): NormalizedEventPresentationInput {
  const contextName =
    normalizedOptionalText(input.context_category_name) ??
    lookupName(input.context_category);
  const interactionModeName =
    normalizedOptionalText(input.interaction_mode_name) ??
    lookupName(input.interaction_mode);

  return {
    title: input.title?.trim() ?? "",
    tier: input.tier,
    impact: input.impact ?? null,
    context: {
      isRecorded: input.context_category != null || contextName != null,
      name: contextName,
    },
    interactionMode: {
      isRecorded: input.interaction_mode != null || interactionModeName != null,
      name: interactionModeName,
    },
  };
}

export function getEventPresentation(
  input: EventPresentationSource,
): EventPresentation {
  const normalized = normalizeEventPresentationInput(input);
  const context = getEventContextPresentation(normalized);
  const tier = getEventTierPresentation(normalized.tier);
  const impact = getEventImpactPresentation(normalized.impact);
  const interactionMode = getInteractionModePresentation(normalized);
  const derivedKind = getDerivedEventKindPresentation(normalized);
  const icon = derivedKind ?? tier;

  return {
    context,
    tier,
    impact,
    interactionMode,
    derivedKind,
    icon,
    semanticChip: normalized.tier === "milestone" ? tier : context,
  };
}

function getEventContextPresentation(
  input: NormalizedEventPresentationInput,
): SemanticPresentation<EventContextKey> {
  if (!input.context.isRecorded) {
    return createPresentation(
      {
        key: "eventContext.uncategorized",
        label: "Uncategorized",
        icon: "calendar-days",
      },
      "fallback",
      contextVariants,
    );
  }

  const normalizedName = normalizeLookupName(input.context.name);
  const builtIn = normalizedName
    ? contextDefinitions[normalizedName as keyof typeof contextDefinitions]
    : undefined;

  if (builtIn) {
    return createPresentation(builtIn, "lookup", contextVariants);
  }

  return createPresentation(
    {
      key: "eventContext.custom",
      label: input.context.name || "Custom context",
      icon: "calendar-days",
    },
    "lookup",
    contextVariants,
  );
}

function getEventTierPresentation(
  tier: EventTier,
): SemanticPresentation<EventTierKey> {
  return tier === "milestone"
    ? createPresentation(
        {
          key: "eventTier.milestone",
          label: "Milestone",
          icon: "star",
        },
        "enum",
        tierVariants,
      )
    : createPresentation(
        {
          key: "eventTier.routine",
          label: "Routine",
          icon: "calendar-days",
        },
        "enum",
        tierVariants,
      );
}

function getEventImpactPresentation(
  impact: EventImpact | null,
): SemanticPresentation<EventImpactKey> {
  if (impact === "negative") {
    return createPresentation(
      {
        key: "eventImpact.negative",
        label: "Negative",
        icon: "trending-down",
      },
      "enum",
      impactVariants,
    );
  }

  if (impact === "neutral") {
    return createPresentation(
      {
        key: "eventImpact.neutral",
        label: "Neutral",
        icon: "minus",
      },
      "enum",
      impactVariants,
    );
  }

  if (impact === "positive") {
    return createPresentation(
      {
        key: "eventImpact.positive",
        label: "Positive",
        icon: "trending-up",
      },
      "enum",
      impactVariants,
    );
  }

  return createPresentation(
    {
      key: "eventImpact.unrecorded",
      label: "Impact not recorded",
      icon: "circle",
    },
    "fallback",
    impactVariants,
  );
}

function getInteractionModePresentation(
  input: NormalizedEventPresentationInput,
): SemanticPresentation<InteractionModeKey> {
  const normalizedName = normalizeLookupName(input.interactionMode.name);
  const builtIn = normalizedName
    ? interactionModeDefinitions[
        normalizedName as keyof typeof interactionModeDefinitions
      ]
    : undefined;

  if (builtIn) {
    return createPresentation(builtIn, "lookup", interactionModeVariants);
  }

  return createPresentation(
    {
      key: "interactionMode.custom",
      label:
        input.interactionMode.name ||
        (input.interactionMode.isRecorded
          ? "Custom interaction mode"
          : "Interaction mode not recorded"),
      icon: "more-horizontal",
    },
    input.interactionMode.isRecorded ? "lookup" : "fallback",
    interactionModeVariants,
  );
}

function getDerivedEventKindPresentation(
  input: NormalizedEventPresentationInput,
): SemanticPresentation<DerivedEventKindKey> | null {
  const meaning = `${input.title} ${input.context.name ?? ""} ${
    input.interactionMode.name ?? ""
  }`.toLowerCase();

  // This order preserves the legacy Event glyph resolver. In particular,
  // celebration language intentionally outranks the milestone tier.
  if (/(birthday|anniversary|celebration|holiday|gift)/.test(meaning)) {
    return derivedPresentation(
      "derivedEventKind.celebration",
      "Celebration or important date",
      "gift",
    );
  }

  if (input.tier === "milestone") {
    return null;
  }

  if (
    /(coffee|café|cafe|meal|lunch|dinner|breakfast|food|dining)/.test(meaning)
  ) {
    return derivedPresentation(
      "derivedEventKind.foodOrCoffee",
      "Food or coffee context",
      "coffee",
    );
  }

  if (/(video|online|virtual|zoom|facetime|remote|call)/.test(meaning)) {
    return derivedPresentation(
      "derivedEventKind.remote",
      "Video or online interaction",
      "video",
    );
  }

  if (
    /(outdoor|hike|walk|run|fitness|exercise|sport|trail|park)/.test(meaning)
  ) {
    return derivedPresentation(
      "derivedEventKind.outdoorActivity",
      "Outdoor or activity context",
      "footprints",
    );
  }

  if (/(work|professional|school|study|career|office|team)/.test(meaning)) {
    return derivedPresentation(
      "derivedEventKind.workOrLearning",
      "Work or learning context",
      "briefcase-business",
    );
  }

  if (/(family|romance|partner|care)/.test(meaning)) {
    return derivedPresentation(
      "derivedEventKind.personal",
      "Personal context",
      "heart",
    );
  }

  if (
    /(social|friend|community|conversation|in person|catch-up|catch up)/.test(
      meaning,
    )
  ) {
    return derivedPresentation(
      "derivedEventKind.social",
      "Social context",
      "users-round",
    );
  }

  return derivedPresentation(
    "derivedEventKind.default",
    input.context.name || "Moment",
    "calendar-days",
  );
}

function derivedPresentation(
  key: DerivedEventKindKey,
  label: string,
  icon: IconIdentifier,
) {
  return createPresentation(
    { key, label, icon },
    "derived",
    derivedKindVariants,
  );
}

type EventSemanticKey =
  | EventContextKey
  | EventTierKey
  | EventImpactKey
  | InteractionModeKey
  | DerivedEventKindKey;

function createPresentation<Key extends EventSemanticKey>(
  definition: PresentationDefinition<Key>,
  source: PresentationSource,
  variants: EventVariants,
): SemanticPresentation<Key> {
  return {
    ...definition,
    tokens: getPresentationTokens(definition.key),
    variants,
    source,
  };
}

type EventVariants = {
  iconTile: PresentationVariant;
  chip?: PresentationVariant;
  card: PresentationVariant;
  timelineNode?: PresentationVariant;
};

const contextVariants: EventVariants = {
  iconTile: "eventIconTile.context",
  chip: "eventSemanticChip.context",
  card: "eventCard.default",
  timelineNode: "eventTimelineNode.context",
};

const tierVariants: EventVariants = {
  iconTile: "eventIconTile.tier",
  chip: "eventSemanticChip.tier",
  card: "eventCard.default",
  timelineNode: "eventTimelineNode.tier",
};

const impactVariants: EventVariants = {
  iconTile: "eventIconTile.impact",
  card: "eventCard.default",
};

const interactionModeVariants: EventVariants = {
  iconTile: "eventIconTile.interactionMode",
  card: "eventCard.default",
};

const derivedKindVariants: EventVariants = {
  iconTile: "eventIconTile.derivedKind",
  card: "eventCard.default",
  timelineNode: "eventTimelineNode.derivedKind",
};

function lookupName(value: EventLookupValue | undefined): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return normalizedOptionalText(value.name);
}

function normalizedOptionalText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeLookupName(value: string | null): string | null {
  return value ? value.toLocaleLowerCase("en-US").replace(/\s+/g, " ") : null;
}
