"use client";

import { useState, type FormEvent } from "react";
import { Edit, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { idsMatch } from "@/components/contacts/contact-utils";
import {
  getObservationMarkerPresentation,
  type ObservationMarkerPresentation,
} from "@/components/contacts/observation-marker-presentation";
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

type ObservationEditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; observationId: ApiId };

export function ObservationsPanel({
  observations = [],
  initialCreateOpen = false,
  onCreate,
  onUpdate,
  onDelete,
}: ObservationsPanelProps) {
  const safeObservations = Array.isArray(observations) ? observations : [];
  const [editor, setEditor] = useState<ObservationEditorState>(
    initialCreateOpen ? { mode: "create" } : { mode: "closed" },
  );
  const { observationMarkers } = useLookups();
  const sortedObservations = [...safeObservations].sort(
    (left, right) =>
      new Date(right.created_timestamp).getTime() -
      new Date(left.created_timestamp).getTime(),
  );

  return (
    <section className="rounded-lg border border-border/80 bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-marker-rose text-marker-rose-foreground shadow-sm">
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
          className="border-primary/30 text-primary-strong hover:bg-accent hover:text-accent-foreground"
          onClick={() => setEditor({ mode: "create" })}
        >
          <Plus className="size-4" />
          Add observation
        </Button>
      </div>

      <div className="space-y-3">
        {editor.mode === "create" && (
          <ObservationComposerTimelineItem
            observationMarkers={observationMarkers}
            onCancel={() => setEditor({ mode: "closed" })}
            onSubmit={async (data) => {
              await onCreate(data);
              setEditor({ mode: "closed" });
            }}
          />
        )}

        {safeObservations.length === 0 && editor.mode !== "create" && (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-md bg-marker-rose text-marker-rose-foreground shadow-sm">
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
              className="mt-4 border-primary/30 text-primary-strong hover:bg-accent hover:text-accent-foreground"
              onClick={() => setEditor({ mode: "create" })}
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
          const isEditing =
            editor.mode === "edit" &&
            idsMatch(editor.observationId, observation.id);

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
              <article className="min-w-0 rounded-lg border border-border/80 bg-background p-3.5 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
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
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                        {observation.body}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-0.5 opacity-60 transition-opacity hover:opacity-100">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() =>
                          setEditor({
                            mode: "edit",
                            observationId: observation.id,
                          })
                        }
                        aria-label="Edit observation"
                        className="text-muted-foreground hover:text-primary-strong"
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
                  {isEditing && (
                    <ObservationEditorTray
                      initialBody={observation.body}
                      initialMarkerId={
                        observation.marker == null
                          ? ""
                          : String(observation.marker)
                      }
                      markerPresentation={markerPresentation}
                      observationMarkers={observationMarkers}
                      onCancel={() => setEditor({ mode: "closed" })}
                      onSubmit={async (data) => {
                        await onUpdate(observation.id, data);
                        setEditor({ mode: "closed" });
                      }}
                    />
                  )}
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type ObservationEditorFieldsProps = {
  initialBody: string;
  initialMarkerId: string;
  mode: "create" | "edit";
  observationMarkers: ReturnType<typeof useLookups>["observationMarkers"];
  onCancel: () => void;
  onSubmit: (data: CreateObservationRequest) => Promise<void>;
};

function ObservationComposerTimelineItem({
  observationMarkers,
  onCancel,
  onSubmit,
}: {
  observationMarkers: ReturnType<typeof useLookups>["observationMarkers"];
  onCancel: () => void;
  onSubmit: (data: CreateObservationRequest) => Promise<void>;
}) {
  const markerPresentation = getObservationMarkerPresentation(undefined);
  const Icon = markerPresentation.icon;

  return (
    <div className="grid gap-2.5 sm:grid-cols-[4.5rem_2.5rem_minmax(0,1fr)]">
      <div className="pt-2 text-xs font-medium leading-4 text-muted-foreground sm:text-right">
        <span className="block">New</span>
        <span className="block">now</span>
      </div>
      <div className="relative flex justify-center">
        <span className="absolute top-0 h-full min-h-20 w-px rounded-full bg-border" />
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
      <article className="min-w-0 rounded-lg border border-border bg-muted/30 p-3.5 shadow-sm">
        <div className="mb-3 flex items-start gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-marker-rose text-marker-rose-foreground">
            <MessageSquareText className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Add a new observation
            </h3>
            <p className="text-sm text-muted-foreground">
              Capture something you noticed over time.
            </p>
          </div>
        </div>
        <ObservationEditorFields
          initialBody=""
          initialMarkerId=""
          mode="create"
          observationMarkers={observationMarkers}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </article>
    </div>
  );
}

function ObservationEditorTray({
  initialBody,
  initialMarkerId,
  markerPresentation,
  observationMarkers,
  onCancel,
  onSubmit,
}: Omit<ObservationEditorFieldsProps, "mode"> & {
  markerPresentation: ObservationMarkerPresentation;
}) {
  const editorTone = getObservationEditorTone(markerPresentation);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 shadow-inner",
        editorTone.border,
        editorTone.surface,
      )}
    >
      <ObservationEditorFields
        initialBody={initialBody}
        initialMarkerId={initialMarkerId}
        mode="edit"
        observationMarkers={observationMarkers}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function ObservationEditorFields({
  initialBody,
  initialMarkerId,
  mode,
  observationMarkers,
  onCancel,
  onSubmit,
}: ObservationEditorFieldsProps) {
  const [markerId, setMarkerId] = useState(initialMarkerId);
  const [body, setBody] = useState(initialBody);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedBody = body.trim();
  const isSaveDisabled = isSubmitting || trimmedBody.length === 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaveDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateObservationRequest = {
        marker: markerId || null,
        body: trimmedBody,
      };

      if (mode === "create") {
        payload.is_active = true;
      }

      await onSubmit({
        ...payload,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-[0.8fr_1.4fr]">
        <div className="space-y-1.5">
          <Label htmlFor={`observation-${mode}-marker`}>Marker</Label>
          <select
            id={`observation-${mode}-marker`}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={markerId}
            onChange={(event) => setMarkerId(event.target.value)}
          >
            <option value="">No marker</option>
            {observationMarkers.map((marker) => (
              <option key={marker.id} value={String(marker.id)}>
                {marker.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`observation-${mode}-body`}>Observation</Label>
          <textarea
            id={`observation-${mode}-body`}
            autoFocus
            className="min-h-20 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 shadow-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Something I noticed over time..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="border-border bg-background"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSaveDisabled}
          className="bg-primary-strong text-primary-foreground hover:bg-primary"
        >
          {mode === "edit" ? "Save changes" : "Save observation"}
        </Button>
      </div>
    </form>
  );
}

type ObservationEditorTone = {
  border: string;
  surface: string;
};

function getObservationEditorTone(
  markerPresentation: ObservationMarkerPresentation,
): ObservationEditorTone {
  return {
    border: markerPresentation.border,
    surface: markerPresentation.surface,
  };
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
