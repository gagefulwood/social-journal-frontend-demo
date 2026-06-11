import { Heart } from "lucide-react";
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
    <aside className="flex h-full flex-col rounded-2xl border border-border/80 bg-card/95 p-5 shadow-sm shadow-violet-100/60">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-sm shadow-violet-100">
          <Heart className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold">Context Clues</h2>
          <p className="text-sm text-muted-foreground">
            A quick look at key things you&apos;ve saved.
          </p>
        </div>
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
