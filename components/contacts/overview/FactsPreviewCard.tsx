import type { KeyboardEvent } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
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
