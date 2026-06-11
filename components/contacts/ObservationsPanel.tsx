"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import {
  AlertCircle,
  Bell,
  Edit,
  FileText,
  Info,
  MessageSquareText,
  Plus,
  Star,
  Trash2,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObservationForm } from "@/components/contacts/ObservationForm";
import { formatDate, idsMatch } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type {
  CreateObservationRequest,
  Observation,
  UpdateObservationRequest,
} from "@/types/contacts";
import type { ObservationMarker } from "@/types/lookups";

type ObservationsPanelProps = {
  observations?: Observation[];
  initialCreateOpen?: boolean;
  onCreate: (data: CreateObservationRequest) => Promise<void>;
  onUpdate: (
    observationId: ApiId,
    data: UpdateObservationRequest,
  ) => Promise<void>;
  onDelete: (observationId: ApiId) => Promise<void>;
};

export function ObservationsPanel({
  observations = [],
  initialCreateOpen = false,
  onCreate,
  onUpdate,
  onDelete,
}: ObservationsPanelProps) {
  const safeObservations = Array.isArray(observations) ? observations : [];
  const [isCreating, setIsCreating] = useState(initialCreateOpen);
  const [editingObservation, setEditingObservation] =
    useState<Observation | null>(null);
  const { observationMarkers } = useLookups();
  const sortedObservations = [...safeObservations].sort(
    (left, right) =>
      new Date(right.created_timestamp).getTime() -
      new Date(left.created_timestamp).getTime(),
  );

  return (
    <section className="rounded-xl border border-border/80 bg-card p-5 shadow-sm shadow-violet-100/40">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-sm shadow-violet-100">
            <MessageSquareText className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Observations</h2>
            <p className="text-sm text-muted-foreground">
              Things I&apos;ve noticed over time.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-violet-300 text-violet-700 hover:bg-violet-50"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="size-4" />
          Add observation
        </Button>
      </div>

      {isCreating && (
        <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <ObservationForm
            onSubmit={async (data) => {
              await onCreate(data);
              setIsCreating(false);
            }}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {safeObservations.length === 0 && (
          <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/30 p-6 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-background text-violet-700 shadow-sm">
              <MessageSquareText className="size-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">No observations yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Capture patterns, changes, or small details you may want to
              revisit later.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 border-violet-300 text-violet-700 hover:bg-violet-50"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="size-4" />
              Add observation
            </Button>
          </div>
        )}
        {sortedObservations.map((observation, index) => {
          const marker = observationMarkers.find((item) =>
            idsMatch(item.id, observation.marker),
          );
          const tone = getTimelineTone(index);
          const Icon = getMarkerIcon(marker);
          const markerStyle = getMarkerStyle(marker);

          return (
            <div
              key={observation.id}
              className="grid gap-3 sm:grid-cols-[5rem_minmax(0,1fr)]"
            >
              <div className="pt-3 text-xs font-medium leading-5 text-muted-foreground sm:text-right">
                {formatDate(observation.created_timestamp)}
              </div>
              {editingObservation?.id === observation.id ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <ObservationForm
                    observation={observation}
                    onSubmit={async (data) => {
                      await onUpdate(observation.id, data);
                      setEditingObservation(null);
                    }}
                    onCancel={() => setEditingObservation(null)}
                  />
                </div>
              ) : (
                <div className="relative flex gap-3">
                  <span
                    className={cn(
                      "absolute left-4 top-10 h-[calc(100%-2.5rem)] w-px rounded-full",
                      index === sortedObservations.length - 1
                        ? "bg-transparent"
                        : tone.line,
                    )}
                  />
                  <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-full",
                        tone.badge,
                        tone.text,
                      )}
                      style={markerStyle.icon}
                    >
                      <Icon className="size-3.5" />
                    </span>
                  </span>
                  <article className="min-w-0 flex-1 rounded-xl border border-border/80 bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2.5 py-1 text-xs font-medium",
                            tone.pill,
                            tone.text,
                          )}
                          style={markerStyle.pill}
                        >
                          {marker?.name ?? "Observation"}
                        </span>
                        {!observation.is_active && (
                          <span className="ml-2 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-0.5 opacity-65 transition-opacity hover:opacity-100">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => setEditingObservation(observation)}
                          aria-label="Edit observation"
                          className="text-muted-foreground hover:text-violet-700"
                        >
                          <Edit className="size-3.5" />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => void onDelete(observation.id)}
                          aria-label="Delete observation"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {observation.body}
                    </p>
                  </article>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

type TimelineTone = {
  badge: string;
  line: string;
  pill: string;
  text: string;
};

const TIMELINE_TONES: TimelineTone[] = [
  {
    badge: "bg-emerald-100",
    line: "bg-emerald-300",
    pill: "bg-emerald-100",
    text: "text-emerald-700",
  },
  {
    badge: "bg-orange-100",
    line: "bg-orange-300",
    pill: "bg-orange-100",
    text: "text-orange-700",
  },
  {
    badge: "bg-amber-100",
    line: "bg-amber-300",
    pill: "bg-amber-100",
    text: "text-amber-700",
  },
  {
    badge: "bg-sky-100",
    line: "bg-sky-300",
    pill: "bg-sky-100",
    text: "text-sky-700",
  },
];
const DEFAULT_TIMELINE_TONE: TimelineTone = TIMELINE_TONES[0] ?? {
  badge: "bg-emerald-100",
  line: "bg-emerald-300",
  pill: "bg-emerald-100",
  text: "text-emerald-700",
};

const MARKER_ICON_MAP: Record<string, LucideIcon> = {
  FiAlertCircle: AlertCircle,
  FiBell: Bell,
  FiFileText: FileText,
  FiInfo: Info,
  FiStar: Star,
  FiUser: User,
  FiUsers: Users,
};

function getTimelineTone(index: number): TimelineTone {
  return TIMELINE_TONES[index % TIMELINE_TONES.length] ?? DEFAULT_TIMELINE_TONE;
}

function getMarkerIcon(marker: ObservationMarker | undefined): LucideIcon {
  if (!marker?.icon_reference) {
    return Star;
  }

  return MARKER_ICON_MAP[marker.icon_reference] ?? Star;
}

function getMarkerStyle(marker: ObservationMarker | undefined): {
  icon?: CSSProperties;
  pill?: CSSProperties;
} {
  if (!marker?.color_hex) {
    return {};
  }

  return {
    icon: {
      backgroundColor: "transparent",
      color: marker.color_hex,
    },
    pill: {
      backgroundColor: "transparent",
      color: marker.color_hex,
    },
  };
}
