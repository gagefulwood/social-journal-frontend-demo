import { Heart } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { Fact, Observation } from "@/types/contacts";
import { FactsPreviewCard } from "./FactsPreviewCard";
import { RecentObservationsPreviewCard } from "./RecentObservationsPreviewCard";

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
    <SurfaceCard asChild className="flex flex-col p-4">
      <aside>
        <SectionHeader
          title="Context Clues"
          description="A quick look at key things you've saved."
          icon={
            <IconBadge tone="violet" size="lg">
              <Heart className="size-5" />
            </IconBadge>
          }
        />
        <div className="mt-4 space-y-3">
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
    </SurfaceCard>
  );
}
