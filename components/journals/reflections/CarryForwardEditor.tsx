"use client";

import { useEffect, useState } from "react";
import {
  BookOpenCheck,
  Lightbulb,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  flattenFactCategories,
  idsMatch,
} from "@/components/contacts/contact-utils";
import {
  CarryForwardEntryShell,
  CarryForwardSemanticChoice,
  CarryForwardSemanticPicker,
  type CarryForwardPickerOption,
} from "@/components/journals/reflections/CarryForwardPrimitives";
import { JournalField } from "@/components/journals/fields/JournalFields";
import { JournalRelatedContactSelector } from "@/components/journals/shared/JournalRelatedContextSelector";
import { FactCategoryIconTile } from "@/components/presentation/FactCategoryIconTile";
import { ObservationIconTile } from "@/components/presentation/ObservationIconTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useLookups } from "@/hooks/useLookups";
import { getFactCategoryPresentation } from "@/lib/presentation/factPresentation";
import {
  getObservationMarkerPresentation,
  getObservationTypePresentation,
  type ObservationMarkerPresentation,
} from "@/lib/presentation/observationPresentation";
import { getObservationStatusPresentation } from "@/lib/presentation/observationStatusPresentation";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { ObservationStatus } from "@/types/contacts";
import type {
  CarryForwardDrafts,
  CarryForwardFactDraft,
  CarryForwardObservationDraft,
} from "@/types/journals";
import type { ObservationMarker } from "@/types/lookups";

type CarryForwardEditorProps = {
  value: CarryForwardDrafts;
  onChange: (value: CarryForwardDrafts) => void;
  suggestedContactId?: ApiId | null;
  suggestedEventId?: ApiId | null;
  readOnly?: boolean;
  showValidationErrors?: boolean;
};

const OBSERVATION_TYPE_OPTIONS = [
  { value: "notice", label: "Notice" },
  { value: "conversation_cue", label: "Conversation cue" },
  { value: "appreciation", label: "Appreciation" },
  { value: "change", label: "Change" },
] satisfies CarryForwardPickerOption[];

const OBSERVATION_STATUS_OPTIONS = [
  { value: "current", label: "Current" },
  { value: "revisit_later", label: "Revisit later" },
  { value: "archived", label: "Archived" },
] satisfies CarryForwardPickerOption[];

