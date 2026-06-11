import type { KeyboardEvent } from "react";
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  Coffee,
  GraduationCap,
  Heart,
  Home,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Fact } from "@/types/contacts";
import type { FactCategory } from "@/types/lookups";

type FactsPreviewCardProps = {
  facts: Fact[];
  onViewAll: () => void;
};

export function FactsPreviewCard({ facts, onViewAll }: FactsPreviewCardProps) {
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);
  const previewFacts = selectPreviewFacts(facts);
  const isEmpty = previewFacts.length === 0;

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onViewAll();
    }
  }

  return (
    <section
      role="button"
      tabIndex={0}
      aria-label="View all facts"
      className="w-full rounded-xl border border-border/70 bg-background/80 p-4 text-left shadow-sm shadow-emerald-100/50 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 motion-reduce:hover:translate-y-0"
      onClick={onViewAll}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100">
            <ClipboardList className="size-5" />
          </span>
          <h3 className="font-semibold">Facts</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          {facts.length} saved
        </span>
      </div>

      {previewFacts.length > 0 ? (
        <ul className="space-y-3.5">
          {previewFacts.map((fact, index) => {
            const category = categories.find((item) =>
              idsMatch(item.id, fact.category),
            );
            const tone = getFactTone(index);
            const Icon = getFactIcon(category);

            return (
              <li key={fact.id} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                    tone.badge,
                    tone.text,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <p className="line-clamp-2 leading-6 text-foreground">
                  {fact.detail_value}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <ContactOverviewEmptyState
          icon={<ClipboardList className="size-4" />}
          title="No facts yet"
          copy="Saved facts will appear here once you add context for this contact."
        />
      )}

      <span className="mt-4 flex h-9 w-full items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold text-violet-700">
        View all facts
        {isEmpty ? (
          <ChevronRight className="size-4" />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {facts.length}
          </span>
        )}
      </span>
    </section>
  );
}

type FactTone = {
  badge: string;
  text: string;
};

const FACT_TONES: FactTone[] = [
  { badge: "bg-emerald-100", text: "text-emerald-700" },
  { badge: "bg-violet-100", text: "text-violet-700" },
  { badge: "bg-sky-100", text: "text-sky-700" },
  { badge: "bg-orange-100", text: "text-orange-700" },
];
const DEFAULT_FACT_TONE: FactTone = FACT_TONES[0] ?? {
  badge: "bg-emerald-100",
  text: "text-emerald-700",
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

function selectPreviewFacts(facts: Fact[]): Fact[] {
  const seen = new Set<string>();
  const previewFacts: Fact[] = [];

  for (const fact of facts) {
    const text = fact.detail_value.trim();

    if (!text || seen.has(text)) {
      continue;
    }

    seen.add(text);
    previewFacts.push(fact);

    if (previewFacts.length === 4) {
      break;
    }
  }

  return previewFacts;
}

function getFactIcon(category: FactCategory | undefined): LucideIcon {
  if (!category?.icon_reference) {
    return Sparkles;
  }

  return FACT_ICON_MAP[category.icon_reference] ?? Sparkles;
}

function getFactTone(index: number): FactTone {
  return FACT_TONES[index % FACT_TONES.length] ?? DEFAULT_FACT_TONE;
}
