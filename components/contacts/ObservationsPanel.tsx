"use client";

import { useState } from "react";
import { Edit, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ObservationForm } from "@/components/contacts/ObservationForm";
import { formatDate, idsMatch } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { ApiId } from "@/types/api";
import type {
  CreateObservationRequest,
  Observation,
  UpdateObservationRequest,
} from "@/types/contacts";

type ObservationsPanelProps = {
  observations?: Observation[];
  onCreate: (data: CreateObservationRequest) => Promise<void>;
  onUpdate: (
    observationId: ApiId,
    data: UpdateObservationRequest
  ) => Promise<void>;
  onDelete: (observationId: ApiId) => Promise<void>;
};

export function ObservationsPanel({
  observations = [],
  onCreate,
  onUpdate,
  onDelete,
}: ObservationsPanelProps) {
  const safeObservations = Array.isArray(observations) ? observations : [];
  const [isCreating, setIsCreating] = useState(false);
  const [editingObservation, setEditingObservation] =
    useState<Observation | null>(null);
  const { observationMarkers } = useLookups();

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Observations</h2>
          <p className="text-sm text-muted-foreground">
            Notes that can change over time.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {isCreating && (
        <div className="mb-4 rounded-md bg-muted p-4">
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
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-md bg-background text-muted-foreground">
              <MessageSquareText className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium">No observations yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Use observations for patterns, changes, or context you want to
              revisit.
            </p>
          </div>
        )}
        {safeObservations.map((observation) => {
          const marker = observationMarkers.find((item) =>
            idsMatch(item.id, observation.marker)
          );

          return (
            <div
              key={observation.id}
              className="rounded-md border border-border p-3"
            >
              {editingObservation?.id === observation.id ? (
                <ObservationForm
                  observation={observation}
                  onSubmit={async (data) => {
                    await onUpdate(observation.id, data);
                    setEditingObservation(null);
                  }}
                  onCancel={() => setEditingObservation(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {marker && (
                        <span
                          className="rounded-md px-2 py-1 text-foreground"
                          style={{ backgroundColor: marker.color_hex }}
                        >
                          {marker.name}
                        </span>
                      )}
                      <span>{formatDate(observation.created_timestamp)}</span>
                      {!observation.is_active && <span>Inactive</span>}
                    </div>
                    <p className="whitespace-pre-wrap text-sm">
                      {observation.body}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditingObservation(observation)}
                      aria-label="Edit observation"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => void onDelete(observation.id)}
                      aria-label="Delete observation"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
