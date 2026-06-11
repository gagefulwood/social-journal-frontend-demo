import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
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
  FiCoffee: Coffee,
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
  emerald: {
    badge: "bg-emerald-100",
    border: "border-emerald-100",
    count: "bg-emerald-100",
    dot: "bg-emerald-500",
    header: "border-emerald-100 bg-emerald-50/50",
    text: "text-emerald-700",
  },
  orange: {
    badge: "bg-orange-100",
    border: "border-orange-100",
    count: "bg-orange-100",
    dot: "bg-orange-500",
    header: "border-orange-100 bg-orange-50/50",
    text: "text-orange-700",
  },
  sky: {
    badge: "bg-sky-100",
    border: "border-sky-100",
    count: "bg-sky-100",
    dot: "bg-sky-500",
    header: "border-sky-100 bg-sky-50/50",
    text: "text-sky-700",
  },
  slate: {
    badge: "bg-slate-100",
    border: "border-slate-200",
    count: "bg-slate-100",
    dot: "bg-slate-400",
    header: "border-slate-200 bg-slate-50/70",
    text: "text-slate-700",
  },
  violet: {
    badge: "bg-violet-100",
    border: "border-violet-100",
    count: "bg-violet-100",
    dot: "bg-violet-500",
    header: "border-violet-100 bg-violet-50/50",
    text: "text-violet-700",
  },
} satisfies Record<string, Omit<FactCategoryPresentation, "icon">>;

const DEFAULT_FACT_CATEGORY_PRESENTATION: FactCategoryPresentation = {
  ...FACT_CATEGORY_TONES.slate,
  icon: BookOpen,
};

const CATEGORY_NAME_PRESENTATION_MAP: Record<string, FactCategoryPresentation> = {
  availability: {
    ...FACT_CATEGORY_TONES.sky,
    icon: Clock,
  },
  communication: {
    ...FACT_CATEGORY_TONES.emerald,
    icon: MessageCircle,
  },
  education: {
    ...FACT_CATEGORY_TONES.emerald,
    icon: GraduationCap,
  },
  family: {
    ...FACT_CATEGORY_TONES.violet,
    icon: HeartHandshake,
  },
  health: {
    ...FACT_CATEGORY_TONES.sky,
    icon: HeartPulse,
  },
  interests: {
    ...FACT_CATEGORY_TONES.orange,
    icon: Palette,
  },
  location: {
    ...FACT_CATEGORY_TONES.orange,
    icon: MapPin,
  },
  logistics: {
    ...FACT_CATEGORY_TONES.orange,
    icon: MapPin,
  },
  logisticslocation: {
    ...FACT_CATEGORY_TONES.orange,
    icon: MapPin,
  },
  personal: {
    ...FACT_CATEGORY_TONES.violet,
    icon: UserRound,
  },
  preferences: {
    ...FACT_CATEGORY_TONES.violet,
    icon: Heart,
  },
  values: {
    ...FACT_CATEGORY_TONES.orange,
    icon: Compass,
  },
  valuesbeliefs: {
    ...FACT_CATEGORY_TONES.orange,
    icon: ShieldCheck,
  },
  work: {
    ...FACT_CATEGORY_TONES.sky,
    icon: BriefcaseBusiness,
  },
  workeducation: {
    ...FACT_CATEGORY_TONES.sky,
    icon: GraduationCap,
  },
};

export function getFactCategoryPresentation(
  category: FactCategory | undefined,
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
    icon: category.icon_reference
      ? (FACT_ICON_MAP[category.icon_reference] ?? BookOpen)
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
