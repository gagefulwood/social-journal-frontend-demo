import { HeartPulse } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { RelationshipStatChips } from "./RelationshipStatChips";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RelationshipOverviewCardProps = {
  model: ContactOverviewModel;
};

export function RelationshipOverviewCard({
  model,
}: RelationshipOverviewCardProps) {
  return (
    <SurfaceCard asChild className="p-4">
      <section>
        <SectionHeader
          title="Relationship Overview"
          description={
            <>
              <p>{model.relationshipSnapshot.headline}</p>
              {model.relationshipSnapshot.details.map((detail) => (
                <p key={detail} className="mt-1">
                  {detail}
                </p>
              ))}
            </>
          }
          icon={
            <IconBadge tone="accent" size="lg" shape="circle">
              <HeartPulse className="size-5" />
            </IconBadge>
          }
        />
        <div className="mt-4">
          <RelationshipStatChips model={model} />
        </div>
      </section>
    </SurfaceCard>
  );
}
