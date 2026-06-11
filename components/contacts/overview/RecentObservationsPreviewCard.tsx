import type { CSSProperties, KeyboardEvent } from "react";
import {
  AlertCircle,
  Bell,
  ChevronRight,
  FileText,
  Info,
  MessageSquareText,
  Star,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ContactOverviewEmptyState } from "./ContactOverviewEmptyState";
import { formatDate, idsMatch } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Observation } from "@/types/contacts";
import type { ObservationMarker } from "@/types/lookups";

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
      aria-label="View all observations"
      className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm shadow-violet-100/50 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0 motion-reduce:hover:translate-y-0"
      onClick={onViewAll}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-sm shadow-violet-100">
            <MessageSquareText className="size-5" />
          </span>
          <h3 className="font-semibold">Recent Observations</h3>
        </div>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
          {activeObservations.length}
        </span>
      </div>

      {previewObservations.length > 0 ? (
        <ul className="space-y-4">
          {previewObservations.map((observation) => {
            const marker = observationMarkers.find((item) =>
              idsMatch(item.id, observation.marker),
            );
            const Icon = getMarkerIcon(marker);
            const markerStyle = getMarkerStyle(marker);

            return (
              <li
                key={observation.id}
                className="relative flex gap-3 pl-1 text-sm"
              >
                <span
                  className={cn(
                    "mt-1 h-full min-h-16 w-0.5 shrink-0 rounded-full bg-violet-200",
                    !marker && "bg-orange-200",
                  )}
                  style={markerStyle.line}
                />
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-violet-700 shadow-sm">
                  <span
                    className="flex size-6 items-center justify-center rounded-full bg-violet-50 text-violet-700"
                    style={markerStyle.icon}
                  >
                    <Icon className="size-3.5" />
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {formatDate(observation.created_timestamp)}
                  </p>
                  <p className="line-clamp-3 whitespace-pre-wrap leading-6 text-foreground">
                    {observation.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ContactOverviewEmptyState
          icon={<MessageSquareText className="size-4" />}
          title="No recent observations"
          copy="Recent notes and patterns will appear here once you save observations."
        />
      )}

      <span className="mt-4 flex h-9 w-full items-center justify-between border-t border-border/70 pt-3 text-sm font-semibold text-violet-700">
        View all observations
        {isEmpty ? (
          <ChevronRight className="size-4" />
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {activeObservations.length}
          </span>
        )}
      </span>
    </section>
  );
}

const MARKER_ICON_MAP: Record<string, LucideIcon> = {
  FiAlertCircle: AlertCircle,
  FiBell: Bell,
  FiFileText: FileText,
  FiInfo: Info,
  FiStar: Star,
  FiUser: User,
  FiUsers: Users,
};

function getMarkerIcon(marker: ObservationMarker | undefined): LucideIcon {
  if (!marker?.icon_reference) {
    return Star;
  }

  return MARKER_ICON_MAP[marker.icon_reference] ?? Star;
}

function getMarkerStyle(marker: ObservationMarker | undefined): {
  line?: CSSProperties;
  icon?: CSSProperties;
} {
  if (!marker?.color_hex) {
    return {};
  }

  return {
    line: { backgroundColor: marker.color_hex },
    icon: {
      color: marker.color_hex,
      backgroundColor: "transparent",
    },
  };
}
