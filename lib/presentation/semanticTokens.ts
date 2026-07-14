import type {
  ObservationCardVariant,
  ObservationStatusKey,
  PresentationTokens,
  SemanticPresentationKey,
  SemanticTokenRef,
  SemanticTokenRole,
} from "@/lib/presentation/types";

type PresentationTokenClassSet = Record<SemanticTokenRole, string>;

const neutralTokens: PresentationTokenClassSet = {
  surface: "bg-muted",
  foreground: "text-muted-foreground",
  border: "border-border",
  emphasis: "ring-border",
};

const accentTokens: PresentationTokenClassSet = {
  surface: "bg-accent",
  foreground: "text-accent-foreground",
  border: "border-primary/20",
  emphasis: "ring-primary/20",
};

const successTokens: PresentationTokenClassSet = {
  surface: "bg-success-muted",
  foreground: "text-success",
  border: "border-success/25",
  emphasis: "ring-success/25",
};

const infoTokens: PresentationTokenClassSet = {
  surface: "bg-info-muted",
  foreground: "text-info",
  border: "border-info/25",
  emphasis: "ring-info/25",
};

const warningTokens: PresentationTokenClassSet = {
  surface: "bg-warning-muted",
  foreground: "text-warning",
  border: "border-warning/25",
  emphasis: "ring-warning/25",
};

const destructiveTokens: PresentationTokenClassSet = {
  surface: "bg-destructive/10",
  foreground: "text-destructive",
  border: "border-destructive/25",
  emphasis: "ring-destructive/25",
};

const roseCategoryTokens: PresentationTokenClassSet = {
  surface: "bg-marker-rose",
  foreground: "text-marker-rose-foreground",
  border: "border-marker-rose",
  emphasis: "ring-marker-rose-foreground/25",
};

const fuchsiaCategoryTokens: PresentationTokenClassSet = {
  surface: "bg-marker-fuchsia",
  foreground: "text-marker-fuchsia-foreground",
  border: "border-marker-fuchsia",
  emphasis: "ring-marker-fuchsia-foreground/25",
};

const indigoCategoryTokens: PresentationTokenClassSet = {
  surface: "bg-marker-indigo",
  foreground: "text-marker-indigo-foreground",
  border: "border-marker-indigo",
  emphasis: "ring-marker-indigo-foreground/25",
};

const tealCategoryTokens: PresentationTokenClassSet = {
  surface: "bg-marker-teal",
  foreground: "text-marker-teal-foreground",
  border: "border-marker-teal",
  emphasis: "ring-marker-teal-foreground/25",
};

const observationSourceTokens: PresentationTokenClassSet = {
  surface: "bg-info-muted/30",
  foreground: "text-info",
  border: "border-info/15",
  emphasis: "ring-info/20",
};

const observationSurfaceTokenStyles = {
  "observationStatus.current": {
    standardCard: {
      surface: "bg-success-muted/15",
      foreground: "text-success",
      border: "border-success/15",
      emphasis: "ring-success/15",
    },
    compactCard: {
      surface: "bg-card",
      foreground: "text-success",
      border: "border-success/15",
      emphasis: "ring-success/15",
    },
    featuredCard: {
      surface: "bg-success-muted/10",
      foreground: "text-success",
      border: "border-success/15",
      emphasis: "ring-success/15",
    },
  },
  "observationStatus.revisitLater": {
    standardCard: {
      surface: "bg-warning-muted/15",
      foreground: "text-warning",
      border: "border-warning/15",
      emphasis: "ring-warning/15",
    },
    compactCard: {
      surface: "bg-card",
      foreground: "text-warning",
      border: "border-warning/15",
      emphasis: "ring-warning/15",
    },
    featuredCard: {
      surface: "bg-warning-muted/10",
      foreground: "text-warning",
      border: "border-warning/15",
      emphasis: "ring-warning/15",
    },
  },
  "observationStatus.archived": {
    standardCard: {
      surface: "bg-muted/15",
      foreground: "text-muted-foreground",
      border: "border-border/70",
      emphasis: "ring-border/60",
    },
    compactCard: {
      surface: "bg-card",
      foreground: "text-muted-foreground",
      border: "border-border/70",
      emphasis: "ring-border/60",
    },
    featuredCard: {
      surface: "bg-muted/10",
      foreground: "text-muted-foreground",
      border: "border-border/60",
      emphasis: "ring-border/50",
    },
  },
} satisfies Record<
  ObservationStatusKey,
  Record<ObservationCardVariant, PresentationTokenClassSet>
