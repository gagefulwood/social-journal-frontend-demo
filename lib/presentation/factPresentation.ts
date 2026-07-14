import { getPresentationTokens } from "@/lib/presentation/semanticTokens";
import type {
  FactCategoryKey,
  IconIdentifier,
  SemanticPresentation,
} from "@/lib/presentation/types";

export type FactCategoryPresentationInput = {
  name?: string | null;
  icon?: string | null;
  icon_reference?: string | null;
};

export type FactCategoryPresentation = SemanticPresentation<FactCategoryKey>;

type FactCategoryDefinition = {
  key: FactCategoryKey;
  label: string;
  icon: IconIdentifier;
};

const categoryDefinitions = {
  preferences: {
    key: "factCategory.preferences",
    label: "Preferences",
    icon: "heart",
  },
  "routines and goals": {
    key: "factCategory.routinesGoals",
    label: "Routines & goals",
    icon: "compass",
  },
  "work and school": {
    key: "factCategory.workSchool",
    label: "Work & school",
    icon: "briefcase-business",
  },
  "important dates": {
    key: "factCategory.importantDates",
    label: "Important dates",
    icon: "calendar-days",
  },
  "family and relationships": {
    key: "factCategory.familyRelationships",
    label: "Family & relationships",
    icon: "heart-handshake",
  },
  "practical details": {
    key: "factCategory.practicalDetails",
    label: "Practical details",
    icon: "clipboard-list",
  },
} satisfies Record<string, FactCategoryDefinition>;

const iconReferenceMap: Record<string, IconIdentifier> = {
  FiAlertCircle: "alert-circle",
  FiBookOpen: "book-open",
  FiBriefcase: "briefcase-business",
  FiCalendar: "calendar-days",
  FiCalendarDays: "calendar-days",
  FiClipboard: "clipboard-list",
  FiCoffee: "coffee",
  FiCompass: "compass",
  FiFileText: "clipboard-list",
  FiGraduationCap: "graduation-cap",
  FiHeart: "heart",
  FiHome: "home",
  FiLock: "shield",
  FiMessageCircle: "message-circle",
  FiShield: "shield",
  FiStar: "star",
  FiUser: "user",
  FiUsers: "users",
};

const categoryVariants = {
  iconTile: "factCategoryIconTile.category",
  header: "factCategoryHeader.category",
  count: "factCategoryCount.category",
} as const;

export function getFactCategoryPresentation(
  category: FactCategoryPresentationInput | null | undefined,
): FactCategoryPresentation {
  if (!category) {
    return createPresentation(
      {
        key: "factCategory.uncategorized",
        label: "Things to remember",
        icon: "book-open",
      },
      "fallback",
    );
  }

  const normalizedName = normalizeCategoryName(category.name);
  const definition = normalizedName
    ? categoryDefinitions[normalizedName as keyof typeof categoryDefinitions]
    : undefined;

  if (definition) {
    return createPresentation(definition, "lookup");
  }

  const iconReference = category.icon_reference || category.icon || "";

  return createPresentation(
    {
      key: "factCategory.custom",
      label: category.name?.trim() || "Custom category",
      icon: iconReferenceMap[iconReference] ?? "book-open",
    },
    "lookup",
  );
}

function createPresentation(
  definition: FactCategoryDefinition,
  source: FactCategoryPresentation["source"],
): FactCategoryPresentation {
  return {
    ...definition,
    tokens: getPresentationTokens(definition.key),
    variants: categoryVariants,
    source,
  };
}

function normalizeCategoryName(value: string | null | undefined) {
  const normalized = value
    ?.trim()
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ");

  return normalized || null;
}
