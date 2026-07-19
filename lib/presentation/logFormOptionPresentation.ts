import {
  Activity,
  Angry,
  Annoyed,
  Armchair,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleAlert,
  CircleDotDashed,
  CircleHelp,
  CircleOff,
  Clock3,
  ClockAlert,
  CloudRain,
  Focus,
  Flower2,
  Frown,
  Gauge,
  Handshake,
  Heart,
  HeartCrack,
  HeartHandshake,
  HeartMinus,
  HeartPulse,
  Meh,
  MessageCircle,
  MessagesSquare,
  Minus,
  Moon,
  Orbit,
  PersonStanding,
  Repeat2,
  ShieldAlert,
  Smile,
  SmilePlus,
  Sprout,
  Swords,
  Unlink2,
  UserRound,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundX,
  UsersRound,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type LogFormOptionTone =
  | "neutral"
  | "lavender"
  | "info"
  | "positive"
  | "warning"
  | "negative";

export type SentimentComparisonBand = "positive" | "neutral" | "negative";

export type LogFormOptionPresentation = Readonly<{
  /** Presentation identity only; this key is never written to a Log payload. */
  key: string;
  label: string;
  icon: LucideIcon;
  tone: LogFormOptionTone;
  source: "curated" | "fallback";
  comparisonBand?: SentimentComparisonBand;
  unselectedClassName: string;
  selectedClassName: string;
  iconClassName: string;
  iconTileClassName: string;
  selectedCheckClassName: string;
}>;

export type LogFormOptionGroup =
  | "episode-categories"
  | "episode-characteristics"
  | "episode-context-tags"
  | "social-energy-before-state"
  | "social-energy-battery-effect"
  | "social-energy-mood-shift"
  | "social-energy-behavioral-effect"
  | "social-energy-recovery-timing"
  | "social-energy-interaction-context"
  | "social-energy-familiarity"
  | "social-energy-setting"
  | "social-energy-factors"
  | "emotion-states"
  | "interaction-dynamics"
  | "sentiment-connection"
  | "sentiment-initiated-by"
  | "sentiment-overall-exchange";

type OptionDefinition = Readonly<{
  key: string;
  label: string;
  icon: LucideIcon;
  tone: LogFormOptionTone;
  aliases?: readonly string[];
  comparisonBand?: SentimentComparisonBand;
}>;

type ToneClassNames = Pick<
  LogFormOptionPresentation,
  | "unselectedClassName"
  | "selectedClassName"
  | "iconClassName"
  | "iconTileClassName"
  | "selectedCheckClassName"
>;

const TONE_CLASS_NAMES: Readonly<Record<LogFormOptionTone, ToneClassNames>> = {
  neutral: {
    unselectedClassName: "border-border bg-card text-foreground",
    selectedClassName: "border-primary/50 bg-accent text-primary",
    iconClassName: "text-muted-foreground",
    iconTileClassName: "bg-muted text-muted-foreground",
    selectedCheckClassName: "bg-primary text-primary-foreground",
  },
  lavender: {
    unselectedClassName: "border-border bg-card text-foreground",
    selectedClassName: "border-primary/50 bg-accent text-primary",
    iconClassName: "text-primary",
    iconTileClassName: "bg-accent text-primary",
    selectedCheckClassName: "bg-primary text-primary-foreground",
  },
  info: {
    unselectedClassName: "border-border bg-card text-foreground",
    selectedClassName: "border-info/50 bg-info-muted/60 text-info-ink",
    iconClassName: "text-info",
    iconTileClassName: "bg-info-muted text-info",
    selectedCheckClassName: "bg-info text-primary-foreground",
  },
  positive: {
    unselectedClassName: "border-border bg-card text-foreground",
    selectedClassName: "border-success/50 bg-success-muted/60 text-success-ink",
    iconClassName: "text-success",
    iconTileClassName: "bg-success-muted text-success",
    selectedCheckClassName: "bg-success text-primary-foreground",
  },
  warning: {
    unselectedClassName: "border-border bg-card text-foreground",
    selectedClassName: "border-warning/50 bg-warning-muted/60 text-warning-ink",
    iconClassName: "text-warning",
    iconTileClassName: "bg-warning-muted text-warning",
    selectedCheckClassName: "bg-warning text-primary-foreground",
  },
  negative: {
    unselectedClassName: "border-border bg-card text-foreground",
    selectedClassName:
      "border-destructive/50 bg-destructive/10 text-destructive-ink",
    iconClassName: "text-destructive",
    iconTileClassName: "bg-destructive/10 text-destructive",
    selectedCheckClassName: "bg-destructive text-destructive-foreground",
  },
};

const OPTION_DEFINITIONS = {
  "episode-categories": [
    option(
      "episode.category.involuntaryResponse",
      "Involuntary response",
      PersonStanding,
      "lavender",
      ["involuntary_response"],
    ),
    option("episode.category.mood", "Mood", Smile, "lavender"),
    option("episode.category.symptoms", "Symptoms", HeartPulse, "lavender"),
    option(
      "episode.category.thoughtPattern",
      "Thought pattern",
      Brain,
      "lavender",
      ["thought_pattern", "thought patterns"],
    ),
  ],
  "episode-characteristics": [
    option("episode.characteristic.avoidance", "Avoidance", CircleOff),
    option(
      "episode.characteristic.difficultyFocusing",
      "Difficulty focusing",
      Focus,
      "lavender",
      ["difficulty_focusing"],
    ),
    option(
      "episode.characteristic.loopingThoughts",
      "Looping thoughts",
      Repeat2,
      "lavender",
      ["looping_thoughts"],
    ),
    option(
      "episode.characteristic.racingThoughts",
      "Racing thoughts",
      Gauge,
      "lavender",
      ["racing_thoughts"],
    ),
    option(
      "episode.characteristic.physicalTension",
      "Physical tension",
      PersonStanding,
      "neutral",
      ["physical_tension"],
    ),
    option("episode.characteristic.restless", "Restless", Waves),
  ],
  "episode-context-tags": [
    option("episode.context.poorSleep", "Poor sleep", Moon, "lavender", [
      "poor_sleep",
    ]),
    option(
      "episode.context.socialOverload",
      "Social overload",
      UsersRound,
      "neutral",
      ["social_overload"],
    ),
    option(
      "episode.context.stressfulConversation",
      "Stressful conversation",
      MessageCircle,
      "lavender",
      ["stressful_conversation"],
    ),
    option(
      "episode.context.workPressure",
      "Work pressure",
      BriefcaseBusiness,
      "neutral",
      ["work_pressure"],
    ),
  ],
  "social-energy-before-state": [
    option(
      "socialEnergy.before.open",
      "Open to socializing",
      UserRoundCheck,
      "info",
      ["open"],
    ),
    option("socialEnergy.before.neutral", "Neutral", UserRound, "neutral"),
    option(
      "socialEnergy.before.reserved",
      "Reserved",
      UserRoundMinus,
      "lavender",
    ),
    option(
      "socialEnergy.before.depleted",
      "Already depleted",
      BatteryLow,
      "warning",
      ["depleted"],
    ),
  ],
  "social-energy-battery-effect": [
    option("socialEnergy.battery.reduced", "Reduced", BatteryLow, "negative"),
    option(
      "socialEnergy.battery.unchanged",
      "Unchanged",
      BatteryMedium,
      "neutral",
    ),
    option(
      "socialEnergy.battery.increased",
      "Increased",
      BatteryCharging,
      "positive",
    ),
  ],
  "social-energy-mood-shift": [
    option("socialEnergy.mood.worse", "Worse", Frown, "negative"),
    option("socialEnergy.mood.unchanged", "Unchanged", Meh, "neutral"),
    option("socialEnergy.mood.improved", "Improved", SmilePlus, "positive"),
  ],
  "social-energy-behavioral-effect": [
    option("socialEnergy.behavior.quieter", "Quieter", UserRound, "info"),
    option("socialEnergy.behavior.unchanged", "Unchanged", Minus, "neutral"),
    option(
      "socialEnergy.behavior.moreSocial",
      "More social",
      UsersRound,
      "positive",
      ["more_social"],
    ),
    option("socialEnergy.behavior.withdrew", "Withdrew", UserRoundX, "warning"),
  ],
  "social-energy-recovery-timing": [
    option("socialEnergy.recovery.notYet", "Not yet", ClockAlert, "neutral", [
      "not_yet",
    ]),
    option("socialEnergy.recovery.rightAway", "Right away", Zap, "positive", [
      "right_away",
    ]),
    option(
      "socialEnergy.recovery.laterDay",
      "Later that evening",
      Clock3,
      "lavender",
      ["later_day", "later that day"],
    ),
    option("socialEnergy.recovery.nextDay", "Next day", CalendarClock, "info", [
      "next_day",
    ]),
  ],
  "social-energy-interaction-context": [
    option(
      "socialEnergy.interaction.oneOnOne",
      "One-on-one",
      UserRound,
      "lavender",
      ["one_on_one"],
    ),
    option(
      "socialEnergy.interaction.smallGroup",
      "Small group",
      UsersRound,
      "lavender",
      ["small_group"],
    ),
    option(
      "socialEnergy.interaction.largeGroup",
      "Large group",
      UsersRound,
      "lavender",
      ["large_group"],
    ),
  ],
  "social-energy-familiarity": [
    option(
      "socialEnergy.familiarity.veryFamiliar",
      "Very familiar",
      Heart,
      "lavender",
      ["very_familiar"],
    ),
    option(
      "socialEnergy.familiarity.familiar",
      "Familiar",
      HeartHandshake,
      "lavender",
    ),
    option("socialEnergy.familiarity.mixed", "Mixed", UsersRound, "lavender"),
    option(
      "socialEnergy.familiarity.unfamiliar",
      "Unfamiliar",
      CircleHelp,
      "lavender",
    ),
  ],
  "social-energy-setting": [
    option(
      "socialEnergy.setting.structured",
      "Structured",
      Building2,
      "lavender",
    ),
    option(
      "socialEnergy.setting.unstructured",
      "Unstructured",
      Armchair,
      "lavender",
    ),
  ],
  "social-energy-factors": [
    option(
      "socialEnergy.factor.comfortableSetting",
      "Comfortable setting",
      Armchair,
      "lavender",
      ["comfortable_setting"],
    ),
    option("socialEnergy.factor.conflict", "Conflict", Swords, "lavender"),
    option(
      "socialEnergy.factor.largeGroup",
      "Large group",
      UsersRound,
      "lavender",
      ["large_group"],
    ),
    option(
      "socialEnergy.factor.longConversation",
      "Long conversation",
      MessagesSquare,
      "lavender",
      ["long_conversation"],
    ),
    option("socialEnergy.factor.poorSleep", "Poor sleep", Moon, "lavender", [
      "poor_sleep",
    ]),
    option(
      "socialEnergy.factor.unfamiliarPeople",
      "Unfamiliar people",
      CircleHelp,
      "lavender",
      ["unfamiliar_people"],
    ),
  ],
  "emotion-states": [
    option(
      "sentiment.emotion.angry",
      "Angry",
      Angry,
      "negative",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.anxious",
      "Anxious",
      Annoyed,
      "warning",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.ashamed",
      "Ashamed",
      Frown,
      "lavender",
      [],
      "negative",
    ),
    option("sentiment.emotion.calm", "Calm", Flower2, "info", [], "positive"),
    option(
      "sentiment.emotion.confused",
      "Confused",
      Orbit,
      "lavender",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.disconnected",
      "Disconnected",
      Unlink2,
      "neutral",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.hopeful",
      "Hopeful",
      Sprout,
      "positive",
      [],
      "positive",
    ),
    option(
      "sentiment.emotion.hurt",
      "Hurt",
      HeartCrack,
      "warning",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.negative",
      "Negative",
      CloudRain,
      "neutral",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.neutral",
      "Neutral",
      Meh,
      "neutral",
      [],
      "neutral",
    ),
    option(
      "sentiment.emotion.positive",
      "Positive",
      Smile,
      "positive",
      [],
      "positive",
    ),
    option(
      "sentiment.emotion.unsteady",
      "Unsteady",
      Waves,
      "warning",
      [],
      "negative",
    ),
    option(
      "sentiment.emotion.veryNegative",
      "Very negative",
      CircleAlert,
      "negative",
      ["very_negative"],
      "negative",
    ),
  ],
  "interaction-dynamics": [
    option(
      "sentiment.dynamic.feltDismissed",
      "Felt dismissed",
      CircleAlert,
      "lavender",
      ["felt_dismissed"],
    ),
    option("sentiment.dynamic.guarded", "Guarded", ShieldAlert, "lavender"),
    option(
      "sentiment.dynamic.misunderstood",
      "Misunderstood",
      CircleHelp,
      "lavender",
    ),
    option(
      "sentiment.dynamic.mutualEngagement",
      "Mutual engagement",
      Handshake,
      "lavender",
      ["mutual_engagement"],
    ),
    option(
      "sentiment.dynamic.supported",
      "Supported",
      HeartHandshake,
      "lavender",
    ),
    option(
      "sentiment.dynamic.unevenEngagement",
      "Uneven engagement",
      Activity,
      "lavender",
      ["uneven_engagement"],
    ),
  ],
  "sentiment-connection": [
    option("sentiment.connection.close", "Close", Heart, "positive"),
    option(
      "sentiment.connection.neutral",
      "Neutral",
      HeartHandshake,
      "neutral",
    ),
    option(
      "sentiment.connection.distant",
      "More distant",
      HeartCrack,
      "negative",
      ["distant"],
    ),
  ],
  "sentiment-initiated-by": [
    option("sentiment.initiatedBy.me", "Me", UserRound, "lavender"),
    option("sentiment.initiatedBy.them", "Them", UsersRound, "lavender"),
    option("sentiment.initiatedBy.mutual", "Mutual", Handshake, "lavender"),
  ],
  "sentiment-overall-exchange": [
    option(
      "sentiment.exchange.positive",
      "Positive",
      HeartHandshake,
      "positive",
    ),
    option("sentiment.exchange.neutral", "Neutral", HeartHandshake, "neutral"),
    option("sentiment.exchange.negative", "Negative", HeartMinus, "negative"),
  ],
} as const satisfies Readonly<
  Record<LogFormOptionGroup, readonly OptionDefinition[]>
>;

const OPTION_REGISTRIES = Object.fromEntries(
  Object.entries(OPTION_DEFINITIONS).map(([group, definitions]) => [
    group,
    createRegistry(definitions),
  ]),
) as Record<LogFormOptionGroup, ReadonlyMap<string, OptionDefinition>>;

export const SOCIAL_ENERGY_GROUP_SIZE_PRESENTATION = createPresentation(
  option(
    "socialEnergy.context.groupSize",
    "Group size",
    UsersRound,
    "lavender",
    ["group_size"],
  ),
);

export function normalizeLogFormOptionValue(
  value: string | null | undefined,
): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, " ");
}

