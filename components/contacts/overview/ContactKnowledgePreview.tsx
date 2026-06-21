import { Heart } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import type { Fact, Observation } from "@/types/contacts";
import { FactsPreviewCard } from "./FactsPreviewCard";
import { RecentObservationsPreviewCard } from "./RecentObservationsPreviewCard";
import type { ContactOverviewModel } from "./contact-overview-utils";

type ContactKnowledgePreviewProps = {
  facts: Fact[];
  model: ContactOverviewModel;
  observations: Observation[];
  onViewFactsAndObservations: () => void;
};

export function ContactKnowledgePreview({
  facts,
  model,
  observations,
  onViewFactsAndObservations,
}: ContactKnowledgePreviewProps) {
  const rememberedFactIds = model.rememberNextTimeItems
    .filter((item) => item.source === "fact")
    .map((item) => item.sourceId);

  return (
    <SurfaceCard asChild className="flex h-full flex-col p-4">
      <aside>
        <SectionHeader
          title="Context Clues"
          icon={
            <IconBadge tone="violet" size="lg">
              <Heart className="size-5" />
            </IconBadge>
          }
        />
        <div className="mt-4 divide-y divide-border/70 border-t border-border/70 pt-4">
          <div className="pb-4">
            <FactsPreviewCard
              excludedFactIds={rememberedFactIds}
              facts={facts}
              onViewAll={onViewFactsAndObservations}
            />
          </div>
          <div className="pt-4">
            <RecentObservationsPreviewCard
              observations={observations}
              onViewAll={onViewFactsAndObservations}
            />
          </div>
        </div>
      </aside>
    </SurfaceCard>
  );
}
