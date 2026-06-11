"use client";

import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  Clock,
  Compass,
  ClipboardList,
  Coffee,
  Edit,
  FileText,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  Palette,
  Plus,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  User,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FactForm } from "@/components/contacts/FactForm";
import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { CreateFactRequest, Fact, UpdateFactRequest } from "@/types/contacts";
import type { FactCategory } from "@/types/lookups";

type FactsPanelProps = {
  facts?: Fact[];
  contactFirstName?: string;
  onCreate: (data: CreateFactRequest) => Promise<void>;
  onUpdate: (factId: ApiId, data: UpdateFactRequest) => Promise<void>;
  onDelete: (factId: ApiId) => Promise<void>;
};

export function FactsPanel({
  facts = [],
  contactFirstName = "this contact",
  onCreate,
  onUpdate,
  onDelete,
}: FactsPanelProps) {
  const safeFacts = Array.isArray(facts) ? facts : [];
  const [isCreating, setIsCreating] = useState(false);
  const [editingFact, setEditingFact] = useState<Fact | null>(null);
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);
  const groupedFacts = groupFactsByCategory(safeFacts, categories);

  return (
    <section
      id="contact-facts-section"
      className="rounded-xl border border-border/80 bg-card p-5 shadow-sm shadow-emerald-100/40"
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100">
            <ClipboardList className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Facts</h2>
            <p className="text-sm text-muted-foreground">
              Key details I want to remember about {contactFirstName}.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-violet-300 text-violet-700 hover:bg-violet-50"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-4" />
          Add fact
        </Button>
      </div>

      {isCreating && (
        <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <FactForm
            onSubmit={async (data) => {
              await onCreate(data);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {safeFacts.length === 0 && (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-6 text-center sm:col-span-2">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-background text-emerald-700 shadow-sm">
              <FileText className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">No facts saved yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Add preferences, family details, or context you want to remember
              next time.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 border-violet-300 text-violet-700 hover:bg-violet-50"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="size-4" />
              Add fact
            </Button>
          </div>
        )}
        {groupedFacts.map((group, index) => {
          const tone = getFactTone(index);
          const Icon = getFactIcon(group.category);

          return (
            <div
              key={group.key}
              className={cn(
                "overflow-hidden rounded-xl border bg-background shadow-sm transition-colors hover:shadow-md",
                tone.border,
              )}
            >
              <div className={cn("flex items-center justify-between gap-3 border-b p-4", tone.header)}>
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      tone.badge,
                      tone.text,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="truncate text-sm font-semibold">
                    {group.name}
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    tone.count,
                    tone.text,
                  )}
                >
                  {group.facts.length}
                </span>
              </div>

              <div className="space-y-3 p-4">
                {group.facts.map((fact) =>
                  editingFact?.id === fact.id ? (
                    <div
                      key={fact.id}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <FactForm
                        fact={fact}
                        onSubmit={async (data) => {
                          await onUpdate(fact.id, data);
                          setEditingFact(null);
                        }}
                        onCancel={() => setEditingFact(null)}
                      />
                    </div>
                  ) : (
                    <div key={fact.id} className="group/fact flex gap-2">
                      <span
                        className={cn(
                          "mt-2 size-1.5 shrink-0 rounded-full",
                          tone.dot,
                        )}
                      />
                      <p className="min-w-0 flex-1 break-words text-sm leading-6 text-foreground">
                        {fact.detail_value}
                      </p>
                      <div className="flex shrink-0 gap-0.5 opacity-60 transition-opacity group-hover/fact:opacity-100">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setEditingFact(fact)}
                          aria-label="Edit fact"
                          className="text-muted-foreground hover:text-violet-700"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => void onDelete(fact.id)}
                          aria-label="Delete fact"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {safeFacts.length > 0 && (
        <Button
          variant="outline"
          className="mt-5 h-10 w-full border-violet-200 text-violet-700 hover:bg-violet-50"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-4" />
          Add another fact
        </Button>
      )}
    </section>
  );
}

type FactGroup = {
  key: string;
  category: FactCategory | undefined;
  name: string;
  facts: Fact[];
};

type FactTone = {
  badge: string;
  border: string;
  count: string;
  dot: string;
  header: string;
  text: string;
};

const FACT_TONES: FactTone[] = [
  {
    badge: "bg-emerald-100",
    border: "border-emerald-100",
    count: "bg-emerald-100",
    dot: "bg-emerald-500",
    header: "border-emerald-100 bg-emerald-50/50",
    text: "text-emerald-700",
  },
  {
    badge: "bg-violet-100",
    border: "border-violet-100",
    count: "bg-violet-100",
    dot: "bg-violet-500",
    header: "border-violet-100 bg-violet-50/50",
    text: "text-violet-700",
  },
  {
    badge: "bg-sky-100",
    border: "border-sky-100",
    count: "bg-sky-100",
    dot: "bg-sky-500",
    header: "border-sky-100 bg-sky-50/50",
    text: "text-sky-700",
  },
  {
    badge: "bg-orange-100",
    border: "border-orange-100",
    count: "bg-orange-100",
    dot: "bg-orange-500",
    header: "border-orange-100 bg-orange-50/50",
    text: "text-orange-700",
  },
];
const DEFAULT_FACT_TONE: FactTone = FACT_TONES[0] ?? {
  badge: "bg-emerald-100",
  border: "border-emerald-100",
  count: "bg-emerald-100",
  dot: "bg-emerald-500",
  header: "border-emerald-100 bg-emerald-50/50",
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

const CATEGORY_NAME_ICON_MAP: Record<string, LucideIcon> = {
  availability: Clock,
  communication: MessageCircle,
  education: GraduationCap,
  family: HeartHandshake,
  health: HeartPulse,
  interests: Palette,
  location: MapPin,
  logistics: MapPin,
  logisticslocation: MapPin,
  personal: UserRound,
  preferences: Heart,
  values: Compass,
  valuesbeliefs: ShieldCheck,
  work: BriefcaseBusiness,
  workeducation: GraduationCap,
};

function groupFactsByCategory(
  facts: Fact[],
  categories: FactCategory[],
): FactGroup[] {
  const groups = new Map<string, FactGroup>();

  for (const fact of facts) {
    const category = categories.find((item) => idsMatch(item.id, fact.category));
    const key = category ? `category-${String(category.id)}` : "uncategorized";
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.facts.push(fact);
    } else {
      groups.set(key, {
        key,
        category,
        name: category?.name ?? "Uncategorized",
        facts: [fact],
      });
    }
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function getFactIcon(category: FactCategory | undefined): LucideIcon {
  if (!category) {
    return BookOpen;
  }

  const normalizedName = normalizeCategoryName(category.name);
  const nameIcon = CATEGORY_NAME_ICON_MAP[normalizedName];

  if (nameIcon) {
    return nameIcon;
  }

  if (!category.icon_reference) {
    return BookOpen;
  }

  return FACT_ICON_MAP[category.icon_reference] ?? BookOpen;
}

function getFactTone(index: number): FactTone {
  return FACT_TONES[index % FACT_TONES.length] ?? DEFAULT_FACT_TONE;
}

function normalizeCategoryName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}
