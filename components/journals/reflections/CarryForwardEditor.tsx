"use client";

import { BookmarkPlus, Eye, Lightbulb, Plus, Trash2 } from "lucide-react";

import {
  JournalContactField,
  JournalField,
  JournalSelect,
} from "@/components/journals/fields/JournalFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLookups } from "@/hooks/useLookups";
import type { ApiId } from "@/types/api";
import type {
  CarryForwardDrafts,
  CarryForwardFactDraft,
  CarryForwardObservationDraft,
} from "@/types/journals";
import type { FactCategory } from "@/types/lookups";

type CarryForwardEditorProps = {
  value: CarryForwardDrafts;
  onChange: (value: CarryForwardDrafts) => void;
  suggestedContactId?: ApiId | null;
  suggestedEventId?: ApiId | null;
  readOnly?: boolean;
};

export function CarryForwardEditor({
  value,
  onChange,
  suggestedContactId = null,
  suggestedEventId = null,
  readOnly = false,
}: CarryForwardEditorProps) {
  const { factCategories, observationMarkers, isLoading } = useLookups();
  const categories = flattenCategories(factCategories);

  function addFact() {
    onChange({
      ...value,
      facts: [
        ...value.facts,
        {
          target_contact_id: suggestedContactId ?? "",
          category_id: null,
          label: "",
          detail_value: "",
          is_conversation_cue: false,
          published_fact_id: null,
        },
      ],
    });
  }

  function addObservation() {
    onChange({
      ...value,
      observations: [
        ...value.observations,
        {
          target_contact_id: suggestedContactId ?? "",
          marker_id: null,
          body: "",
          event_id: suggestedEventId,
          observation_type: "notice",
          status: "current",
          occurred_at: null,
          published_observation_id: null,
        },
      ],
    });
  }

  function updateFact(index: number, update: Partial<CarryForwardFactDraft>) {
    onChange({
      ...value,
      facts: value.facts.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...update } : item,
      ),
    });
  }

  function updateObservation(
    index: number,
    update: Partial<CarryForwardObservationDraft>,
  ) {
    onChange({
      ...value,
      observations: value.observations.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...update } : item,
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-primary/15 bg-accent/35 p-3 text-sm text-muted-foreground">
        Save only details you intentionally want to carry into a contact’s facts
        or observations. Nothing is suggested or inferred from your writing.
      </div>

      {value.facts.map((fact, index) => {
        const published = readOnly || fact.published_fact_id != null;
        return (
          <article
            key={fact.id ?? `fact-${index}`}
            className="rounded-lg border border-border/80 p-3"
          >
            <div className="flex items-center gap-2">
              <BookmarkPlus className="size-4 text-info" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Fact {index + 1}</h3>
              {published ? (
                <span className="ml-auto rounded-md bg-success-muted px-2 py-0.5 text-[11px] font-medium text-success">
                  {fact.published_fact_id != null
                    ? "Added to contact"
                    : "Locked"}
                </span>
              ) : (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="ml-auto text-destructive"
                  aria-label={`Remove fact ${index + 1}`}
                  onClick={() =>
                    onChange({
                      ...value,
                      facts: value.facts.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
            {published ? (
              <ReadOnlyCarryForward value={fact.detail_value} />
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <JournalField label="Contact">
                  <JournalContactField
                    value={fact.target_contact_id || null}
                    onChange={(next) =>
                      updateFact(index, {
                        target_contact_id: Array.isArray(next)
                          ? (next[0] ?? "")
                          : (next ?? ""),
                      })
                    }
                  />
                </JournalField>
                <JournalField label="Category" description="Optional">
                  <JournalSelect
                    value={fact.category_id ?? ""}
                    disabled={isLoading}
                    onChange={(event) =>
                      updateFact(index, {
                        category_id: event.target.value || null,
                      })
                    }
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </JournalSelect>
                </JournalField>
                <JournalField label="Label" description="Optional">
                  <Input
                    value={fact.label ?? ""}
                    placeholder="For example: Favorite order"
                    onChange={(event) =>
                      updateFact(index, { label: event.target.value })
                    }
                  />
                </JournalField>
                <JournalField label="Value">
                  <Input
                    value={fact.detail_value}
                    placeholder="The detail you want to remember"
                    onChange={(event) =>
                      updateFact(index, { detail_value: event.target.value })
                    }
                  />
                </JournalField>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={fact.is_conversation_cue ?? false}
                    onChange={(event) =>
                      updateFact(index, {
                        is_conversation_cue: event.target.checked,
                      })
                    }
                  />
                  Use as a future conversation cue
                </label>
              </div>
            )}
          </article>
        );
      })}

      {value.observations.map((observation, index) => {
        const published =
          readOnly || observation.published_observation_id != null;
        return (
          <article
            key={observation.id ?? `observation-${index}`}
            className="rounded-lg border border-border/80 p-3"
          >
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-success" aria-hidden="true" />
              <h3 className="text-sm font-semibold">Observation {index + 1}</h3>
              {published ? (
                <span className="ml-auto rounded-md bg-success-muted px-2 py-0.5 text-[11px] font-medium text-success">
                  {observation.published_observation_id != null
                    ? "Added to contact"
                    : "Locked"}
                </span>
              ) : (
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="ml-auto text-destructive"
                  aria-label={`Remove observation ${index + 1}`}
                  onClick={() =>
                    onChange({
                      ...value,
                      observations: value.observations.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
                  }
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
            {published ? (
              <ReadOnlyCarryForward value={observation.body} />
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <JournalField label="Contact">
                  <JournalContactField
                    value={observation.target_contact_id || null}
                    onChange={(next) =>
                      updateObservation(index, {
                        target_contact_id: Array.isArray(next)
                          ? (next[0] ?? "")
                          : (next ?? ""),
                      })
                    }
                  />
                </JournalField>
                <JournalField label="Marker" description="Optional">
                  <JournalSelect
                    value={observation.marker_id ?? ""}
                    disabled={isLoading}
                    onChange={(event) =>
                      updateObservation(index, {
                        marker_id: event.target.value || null,
                      })
                    }
                  >
                    <option value="">No marker</option>
                    {observationMarkers.map((marker) => (
                      <option key={marker.id} value={marker.id}>
                        {marker.name}
                      </option>
                    ))}
                  </JournalSelect>
                </JournalField>
                <JournalField
                  label="Observation"
                  description="Write only what you personally noticed."
                >
                  <textarea
                    value={observation.body}
                    rows={3}
                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:col-span-2"
                    placeholder="What do you want to remember?"
                    onChange={(event) =>
                      updateObservation(index, { body: event.target.value })
                    }
                  />
                </JournalField>
                <JournalField label="Kind">
                  <JournalSelect
                    value={observation.observation_type ?? "notice"}
                    onChange={(event) =>
                      updateObservation(index, {
                        observation_type: event.target
                          .value as CarryForwardObservationDraft["observation_type"],
                      })
                    }
                  >
                    <option value="notice">Notice</option>
                    <option value="conversation_cue">Conversation cue</option>
                    <option value="appreciation">Appreciation</option>
                    <option value="change">Change</option>
                  </JournalSelect>
                </JournalField>
                <JournalField label="Status">
                  <JournalSelect
                    value={observation.status ?? "current"}
                    onChange={(event) =>
                      updateObservation(index, {
                        status: event.target
                          .value as CarryForwardObservationDraft["status"],
                      })
                    }
                  >
                    <option value="current">Current</option>
                    <option value="revisit_later">Revisit later</option>
                    <option value="archived">Archived</option>
                  </JournalSelect>
                </JournalField>
              </div>
            )}
          </article>
        );
      })}

      {!value.facts.length && !value.observations.length ? (
        <div className="rounded-md border border-dashed p-5 text-center">
          <Lightbulb
            className="mx-auto size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium">Nothing carried forward</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This step is optional. Add something only when you choose to.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={readOnly}
          onClick={addFact}
        >
          <Plus className="size-4" />
          Add fact
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={readOnly}
          onClick={addObservation}
        >
          <Plus className="size-4" />
          Add observation
        </Button>
      </div>
    </div>
  );
}

function ReadOnlyCarryForward({ value }: { value: string }) {
  return (
    <p className="mt-3 rounded-md bg-muted/45 p-3 text-sm text-muted-foreground">
      {value}
    </p>
  );
}

function flattenCategories(categories: FactCategory[]): FactCategory[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children),
  ]);
}
