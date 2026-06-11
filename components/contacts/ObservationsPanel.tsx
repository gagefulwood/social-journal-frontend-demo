"use client";

import { useState } from "react";
import { Edit, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObservationForm } from "@/components/contacts/ObservationForm";
import { idsMatch } from "@/components/contacts/contact-utils";
import { getObservationMarkerPresentation } from "@/components/contacts/observation-marker-presentation";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type {
  CreateObservationRequest,
  Observation,
  UpdateObservationRequest,
} from "@/types/contacts";

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

      <div className="space-y-3">
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
          const markerPresentation = getObservationMarkerPresentation(marker);
          const Icon = markerPresentation.icon;
          const dateParts = formatObservationDateParts(
            observation.created_timestamp,
          );

          return (
            <div
              key={observation.id}
              className="grid gap-2.5 sm:grid-cols-[4.5rem_2.5rem_minmax(0,1fr)]"
            >
              <div className="pt-2 text-xs font-medium leading-4 text-muted-foreground sm:text-right">
                <span className="block">{dateParts.monthDay}</span>
                <span className="block">{dateParts.year}</span>
              </div>
              <div className="relative flex justify-center">
                <span
                  className={cn(
                    "absolute top-0 h-[calc(100%+0.75rem)] w-px rounded-full bg-border",
                    index === sortedObservations.length - 1 && "h-8",
                  )}
                />
                <span className="relative z-10 mt-0.5 flex size-8 items-center justify-center rounded-full border border-background bg-background shadow-sm">
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full",
                      markerPresentation.badge,
                      markerPresentation.text,
                    )}
                  >
                    <Icon className={markerPresentation.iconClassName} />
                  </span>
                </span>
              </div>
              {editingObservation?.id === observation.id ? (
                <div className="rounded-xl border border-border bg-muted/30 p-3">
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
                <article className="min-w-0 rounded-xl border border-border/80 bg-background p-3.5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {observation.body}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2.5 py-1 text-xs font-medium",
                            markerPresentation.pill,
                            markerPresentation.text,
                          )}
                        >
                          {marker?.name ?? "Observation"}
                        </span>
                        {!observation.is_active && (
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5 opacity-60 transition-opacity hover:opacity-100">
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
                </article>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

type ObservationDateParts = {
  monthDay: string;
  year: string;
};

function formatObservationDateParts(value: string): ObservationDateParts {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      monthDay: "Not set",
      year: "",
    };
  }

  return {
    monthDay: new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
    }).format(date),
    year: new Intl.DateTimeFormat(undefined, {
      year: "numeric",
    }).format(date),
  };
}
