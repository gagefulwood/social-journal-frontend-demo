import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  ClipboardList,
  Coffee,
  Compass,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  Palette,
  Shield,
  ShieldCheck,
  Star,
  User,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FactCategory } from "@/types/lookups";

type FactCategoryLike = Pick<FactCategory, "name"> & {
  icon?: string | null;
  icon_reference?: string | null;
};

export type FactCategoryPresentation = {
  badge: string;
  border: string;
  count: string;
  dot: string;
  header: string;
  icon: LucideIcon;
  text: string;
};

const FACT_ICON_MAP: Record<string, LucideIcon> = {
  FiAlertCircle: AlertCircle,
  FiBookOpen: BookOpen,
  FiBriefcase: BriefcaseBusiness,
  FiCalendar: CalendarDays,
  FiCalendarDays: CalendarDays,
  FiClipboard: ClipboardList,
  FiCoffee: Coffee,
  FiCompass: Compass,
  FiFileText: ClipboardList,
  FiGraduationCap: GraduationCap,
  FiHeart: Heart,
  FiHome: Home,
  FiLock: Shield,
  FiMessageCircle: MessageCircle,
  FiShield: Shield,
  FiStar: Star,
  FiUser: User,
  FiUsers: Users,
};

const FACT_CATEGORY_TONES = {
  teal: {
    badge: "bg-marker-teal",
    border: "border-marker-teal",
    count: "bg-marker-teal",
    dot: "bg-marker-teal-foreground",
    header: "border-marker-teal bg-marker-teal/35",
    text: "text-marker-teal-foreground",
  },
  fuchsia: {
    badge: "bg-marker-fuchsia",
    border: "border-marker-fuchsia",
    count: "bg-marker-fuchsia",
    dot: "bg-marker-fuchsia-foreground",
    header: "border-marker-fuchsia bg-marker-fuchsia/35",
    text: "text-marker-fuchsia-foreground",
  },
  indigo: {
    badge: "bg-marker-indigo",
    border: "border-marker-indigo",
    count: "bg-marker-indigo",
    dot: "bg-marker-indigo-foreground",
    header: "border-marker-indigo bg-marker-indigo/35",
    text: "text-marker-indigo-foreground",
  },
  rose: {
    badge: "bg-marker-rose",
    border: "border-marker-rose",
    count: "bg-marker-rose",
    dot: "bg-marker-rose-foreground",
    header: "border-marker-rose bg-marker-rose/35",
    text: "text-marker-rose-foreground",
  },
  violet: {
    badge: "bg-marker-violet",
    border: "border-marker-violet",
    count: "bg-marker-violet",
    dot: "bg-marker-violet-foreground",
    header: "border-marker-violet bg-marker-violet/35",
    text: "text-marker-violet-foreground",
  },
} satisfies Record<string, Omit<FactCategoryPresentation, "icon">>;

const DEFAULT_FACT_CATEGORY_PRESENTATION: FactCategoryPresentation = {
  ...FACT_CATEGORY_TONES.teal,
  icon: BookOpen,
};

const CATEGORY_NAME_PRESENTATION_MAP: Record<string, FactCategoryPresentation> =
  {
    availability: {
      ...FACT_CATEGORY_TONES.indigo,
      icon: Clock,
    },
    communication: {
      ...FACT_CATEGORY_TONES.teal,
      icon: MessageCircle,
    },
    education: {
      ...FACT_CATEGORY_TONES.fuchsia,
      icon: GraduationCap,
    },
    family: {
      ...FACT_CATEGORY_TONES.rose,
      icon: HeartHandshake,
    },
    familyrelationships: {
      ...FACT_CATEGORY_TONES.rose,
      icon: HeartHandshake,
    },
    health: {
      ...FACT_CATEGORY_TONES.indigo,
      icon: HeartPulse,
    },
    interests: {
      ...FACT_CATEGORY_TONES.fuchsia,
      icon: Palette,
    },
    location: {
      ...FACT_CATEGORY_TONES.teal,
      icon: MapPin,
    },
    logistics: {
      ...FACT_CATEGORY_TONES.teal,
      icon: MapPin,
    },
    logisticslocation: {
      ...FACT_CATEGORY_TONES.teal,
      icon: MapPin,
    },
    personal: {
      ...FACT_CATEGORY_TONES.violet,
      icon: UserRound,
    },
    preferences: {
      ...FACT_CATEGORY_TONES.rose,
      icon: Heart,
    },
    practicaldetails: {
      ...FACT_CATEGORY_TONES.teal,
      icon: ClipboardList,
    },
    routinesgoals: {
      ...FACT_CATEGORY_TONES.fuchsia,
      icon: Compass,
    },
    values: {
      ...FACT_CATEGORY_TONES.fuchsia,
      icon: Compass,
    },
    valuesbeliefs: {
      ...FACT_CATEGORY_TONES.fuchsia,
      icon: ShieldCheck,
    },
    work: {
      ...FACT_CATEGORY_TONES.indigo,
      icon: BriefcaseBusiness,
    },
    workschool: {
      ...FACT_CATEGORY_TONES.teal,
      icon: BriefcaseBusiness,
    },
    importantdates: {
      ...FACT_CATEGORY_TONES.indigo,
      icon: CalendarDays,
    },
    workeducation: {
      ...FACT_CATEGORY_TONES.indigo,
      icon: GraduationCap,
    },
  };

export function getFactCategoryPresentation(
  category: FactCategoryLike | undefined,
): FactCategoryPresentation {
  if (!category) {
    return DEFAULT_FACT_CATEGORY_PRESENTATION;
  }

  const normalizedName = normalizeCategoryName(category.name);
  const namePresentation = CATEGORY_NAME_PRESENTATION_MAP[normalizedName];

  if (namePresentation) {
    return namePresentation;
  }

  return {
    ...DEFAULT_FACT_CATEGORY_PRESENTATION,
    icon:
      category.icon_reference || category.icon
        ? (FACT_ICON_MAP[category.icon_reference || category.icon || ""] ??
          BookOpen)
        : BookOpen,
  };
}

function normalizeCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}
