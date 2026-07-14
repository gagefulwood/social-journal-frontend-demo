export const EVENT_CONTEXT_KEYS = [
  "eventContext.social",
  "eventContext.professional",
  "eventContext.family",
  "eventContext.custom",
  "eventContext.uncategorized",
] as const;

export const EVENT_TIER_KEYS = [
  "eventTier.routine",
  "eventTier.milestone",
] as const;

export const EVENT_IMPACT_KEYS = [
  "eventImpact.negative",
  "eventImpact.neutral",
  "eventImpact.positive",
  "eventImpact.unrecorded",
] as const;

export const INTERACTION_MODE_KEYS = [
  "interactionMode.inPerson",
  "interactionMode.phoneCall",
  "interactionMode.videoCall",
  "interactionMode.textMessage",
  "interactionMode.email",
  "interactionMode.socialMedia",
  "interactionMode.other",
  "interactionMode.custom",
] as const;

export const DERIVED_EVENT_KIND_KEYS = [
  "derivedEventKind.celebration",
  "derivedEventKind.foodOrCoffee",
  "derivedEventKind.remote",
  "derivedEventKind.outdoorActivity",
  "derivedEventKind.workOrLearning",
  "derivedEventKind.personal",
  "derivedEventKind.social",
  "derivedEventKind.default",
] as const;

export const JOURNAL_STATE_KEYS = [
  "journalState.complete",
  "journalState.empty",
] as const;

export const FACT_CATEGORY_KEYS = [
  "factCategory.preferences",
  "factCategory.routinesGoals",
  "factCategory.workSchool",
  "factCategory.importantDates",
  "factCategory.familyRelationships",
  "factCategory.practicalDetails",
  "factCategory.custom",
  "factCategory.uncategorized",
] as const;

export const PIN_STATE_KEYS = [
  "pinState.pinned",
  "pinState.unpinned",
  "pinState.pending",
] as const;

export const OBSERVATION_TYPE_KEYS = [
  "observationType.notice",
  "observationType.conversationCue",
  "observationType.appreciation",
  "observationType.change",
  "observationType.unknown",
] as const;

export const OBSERVATION_STATUS_KEYS = [
  "observationStatus.current",
  "observationStatus.revisitLater",
  "observationStatus.archived",
] as const;

export const OBSERVATION_CARD_VARIANTS = [
  "standardCard",
  "compactCard",
  "featuredCard",
] as const;

export const OBSERVATION_MARKER_KEYS = [
  "observationMarker.general",
  "observationMarker.important",
  "observationMarker.reminder",
  "observationMarker.custom",
  "observationMarker.none",
] as const;

export const OBSERVATION_SOURCE_KEYS = ["observationSource.event"] as const;

export const SEMANTIC_PRESENTATION_KEYS = [
  ...EVENT_CONTEXT_KEYS,
  ...EVENT_TIER_KEYS,
  ...EVENT_IMPACT_KEYS,
  ...INTERACTION_MODE_KEYS,
  ...DERIVED_EVENT_KIND_KEYS,
  ...JOURNAL_STATE_KEYS,
  ...FACT_CATEGORY_KEYS,
  ...PIN_STATE_KEYS,
  ...OBSERVATION_TYPE_KEYS,
  ...OBSERVATION_STATUS_KEYS,
  ...OBSERVATION_MARKER_KEYS,
  ...OBSERVATION_SOURCE_KEYS,
] as const;

export type EventContextKey = (typeof EVENT_CONTEXT_KEYS)[number];
export type EventTierKey = (typeof EVENT_TIER_KEYS)[number];
export type EventImpactKey = (typeof EVENT_IMPACT_KEYS)[number];
export type InteractionModeKey = (typeof INTERACTION_MODE_KEYS)[number];
export type DerivedEventKindKey = (typeof DERIVED_EVENT_KIND_KEYS)[number];
export type JournalStateKey = (typeof JOURNAL_STATE_KEYS)[number];
export type FactCategoryKey = (typeof FACT_CATEGORY_KEYS)[number];
export type PinStateKey = (typeof PIN_STATE_KEYS)[number];
export type ObservationTypeKey = (typeof OBSERVATION_TYPE_KEYS)[number];
export type ObservationStatusKey = (typeof OBSERVATION_STATUS_KEYS)[number];
export type ObservationCardVariant = (typeof OBSERVATION_CARD_VARIANTS)[number];
export type ObservationMarkerKey = (typeof OBSERVATION_MARKER_KEYS)[number];
export type ObservationSourceKey = (typeof OBSERVATION_SOURCE_KEYS)[number];
export type SemanticPresentationKey =
  (typeof SEMANTIC_PRESENTATION_KEYS)[number];

export type SemanticTokenRole =
  | "surface"
  | "foreground"
  | "border"
  | "emphasis";

export type SemanticTokenRef<
  Role extends SemanticTokenRole = SemanticTokenRole,
> = `${SemanticPresentationKey}.${Role}`;

export type PresentationTokens = {
  surface: SemanticTokenRef<"surface">;
  foreground: SemanticTokenRef<"foreground">;
  border: SemanticTokenRef<"border">;
  emphasis?: SemanticTokenRef<"emphasis">;
};

export type IconIdentifier =
  | "alert-circle"
  | "archive"
  | "bell"
  | "book-open"
  | "briefcase-business"
  | "calendar-days"
  | "calendar-clock"
  | "check-circle-2"
  | "circle"
  | "coffee"
  | "clipboard-list"
  | "compass"
  | "footprints"
  | "gift"
  | "graduation-cap"
  | "heart"
  | "heart-handshake"
  | "home"
  | "info"
  | "lightbulb"
  | "loader-circle"
  | "mail"
  | "map-pin"
  | "message-circle"
  | "message-square-text"
  | "minus"
  | "more-horizontal"
  | "phone"
  | "pin"
  | "refresh-cw"
  | "share-2"
  | "shield"
  | "star"
  | "trending-down"
  | "trending-up"
  | "user"
  | "user-round"
  | "users"
  | "users-round"
  | "video";

export type PresentationVariant =
  | "eventIconTile.context"
  | "eventIconTile.derivedKind"
  | "eventIconTile.impact"
  | "eventIconTile.interactionMode"
  | "eventIconTile.tier"
  | "eventSemanticChip.context"
  | "eventSemanticChip.tier"
  | "eventCard.default"
  | "eventTimelineNode.context"
  | "eventTimelineNode.derivedKind"
  | "eventTimelineNode.tier"
  | "journalStateIndicator.status"
  | "factCategoryIconTile.category"
  | "factCategoryHeader.category"
  | "factCategoryCount.category"
  | "pinStateIndicator.status"
  | "pinnedStateTag.status"
  | "observationIconTile.type"
  | "observationTimelineNode.type"
  | "observationTypeTag.type"
  | "observationStatusTag.status"
  | "observationSurface.standardCard"
  | "observationSurface.compactCard"
  | "observationSurface.featuredCard"
  | "sourceEventChip.observation";

export type PresentationSource = "enum" | "lookup" | "derived" | "fallback";

export type SemanticPresentation<
  Key extends SemanticPresentationKey = SemanticPresentationKey,
> = {
  key: Key;
  label: string;
  icon: IconIdentifier;
  tokens: PresentationTokens;
  variants: {
    iconTile?: PresentationVariant;
    chip?: PresentationVariant;
    card?: PresentationVariant;
    timelineNode?: PresentationVariant;
    indicator?: PresentationVariant;
    header?: PresentationVariant;
    count?: PresentationVariant;
  };
  source: PresentationSource;
};
