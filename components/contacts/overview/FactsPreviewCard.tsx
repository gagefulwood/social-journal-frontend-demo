import type { KeyboardEvent } from "react";
import { ChevronRight, ClipboardList } from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import type { Fact } from "@/types/contacts";

type FactsPreviewCardProps = {
  facts: Fact[];
  onViewAll: () => void;
};

export function FactsPreviewCard({ facts, onViewAll }: FactsPreviewCardProps) {
  const previewFacts = facts.slice(0, 4);
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
      className="w-full rounded-lg border border-border/70 bg-background/70 p-4 text-left outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 motion-reduce:hover:translate-y-0"
      onClick={onViewAll}
      onKeyDown={handleKeyDown}
    >
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

      <span className="mt-4 flex h-8 w-full items-center justify-between rounded-md border border-border bg-background px-2.5 text-sm font-medium text-violet-700">
        {isEmpty ? "Add a fact" : "View all facts"}
        {isEmpty ? (
          <ChevronRight className="size-4" />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {facts.length}
          </span>
        )}
      </span>
    </section>
  );
}