export function getLogFormOptionPresentation(
  group: LogFormOptionGroup,
  value: string | null | undefined,
): LogFormOptionPresentation {
  const normalizedValue = normalizeLogFormOptionValue(value);
  const definition = OPTION_REGISTRIES[group].get(normalizedValue);

  if (definition) return createPresentation(definition);

  return createPresentation(
    option(
      `${group}.custom`,
      value?.trim() || "Custom value",
      CircleDotDashed,
      "neutral",
    ),
    "fallback",
  );
}

export function getEpisodeCategoryPresentation(
  value: string | null | undefined,
): LogFormOptionPresentation {
  return getLogFormOptionPresentation("episode-categories", value);
}

export function getEpisodeCharacteristicPresentation(
  value: string | null | undefined,
): LogFormOptionPresentation {
  return getLogFormOptionPresentation("episode-characteristics", value);
}

export function getEpisodeContextPresentation(
  value: string | null | undefined,
): LogFormOptionPresentation {
  return getLogFormOptionPresentation("episode-context-tags", value);
}

export function getSocialEnergyFactorPresentation(
  value: string | null | undefined,
): LogFormOptionPresentation {
  return getLogFormOptionPresentation("social-energy-factors", value);
}

export function getSentimentEmotionPresentation(
  value: string | null | undefined,
): LogFormOptionPresentation {
  return getLogFormOptionPresentation("emotion-states", value);
}

