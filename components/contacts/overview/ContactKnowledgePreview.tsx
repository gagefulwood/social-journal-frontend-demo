import { FactsPreviewCard } from "./FactsPreviewCard";
import { RecentObservationsPreviewCard } from "./RecentObservationsPreviewCard";
import type { Fact, Observation } from "@/types/contacts";

type ContactKnowledgePreviewProps = {
  facts: Fact[];
  observations: Observation[];
  onViewFactsAndObservations: () => void;
};

export function ContactKnowledgePreview({
  facts,
  observations,
  onViewFactsAndObservations,
}: ContactKnowledgePreviewProps) {
  return (
    <aside className="flex h-full flex-col rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">What I know &amp; notice</h2>
        <p className="text-sm text-muted-foreground">
          A quick look at key things you&apos;ve saved.
        </p>
      </div>
      <div className="mt-5 space-y-4">
        <FactsPreviewCard
          facts={facts}
          onViewAll={onViewFactsAndObservations}
        />
        <RecentObservationsPreviewCard
          observations={observations}
          onViewAll={onViewFactsAndObservations}
        />
      </div>
    </aside>
  );
}
