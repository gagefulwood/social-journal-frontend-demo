import { ChevronRight, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import { formatDate, idsMatch } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { Observation } from "@/types/contacts";

type RecentObservationsPreviewCardProps = {
  observations: Observation[];
  onViewAll: () => void;
};

export function RecentObservationsPreviewCard({
  observations,
  onViewAll,
}: RecentObservationsPreviewCardProps) {
  const { observationMarkers } = useLookups();
  const previewObservations = [...observations]
    .filter((observation) => observation.is_active)
    .sort(
      (left, right) =>
        new Date(right.created_timestamp).getTime() -
        new Date(left.created_timestamp).getTime(),
    )
    .slice(0, 3);
  const isEmpty = previewObservations.length === 0;

  return (
    <section className="rounded-lg border border-border/70 bg-background/70 p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <MessageSquareText className="size-4" />
          </span>
          <h3 className="font-semibold">Recent Observations</h3>
        </div>
      </div>

      {previewObservations.length > 0 ? (
        <ul className="divide-y divide-border">
          {previewObservations.map((observation) => {
            const marker = observationMarkers.find((item) =>
              idsMatch(item.id, observation.marker),
            );

            return (
              <li key={observation.id} className="relative py-4 pr-5">
                <span
                  className="absolute right-1 top-5 size-2 rounded-full bg-violet-500"
                  style={
                    marker ? { backgroundColor: marker.color_hex } : undefined
                  }
                />
                <p className="text-xs font-medium text-muted-foreground">
                  {formatDate(observation.created_timestamp)}
                </p>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm">
                  {observation.body}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <ContactOverviewEmptyState
          icon={<MessageSquareText className="size-4" />}
          title="No recent observations"
          copy="Capture patterns, changes, or context you may want to revisit."
        />
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 w-full justify-between bg-background text-violet-700 hover:bg-violet-50"
        onClick={onViewAll}
      >
        {isEmpty ? "Add an observation" : "View all observations"}
        {isEmpty ? (
          <ChevronRight className="size-4" />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {observations.length}
          </span>
        )}
      </Button>
    </section>
  );
}