export function getSentimentConnectionPresentation(
  value: string | null | undefined,
): LogFormOptionPresentation {
  return getLogFormOptionPresentation("sentiment-connection", value);
}

export type SentimentShiftKind =
  | "positive"
  | "negative"
  | "neutral"
  | "incomplete";

export type SentimentShiftPresentation = Readonly<{
  kind: SentimentShiftKind;
  label:
    | "Positive shift"
    | "Negative shift"
    | "No clear shift"
    | "Before → After";
  accessibleLabel: string;
  icon: LucideIcon;
  tone: LogFormOptionTone;
  iconClassName: string;
  indicatorClassName: string;
  labelClassName: string;
  makesClaim: boolean;
}>;

const SENTIMENT_SHIFT_PRESENTATIONS: Readonly<
  Record<SentimentShiftKind, SentimentShiftPresentation>
> = {
  positive: {
    kind: "positive",
    label: "Positive shift",
    accessibleLabel: "Positive emotional shift from before to after",
    icon: ArrowUpRight,
    tone: "positive",
    iconClassName: "text-success",
    indicatorClassName: "bg-success-muted text-success",
    labelClassName: "text-success",
    makesClaim: true,
  },
  negative: {
    kind: "negative",
    label: "Negative shift",
    accessibleLabel: "Negative emotional shift from before to after",
    icon: ArrowDownRight,
    tone: "negative",
    iconClassName: "text-destructive",
    indicatorClassName: "bg-destructive/10 text-destructive",
    labelClassName: "text-destructive",
    makesClaim: true,
  },
  neutral: {
    kind: "neutral",
    label: "No clear shift",
    accessibleLabel: "No clear emotional shift from before to after",
    icon: ArrowRight,
    tone: "neutral",
    iconClassName: "text-muted-foreground",
    indicatorClassName: "bg-muted text-muted-foreground",
    labelClassName: "text-muted-foreground",
    makesClaim: true,
  },
  incomplete: {
    kind: "incomplete",
    label: "Before → After",
    accessibleLabel: "Before to after emotional state",
    icon: ArrowRight,
    tone: "neutral",
    iconClassName: "text-muted-foreground",
    indicatorClassName: "bg-muted text-muted-foreground",
    labelClassName: "text-muted-foreground",
    makesClaim: false,
  },
};

