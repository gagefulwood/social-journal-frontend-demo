import { ChevronRight, MessageSquareText } from "lucide-react";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { formatDate, idsMatch } from "@/components/contacts/contact-utils";
import { getObservationMarkerPresentation } from "@/components/contacts/observation-marker-presentation";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
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
  const activeObservations = observations.filter(
    (observation) => observation.is_active,
  );
  const previewObservations = [...activeObservations]
    .sort(
      (left, right) =>
        new Date(right.created_timestamp).getTime() -
        new Date(left.created_timestamp).getTime(),
    )
    .slice(0, 3);
  const isEmpty = previewObservations.length === 0;

  return (
    <SurfaceCard asChild hoverable>
      <button
        type="button"
        aria-label="View all observations"
        className="block w-full appearance-none p-3.5 text-left font-[inherit] text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0"
        onClick={onViewAll}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconBadge tone="rose" size="md">
              <MessageSquareText className="size-5" />
            </IconBadge>
            <h3 className="font-semibold">Recent Observations</h3>
          </div>
          <span className="rounded-full bg-marker-rose px-2.5 py-1 text-xs font-semibold text-marker-rose-foreground">
            {activeObservations.length}
          </span>
        </div>

        {previewObservations.length > 0 ? (
          <ul className="space-y-2.5">
            {previewObservations.map((observation) => {
              const marker = observationMarkers.find((item) =>
                idsMatch(item.id, observation.marker),
              );
              const markerPresentation =
                getObservationMarkerPresentation(marker);
              const Icon = markerPresentation.icon;

              return (
                <li
                  key={observation.id}
                  className="relative flex gap-2.5 text-sm"
                >
                  <div className="relative mt-0.5 w-8 shrink-0 self-stretch">
                    <span
                      className={cn(
                        "absolute left-0 top-1 h-full min-h-10 w-0.5 rounded-full",
                        markerPresentation.line,
                      )}
                    />
                    <span className="absolute left-2 top-0 flex size-6 items-center justify-center rounded-full border border-background bg-background shadow-sm">
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full",
                          markerPresentation.badge,
                          markerPresentation.text,
                        )}
                      >
                        <Icon className={markerPresentation.iconClassName} />
                      </span>
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-4 text-muted-foreground">
                      {formatDate(observation.created_timestamp)}
                    </p>
                    <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-5 text-foreground">
                      {observation.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyActionBox
            icon={
              <IconBadge tone="neutral" size="sm" className="shadow-none">
                <MessageSquareText className="size-4" />
              </IconBadge>
            }
            title="No recent observations"
            copy="Recent notes and patterns will appear here once you save observations."
          />
        )}

        <span className="mt-3 flex h-8 w-full items-center justify-between border-t border-border/70 pt-2.5 text-sm font-semibold text-primary-strong">
          View all observations
          {isEmpty ? (
            <ChevronRight className="size-4" />
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {activeObservations.length}
            </span>
          )}
        </span>
      </button>
    </SurfaceCard>
  );
}