export function CarryForwardEditor({
  value,
  onChange,
  suggestedContactId = null,
  suggestedEventId = null,
  readOnly = false,
  showValidationErrors = false,
}: CarryForwardEditorProps) {
  const {
    factCategories,
    observationMarkers,
    getFactCategoryById,
    getObservationMarkerById,
    isHydrated,
    isLoading,
    error: lookupError,
    hydrate: hydrateLookups,
    refresh: refreshLookups,
  } = useLookups({ autoLoad: false });
  const categories = flattenFactCategories(factCategories);
  const lookupsUnavailable = !isHydrated && Boolean(lookupError);
  const lookupsPending = !isHydrated && !lookupsUnavailable;
  const totalItems = value.facts.length + value.observations.length;

  useEffect(() => {
    if (!isHydrated && !isLoading && !lookupError) {
      void hydrateLookups();
    }
  }, [hydrateLookups, isHydrated, isLoading, lookupError]);

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
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-primary/15 bg-primary/3 p-3 text-sm leading-5 text-muted-foreground">
        <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/5 text-primary">
          <ShieldCheck className="size-4" aria-hidden="true" />
        </span>
        <p className="min-w-0">
          Save only details you intentionally want to carry into a contact’s
          facts or observations. Nothing is suggested or inferred from your
          writing.
        </p>
      </div>

      {lookupsUnavailable ? (
        <div
          role="alert"
          className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-3"
        >
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Fact categories and observation markers could not be loaded.
            Existing lookup IDs remain unchanged.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={() => void refreshLookups()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      {value.facts.map((fact, index) => {
        const locked = readOnly || fact.published_fact_id != null;
        const category =
          fact.category_id == null
            ? null
            : (getFactCategoryById(fact.category_id) ?? null);
        const categoryUnavailable =
          fact.category_id != null && category == null && !lookupsPending;
        const categoryPresentation = getFactCategoryPresentation(category);
        const categoryValue =
          fact.category_id == null ? "" : String(fact.category_id);
        const categoryOptions: CarryForwardPickerOption[] = [
          { value: "", label: "No category" },
          ...categories.map((option) => ({
            value: String(option.id),
            label: option.name,
          })),
        ];
        if (
          fact.category_id != null &&
          !categories.some((option) => idsMatch(option.id, fact.category_id))
        ) {
          categoryOptions.unshift({
            value: String(fact.category_id),
            label: lookupsPending
              ? "Loading category…"
              : "Unavailable category",
          });
        }

        const contactError =
          showValidationErrors && !hasApiId(fact.target_contact_id)
            ? "Choose a saved contact."
            : undefined;
        const valueError =
          showValidationErrors && !fact.detail_value.trim()
            ? "Add the value you want to remember."
            : undefined;
        const fieldPrefix = `carry-fact-${fact.id ?? index}`;

        return (
          <CarryForwardEntryShell
            key={fact.id ?? `fact-${index}`}
            kind="fact"
            title={`Fact ${index + 1}`}
            icon={
              <FactCategoryIconTile
                presentation={categoryPresentation}
                className="size-9 rounded-lg [&_svg]:size-4.5"
              />
            }
            badge={
              fact.published_fact_id != null
                ? "Added to contact"
                : readOnly
                  ? "Locked"
                  : "Draft"
            }
            onRemove={
              locked
                ? undefined
                : () =>
                    onChange({
                      ...value,
                      facts: value.facts.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
            }
          >
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <JournalRelatedContactSelector
                value={fact.target_contact_id || null}
                onChange={(next) =>
                  updateFact(index, {
                    target_contact_id: Array.isArray(next)
                      ? (next[0] ?? "")
                      : (next ?? ""),
                  })
                }
                label="Contact"
                presentation="popover"
                error={contactError}
                disabled={locked}
              />
              <CarryForwardSemanticPicker
                label="Category"
                helper="Fact category"
                value={categoryValue}
                displayValue={
                  category?.name ??
                  (categoryUnavailable
                    ? "Unavailable category"
                    : fact.category_id != null
                      ? "Loading category…"
                      : "No category")
                }
                options={categoryOptions}
                presentation={categoryPresentation}
                disabled={locked || lookupsPending}
                onChange={(nextValue) => {
                  const nextCategory = categories.find(
                    (option) => String(option.id) === nextValue,
                  );
                  updateFact(index, {
                    category_id: nextCategory?.id ?? null,
                  });
                }}
              />
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <JournalField
                label="Label"
                description="Optional"
                htmlFor={`${fieldPrefix}-label`}
                descriptionId={`${fieldPrefix}-label-description`}
              >
                {locked ? (
                  <textarea
                    id={`${fieldPrefix}-label`}
                    value={fact.label ?? ""}
                    readOnly
                    rows={1}
                    aria-describedby={`${fieldPrefix}-label-description`}
                    className="min-h-11 max-h-24 w-full resize-none overflow-y-auto rounded-lg border border-input bg-muted/20 px-3 py-2.5 text-sm leading-5 shadow-xs outline-none [field-sizing:content]"
                  />
                ) : (
                  <Input
                    id={`${fieldPrefix}-label`}
                    value={fact.label ?? ""}
                    aria-describedby={`${fieldPrefix}-label-description`}
                    className="h-11"
                    placeholder="For example: Favorite order"
                    onChange={(event) =>
                      updateFact(index, { label: event.target.value })
                    }
                  />
                )}
              </JournalField>
              <JournalField
                label="Value"
                error={valueError}
                htmlFor={`${fieldPrefix}-value`}
                errorId={`${fieldPrefix}-value-error`}
              >
                {locked ? (
                  <textarea
                    id={`${fieldPrefix}-value`}
                    value={fact.detail_value}
                    readOnly
                    rows={1}
                    aria-describedby={
                      valueError ? `${fieldPrefix}-value-error` : undefined
                    }
                    className="min-h-11 max-h-32 w-full resize-none overflow-y-auto rounded-lg border border-input bg-muted/20 px-3 py-2.5 text-sm leading-5 shadow-xs outline-none [field-sizing:content]"
                  />
                ) : (
                  <Input
                    id={`${fieldPrefix}-value`}
                    value={fact.detail_value}
                    aria-invalid={Boolean(valueError)}
                    aria-describedby={
                      valueError ? `${fieldPrefix}-value-error` : undefined
                    }
                    className="h-11"
                    placeholder="The detail you want to remember"
                    onChange={(event) =>
                      updateFact(index, { detail_value: event.target.value })
                    }
                  />
                )}
              </JournalField>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
              <Switch
                id={`fact-cue-${fact.id ?? index}`}
                checked={fact.is_conversation_cue ?? false}
                disabled={locked}
                className="disabled:opacity-100"
                onCheckedChange={(checked) =>
                  updateFact(index, { is_conversation_cue: checked })
                }
              />
              <Label
                htmlFor={`fact-cue-${fact.id ?? index}`}
                className="min-w-0 flex-1 cursor-pointer flex-col items-start gap-0"
              >
                <span className="block text-sm font-medium">
                  Use as a future conversation cue
                </span>
                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                  Show this in Remember next time.
                </span>
              </Label>
            </div>
          </CarryForwardEntryShell>
        );
      })}

      {value.observations.map((observation, index) => {
        const locked = readOnly || observation.published_observation_id != null;
        const resolvedMarker =
          observation.marker_id == null
            ? null
            : (getObservationMarkerById(observation.marker_id) ?? null);
        const typeValue = isObservationType(observation.observation_type)
          ? observation.observation_type
          : null;
        const statusValue = isObservationStatus(observation.status)
          ? observation.status
          : null;
        const typePresentation = getObservationTypePresentation(
          typeValue ?? "unknown",
        );
        const statusPresentation = statusValue
          ? getObservationStatusPresentation(statusValue)
          : undefined;
        const typeRawValue =
          typeof observation.observation_type === "string"
            ? observation.observation_type
            : "";
        const statusRawValue =
          typeof observation.status === "string" ? observation.status : "";
        const typeOptions = withUnavailableOption(
          OBSERVATION_TYPE_OPTIONS,
          typeRawValue,
          "Unavailable observation type",
        );
        const statusOptions = withUnavailableOption(
          OBSERVATION_STATUS_OPTIONS,
          statusRawValue,
          "Unavailable status",
        );
        const markerChoices = buildMarkerChoices(
          observationMarkers,
          observation.marker_id,
          resolvedMarker,
          lookupsPending,
        );
        const contactError =
          showValidationErrors && !hasApiId(observation.target_contact_id)
            ? "Choose a saved contact."
            : undefined;
        const bodyError =
          showValidationErrors && !observation.body.trim()
            ? "Write what you personally noticed."
            : undefined;
        const fieldPrefix = `carry-observation-${observation.id ?? index}`;

        return (
          <CarryForwardEntryShell
            key={observation.id ?? `observation-${index}`}
            kind="observation"
            title={`Observation ${index + 1}`}
            icon={
              <ObservationIconTile
                presentation={typePresentation}
                className="size-9 rounded-lg [&_svg]:size-4.5"
              />
            }
            badge={
              observation.published_observation_id != null
                ? "Added to contact"
                : readOnly
                  ? "Locked"
                  : "Draft"
            }
            onRemove={
              locked
                ? undefined
                : () =>
                    onChange({
                      ...value,
                      observations: value.observations.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    })
            }
          >
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(17rem,0.8fr)_minmax(0,1.55fr)]">
              <JournalRelatedContactSelector
                value={observation.target_contact_id || null}
                onChange={(next) =>
                  updateObservation(index, {
                    target_contact_id: Array.isArray(next)
                      ? (next[0] ?? "")
                      : (next ?? ""),
                  })
                }
                label="Contact"
                presentation="popover"
                error={contactError}
                disabled={locked}
              />
              <MarkerChoiceField
                choices={markerChoices}
                selectedId={observation.marker_id}
                disabled={locked || lookupsPending}
                onChange={(markerId) =>
                  updateObservation(index, { marker_id: markerId })
                }
              />
            </div>

            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.7fr)]">
              <JournalField
                label="Observation"
                description="Write only what you personally noticed."
                error={bodyError}
                htmlFor={`${fieldPrefix}-body`}
                descriptionId={`${fieldPrefix}-body-description`}
                errorId={`${fieldPrefix}-body-error`}
              >
                <textarea
                  id={`${fieldPrefix}-body`}
                  value={observation.body}
                  readOnly={locked}
                  aria-invalid={Boolean(bodyError)}
                  aria-describedby={[
                    `${fieldPrefix}-body-description`,
                    bodyError ? `${fieldPrefix}-body-error` : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  className="min-h-28 max-h-60 w-full resize-none overflow-y-auto rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-5 shadow-xs outline-none [field-sizing:content] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 read-only:bg-muted/20"
                  placeholder="What do you want to remember?"
                  onChange={(event) =>
                    updateObservation(index, { body: event.target.value })
                  }
                />
              </JournalField>
              <div className="grid min-w-0 content-start gap-3">
                <CarryForwardSemanticPicker
                  label="Kind"
                  helper="Observation type"
                  value={typeRawValue}
                  displayValue={
                    typeValue
                      ? typePresentation.label
                      : typeRawValue
                        ? "Unavailable observation type"
                        : "Choose a type"
                  }
                  options={
                    typeRawValue
                      ? typeOptions
                      : [{ value: "", label: "Choose a type" }, ...typeOptions]
                  }
                  presentation={typePresentation}
                  disabled={locked}
                  onChange={(nextValue) => {
                    if (nextValue === "") {
                      updateObservation(index, { observation_type: null });
                    } else if (isObservationType(nextValue)) {
                      updateObservation(index, {
                        observation_type: nextValue,
                      });
                    }
                  }}
                />
                <CarryForwardSemanticPicker
                  label="Status"
                  helper="Lifecycle status"
                  value={statusRawValue}
                  displayValue={
                    statusPresentation?.label ??
                    (statusRawValue ? "Unavailable status" : "Choose a status")
                  }
                  options={
                    statusRawValue
                      ? statusOptions
                      : [
                          { value: "", label: "Choose a status" },
                          ...statusOptions,
                        ]
                  }
                  presentation={statusPresentation}
                  disabled={locked}
                  onChange={(nextValue) => {
                    if (isObservationStatus(nextValue)) {
                      updateObservation(index, { status: nextValue });
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-2.5 rounded-lg border border-success/15 bg-success-muted/10 p-3">
              <BookOpenCheck
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden="true"
              />
              <p className="min-w-0 text-xs leading-4 text-muted-foreground">
                <span className="block font-semibold text-foreground">
                  {observation.published_observation_id != null
                    ? "Created from this reflection"
                    : readOnly
                      ? "Carried with this reflection"
                      : "Created from this reflection"}
                </span>
                {observation.published_observation_id != null
                  ? "Published when the reflection was completed."
                  : readOnly
                    ? "This carried item is locked with the completed reflection."
                    : "Published when the reflection is completed."}
              </p>
            </div>
          </CarryForwardEntryShell>
        );
      })}

      {!totalItems ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-5 text-center">
          <Lightbulb
            className="mx-auto size-5 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium">Nothing carried forward</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {readOnly
              ? "No facts or observations were published from this reflection."
              : "This step is optional. Add something only when you choose to."}
          </p>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        {readOnly ? null : (
          <div className="flex min-w-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-info/25 bg-info-muted/15 text-info hover:border-info/40 hover:bg-info-muted/30 hover:text-info"
              onClick={addFact}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add fact
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-success/25 bg-success-muted/15 text-success hover:border-success/40 hover:bg-success-muted/30 hover:text-success"
              onClick={addObservation}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add observation
            </Button>
          </div>
        )}
        <p className="min-w-0 text-xs leading-4 text-muted-foreground">
          {readOnly
            ? `${formatItemCount(totalItems)} carried forward with this reflection`
            : `${formatItemCount(totalItems)} to publish with this reflection`}
        </p>
      </div>
    </div>
  );
}

export function CarryForwardCountSummary({
  value,
}: {
  value: CarryForwardDrafts;
}) {
  const total = value.facts.length + value.observations.length;
  const labels = [
    value.facts.length
      ? `${value.facts.length} ${value.facts.length === 1 ? "fact" : "facts"}`
      : null,
    value.observations.length
      ? `${value.observations.length} ${value.observations.length === 1 ? "observation" : "observations"}`
      : null,
    `${total} ${total === 1 ? "item" : "items"}`,
  ].filter(Boolean);

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-1.5"
      aria-label={labels.join(", ")}
    >
      {labels.map((label, index) => (
        <span
          key={String(label)}
          className={cn(
            "inline-flex min-h-6 items-center rounded-full border px-2 text-[11px] font-medium",
            index === labels.length - 1
              ? "border-primary/20 bg-primary/5 text-primary"
              : "border-border bg-muted/25 text-muted-foreground",
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

type MarkerChoice = {
  id: ApiId | null;
  label: string;
  presentation: ObservationMarkerPresentation;
};

type MarkerChoiceFieldProps = {
  choices: MarkerChoice[];
  selectedId: ApiId | null | undefined;
  disabled: boolean;
  onChange: (markerId: ApiId | null) => void;
};

const PRIMARY_MARKER_KEYS = new Set<string>([
  "observationMarker.general",
  "observationMarker.important",
  "observationMarker.reminder",
]);

function MarkerChoiceField({
  choices,
  selectedId,
  disabled,
  onChange,
}: MarkerChoiceFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isSelected = (choice: MarkerChoice) =>
    choice.id == null
      ? selectedId == null
      : idsMatch(choice.id, selectedId ?? null);
  const isPrimary = (choice: MarkerChoice) =>
    choice.id == null || PRIMARY_MARKER_KEYS.has(choice.presentation.key);
  const selectedAdditional = choices.find(
    (choice) => isSelected(choice) && !isPrimary(choice),
  );
  const visibleChoices = [
    ...choices.filter(isPrimary),
    ...(selectedAdditional ? [selectedAdditional] : []),
  ];
  const overflowChoices = choices.filter(
    (choice) => !isPrimary(choice) && !isSelected(choice),
  );
  const normalizedSearch = search.trim().toLocaleLowerCase("en-US");
  const matchingChoices = overflowChoices.filter((choice) =>
    choice.label.toLocaleLowerCase("en-US").includes(normalizedSearch),
  );

  return (
    <fieldset className="min-w-0 space-y-1.5">
      <legend className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-sm font-medium">Marker</span>
        <span className="text-xs text-muted-foreground">Optional</span>
      </legend>
      <div className="grid min-w-0 grid-cols-2 gap-2 min-[1360px]:grid-cols-4">
        {visibleChoices.map((choice) => (
          <CarryForwardSemanticChoice
            key={choice.id == null ? "none" : String(choice.id)}
            label={choice.label}
            presentation={choice.presentation}
            selected={isSelected(choice)}
            disabled={disabled}
            onClick={() => onChange(choice.id)}
          />
        ))}
      </div>
      {overflowChoices.length ? (
        <Popover
          open={disabled ? false : pickerOpen}
          onOpenChange={(open) => {
            setPickerOpen(open);
            if (!open) setSearch("");
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="min-h-10 w-full justify-start border-dashed bg-card text-muted-foreground hover:border-primary/35 hover:bg-primary/5 hover:text-primary"
            >
              <Search className="size-4" aria-hidden="true" />
              Choose another marker
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            aria-label="Choose another marker"
            className="w-[min(24rem,calc(100vw-2rem))] gap-3 p-3"
          >
            <PopoverHeader>
              <PopoverTitle>Choose another marker</PopoverTitle>
              <PopoverDescription>
                Search custom markers without expanding this entry.
              </PopoverDescription>
            </PopoverHeader>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                className="h-10 pl-9"
                aria-label="Search markers"
                placeholder="Search markers"
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div
              role="list"
              aria-label="Custom marker results"
              className="max-h-64 space-y-1.5 overflow-y-auto"
            >
              {matchingChoices.length ? (
                matchingChoices.map((choice) => (
                  <div role="listitem" key={String(choice.id)}>
                    <CarryForwardSemanticChoice
                      label={choice.label}
                      presentation={choice.presentation}
                      selected={false}
                      onClick={() => {
                        onChange(choice.id);
                        setSearch("");
                        setPickerOpen(false);
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
                  No markers match this search.
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </fieldset>
  );
}

function buildMarkerChoices(
  markers: ObservationMarker[],
  selectedId: ApiId | null | undefined,
  resolvedMarker: ObservationMarker | null,
  lookupsPending: boolean,
): MarkerChoice[] {
  const choices: MarkerChoice[] = [
    {
      id: null,
      label: "No marker",
      presentation: getObservationMarkerPresentation(null),
    },
    ...markers.map((marker) => ({
      id: marker.id,
      label: marker.name,
      presentation: getObservationMarkerPresentation(marker),
    })),
  ];

  if (selectedId != null && resolvedMarker == null) {
    choices.push({
      id: selectedId,
      label: lookupsPending ? "Loading marker…" : "Unavailable marker",
      presentation: getObservationMarkerPresentation(null),
    });
  }

  return choices;
}

function withUnavailableOption(
  options: CarryForwardPickerOption[],
  currentValue: string,
  unavailableLabel: string,
) {
  if (
    !currentValue ||
    options.some((option) => option.value === currentValue)
  ) {
    return [...options];
  }

  return [{ value: currentValue, label: unavailableLabel }, ...options];
}

function isObservationType(
  value: unknown,
): value is NonNullable<CarryForwardObservationDraft["observation_type"]> {
  return OBSERVATION_TYPE_OPTIONS.some((option) => option.value === value);
}

function isObservationStatus(value: unknown): value is ObservationStatus {
  return OBSERVATION_STATUS_OPTIONS.some((option) => option.value === value);
}

function hasApiId(value: ApiId | null | undefined) {
  return value != null && value !== "";
}

function formatItemCount(total: number) {
  return `${total} ${total === 1 ? "item" : "items"}`;
}