/**
 * Derives display-only comparison language from explicit semantic bands.
 * Values are emotional-state names/slugs, never lookup IDs. No score is
 * calculated, returned, persisted, or exposed to analytics.
 */
export function getSentimentShiftPresentation(
  beforeValue: string | null | undefined,
  afterValue: string | null | undefined,
): SentimentShiftPresentation {
  const before = getSentimentEmotionPresentation(beforeValue);
  const after = getSentimentEmotionPresentation(afterValue);

  if (!before.comparisonBand || !after.comparisonBand) {
    return SENTIMENT_SHIFT_PRESENTATIONS.incomplete;
  }

  if (before.comparisonBand === after.comparisonBand) {
    return SENTIMENT_SHIFT_PRESENTATIONS.neutral;
  }

  const transition = `${before.comparisonBand}:${after.comparisonBand}`;
  if (
    transition === "negative:neutral" ||
    transition === "negative:positive" ||
    transition === "neutral:positive"
  ) {
    return SENTIMENT_SHIFT_PRESENTATIONS.positive;
  }

  return SENTIMENT_SHIFT_PRESENTATIONS.negative;
}

function option(
  key: string,
  label: string,
  icon: LucideIcon,
  tone: LogFormOptionTone = "neutral",
  aliases: readonly string[] = [],
  comparisonBand?: SentimentComparisonBand,
): OptionDefinition {
  return { key, label, icon, tone, aliases, comparisonBand };
}

function createRegistry(
  definitions: readonly OptionDefinition[],
): ReadonlyMap<string, OptionDefinition> {
  const registry = new Map<string, OptionDefinition>();

  for (const definition of definitions) {
    for (const value of [definition.label, ...(definition.aliases ?? [])]) {
      registry.set(normalizeLogFormOptionValue(value), definition);
    }
  }

  return registry;
}

function createPresentation(
  definition: OptionDefinition,
  source: LogFormOptionPresentation["source"] = "curated",
): LogFormOptionPresentation {
  return {
    key: definition.key,
    label: definition.label,
    icon: definition.icon,
    tone: definition.tone,
    source,
    comparisonBand: definition.comparisonBand,
    ...TONE_CLASS_NAMES[definition.tone],
  };
}