>;

export const SEMANTIC_TOKEN_STYLES = {
  "eventContext.social": infoTokens,
  "eventContext.professional": successTokens,
  "eventContext.family": warningTokens,
  "eventContext.custom": accentTokens,
  "eventContext.uncategorized": neutralTokens,
  "eventTier.routine": neutralTokens,
  "eventTier.milestone": warningTokens,
  "eventImpact.negative": destructiveTokens,
  "eventImpact.neutral": neutralTokens,
  "eventImpact.positive": successTokens,
  "eventImpact.unrecorded": neutralTokens,
  "interactionMode.inPerson": accentTokens,
  "interactionMode.phoneCall": infoTokens,
  "interactionMode.videoCall": infoTokens,
  "interactionMode.textMessage": accentTokens,
  "interactionMode.email": infoTokens,
  "interactionMode.socialMedia": accentTokens,
  "interactionMode.other": neutralTokens,
  "interactionMode.custom": neutralTokens,
  "derivedEventKind.celebration": roseCategoryTokens,
  "derivedEventKind.foodOrCoffee": warningTokens,
  "derivedEventKind.remote": infoTokens,
  "derivedEventKind.outdoorActivity": successTokens,
  "derivedEventKind.workOrLearning": infoTokens,
  "derivedEventKind.personal": roseCategoryTokens,
  "derivedEventKind.social": accentTokens,
  "derivedEventKind.default": neutralTokens,
  "journalState.complete": successTokens,
  "journalState.empty": neutralTokens,
  "factCategory.preferences": roseCategoryTokens,
  "factCategory.routinesGoals": fuchsiaCategoryTokens,
  "factCategory.workSchool": tealCategoryTokens,
  "factCategory.importantDates": indigoCategoryTokens,
  "factCategory.familyRelationships": roseCategoryTokens,
  "factCategory.practicalDetails": tealCategoryTokens,
  "factCategory.custom": accentTokens,
  "factCategory.uncategorized": neutralTokens,
  "pinState.pinned": accentTokens,
  "pinState.unpinned": neutralTokens,
  "pinState.pending": infoTokens,
  "observationType.notice": accentTokens,
  "observationType.conversationCue": roseCategoryTokens,
  "observationType.appreciation": tealCategoryTokens,
  "observationType.change": indigoCategoryTokens,
  "observationType.unknown": neutralTokens,
  "observationStatus.current": successTokens,
  "observationStatus.revisitLater": warningTokens,
  "observationStatus.archived": neutralTokens,
  "observationMarker.general": accentTokens,
  "observationMarker.important": indigoCategoryTokens,
  "observationMarker.reminder": indigoCategoryTokens,
  "observationMarker.custom": accentTokens,
  "observationMarker.none": neutralTokens,
  "observationSource.event": observationSourceTokens,
} satisfies Record<SemanticPresentationKey, PresentationTokenClassSet>;

export function getPresentationTokens(
  key: SemanticPresentationKey,
): PresentationTokens {
  return {
    surface: `${key}.surface`,
    foreground: `${key}.foreground`,
    border: `${key}.border`,
    emphasis: `${key}.emphasis`,
  };
}

export function resolveSemanticTokenClass<Role extends SemanticTokenRole>(
  reference: SemanticTokenRef<Role>,
  role: Role,
): string {
  const suffix = `.${role}`;
  const key = reference.slice(0, -suffix.length) as SemanticPresentationKey;
  return SEMANTIC_TOKEN_STYLES[key][role];
}

export function resolvePresentationTokenClasses(tokens: PresentationTokens) {
  return {
    surface: resolveSemanticTokenClass(tokens.surface, "surface"),
    foreground: resolveSemanticTokenClass(tokens.foreground, "foreground"),
    border: resolveSemanticTokenClass(tokens.border, "border"),
    emphasis: tokens.emphasis
      ? resolveSemanticTokenClass(tokens.emphasis, "emphasis")
      : undefined,
  };
}

export function resolveObservationSurfaceTokenClasses(
  status: ObservationStatusKey,
  variant: ObservationCardVariant,
) {
  return observationSurfaceTokenStyles[status][variant];
}
