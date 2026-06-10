import { ChevronRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import type { Fact } from "@/types/contacts";

type FactsPreviewCardProps = {
  facts: Fact[];
  onViewAll: () => void;
};

export function FactsPreviewCard({ facts, onViewAll }: FactsPreviewCardProps) {
  const previewFacts = facts.slice(0, 4);
  const isEmpty = previewFacts.length === 0;

  return (
    <section className="rounded-lg border border-border/70 bg-background/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <ClipboardList className="size-4" />
          </span>
          <h3 className="font-semibold">Facts</h3>
        </div>
        {facts.length > previewFacts.length && (
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            {facts.length} saved
          </span>
        )}
      </div>

      {previewFacts.length > 0 ? (
        <ul className="space-y-3">
          {previewFacts.map((fact) => (
            <li key={fact.id} className="flex items-start gap-3 text-sm">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
              <p className="line-clamp-2 leading-6">{fact.detail_value}</p>
            </li>
          ))}
        </ul>
      ) : (
        <ContactOverviewEmptyState
          icon={<ClipboardList className="size-4" />}
          title="No facts yet"
          copy="Save preferences, family details, or useful context as you learn them."
        />
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full justify-between bg-background text-violet-700 hover:bg-violet-50"
        onClick={onViewAll}
      >
        {isEmpty ? "Add a fact" : "View all facts"}
        {isEmpty ? (
          <ChevronRight className="size-4" />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {facts.length}
          </span>
        )}
      </Button>
    </section>
  );
}
