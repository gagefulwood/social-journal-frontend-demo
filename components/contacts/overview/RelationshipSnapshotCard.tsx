import { HeartPulse } from "lucide-react";
import { RelationshipStatChips } from "./RelationshipStatChips";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RelationshipSnapshotCardProps = {
  model: ContactOverviewModel;
};

export function RelationshipSnapshotCard({
  model,
}: RelationshipSnapshotCardProps) {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <HeartPulse className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold leading-7">
            Relationship Snapshot
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {model.relationshipSnapshot.headline}
          </p>
          {model.relationshipSnapshot.details.length > 0 && (
            <div className="mt-1 space-y-1 text-sm text-muted-foreground">
              {model.relationshipSnapshot.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <RelationshipStatChips model={model} />
      </div>
    </section>
  );
}
