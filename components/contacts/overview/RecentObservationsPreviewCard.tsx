import type { KeyboardEvent } from "react";
import { ChevronRight, MessageSquareText } from "lucide-react";
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
      className="rounded-lg border border-border/70 bg-background/70 p-4 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 motion-reduce:hover:translate-y-0"
      onClick={onViewAll}
      onKeyDown={handleKeyDown}
    >
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

      <span className="mt-4 flex h-8 w-full items-center justify-between rounded-md border border-border bg-background px-2.5 text-sm font-medium text-violet-700">
        {isEmpty ? "Add an observation" : "View all observations"}
        {isEmpty ? (
          <ChevronRight className="size-4" />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {observations.length}
          </span>
        )}
      </span>
    </section>
  );
}
