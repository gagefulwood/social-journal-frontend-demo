import { ClipboardList } from "lucide-react";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import { getFactCategoryPresentation } from "@/components/contacts/fact-category-presentation";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { Fact } from "@/types/contacts";

type FactsPreviewCardProps = {
  excludedFactIds?: ApiId[];
  facts: Fact[];
  onViewAll: () => void;
};

export function FactsPreviewCard({
  excludedFactIds = [],
  facts,
  onViewAll,
}: FactsPreviewCardProps) {
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);
  const previewFacts = selectPreviewFacts(facts, excludedFactIds);
  const isEmpty = previewFacts.length === 0;

  return (
    <section>
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
          title={facts.length > 0 ? "No additional facts here" : "No facts yet"}
          copy={
            facts.length > 0
              ? "The remaining facts are already shown in the rail."
              : "Saved facts will appear here once you add context for this contact."
          }
          action={
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-primary-strong outline-none transition-colors hover:bg-muted/20 focus-visible:ring-3 focus-visible:ring-ring/50"
              onClick={onViewAll}
            >
              {facts.length > 0 ? "View facts" : "Open Context"}
            </button>
          }
        />
      )}

      {!isEmpty && (
        <button
          type="button"
          className="mt-3 inline-flex h-8 items-center rounded-sm text-sm font-semibold text-primary-strong outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={onViewAll}
        >
          View all facts
        </button>
      )}
    </section>
  );
}

function selectPreviewFacts(facts: Fact[], excludedFactIds: ApiId[]): Fact[] {
  const excludedIds = new Set(excludedFactIds.map((id) => String(id)));
  const seen = new Set<string>();
  const previewFacts: Fact[] = [];

  for (const fact of facts) {
    const text = fact.detail_value.trim();

    if (!text || seen.has(text) || excludedIds.has(String(fact.id))) {
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
