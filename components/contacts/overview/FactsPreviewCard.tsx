import { ChevronRight, ClipboardList } from "lucide-react";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import { getFactCategoryPresentation } from "@/components/contacts/fact-category-presentation";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Fact } from "@/types/contacts";

type FactsPreviewCardProps = {
  facts: Fact[];
  onViewAll: () => void;
};

export function FactsPreviewCard({ facts, onViewAll }: FactsPreviewCardProps) {
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);
  const previewFacts = selectPreviewFacts(facts);
  const isEmpty = previewFacts.length === 0;

  return (
    <SurfaceCard asChild hoverable>
      <button
        type="button"
        aria-label="View all facts"
        className="block w-full appearance-none p-3.5 text-left font-[inherit] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0"
        onClick={onViewAll}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconBadge tone="violet" size="md">
              <ClipboardList className="size-5" />
            </IconBadge>
            <h3 className="font-semibold">Facts</h3>
          </div>
          <span className="rounded-full bg-marker-violet px-2.5 py-1 text-xs font-semibold text-marker-violet-foreground">
            {facts.length} saved
          </span>
        </div>

        {previewFacts.length > 0 ? (
          <ul className="space-y-2.5">
            {previewFacts.map((fact) => {
              const category = categories.find((item) =>
                idsMatch(item.id, fact.category),
              );
              const presentation = getFactCategoryPresentation(category);
              const Icon = presentation.icon;

              return (
                <li key={fact.id} className="flex items-start gap-3 text-sm">
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
                      presentation.badge,
                      presentation.text,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <p className="line-clamp-2 leading-5 text-foreground">
                    {fact.detail_value}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyActionBox
            icon={
              <IconBadge tone="neutral" size="sm" className="shadow-none">
                <ClipboardList className="size-4" />
              </IconBadge>
            }
            title="No facts yet"
            copy="Saved facts will appear here once you add context for this contact."
          />
        )}

        <span className="mt-3 flex h-8 w-full items-center justify-between border-t border-border/70 pt-2.5 text-sm font-semibold text-primary-strong">
          View all facts
          {isEmpty ? (
            <ChevronRight className="size-4" />
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {facts.length}
            </span>
          )}
        </span>
      </button>
    </SurfaceCard>
  );
}

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
