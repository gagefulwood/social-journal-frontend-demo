"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, Plus, X } from "lucide-react";

import { idsMatch } from "@/components/contacts/contact-utils";
import { Button } from "@/components/ui/button";
import {
  JournalChoiceChip,
  JournalChoiceTile,
  type JournalChoiceIndicatorStyle,
} from "@/components/journals/shared/JournalChoice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { journalApi, type JournalLookupKind } from "@/lib/api/journalApi";
import {
  getLogFormOptionPresentation,
  type LogFormOptionPresentation,
} from "@/lib/presentation/logFormOptionPresentation";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { JournalLookupOption } from "@/types/journals";

export function JournalField({
  label,
  description,
  error,
  htmlFor,
  descriptionId,
  errorId,
  children,
}: {
  label: string;
  description?: string;
  error?: string;
  htmlFor?: string;
  descriptionId?: string;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function JournalSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        props.className,
      )}
    />
  );
}

export function JournalValuePicker({
  label,
  value,
  options,
  presentation,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<readonly [string, string]>;
  presentation?: LogFormOptionPresentation;
  onChange: (value: string) => void;
}) {
  const selectId = useId();
  const OptionIcon = presentation?.icon;

  return (
    <JournalField label={label} htmlFor={selectId}>
      <div className="relative">
        {OptionIcon ? (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg",
              presentation.iconTileClassName,
            )}
          >
            <OptionIcon className="size-5" />
          </span>
        ) : null}
        <JournalSelect
          id={selectId}
          value={value}
          className={cn(
            "h-12 appearance-none border-border bg-card pr-10 font-semibold shadow-xs hover:border-primary/30",
            OptionIcon ? "pl-14" : null,
          )}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Choose an option</option>
          {options.map(([optionValue, optionLabel]) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </JournalSelect>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </JournalField>
  );
}

export function LookupTagSelector({
  kind,
  value,
  onChange,
  multiple = true,
  allowCustom = kind !== "episode-categories",
  label,
  presentation = "default",
  addLabel = "Add your own",
  hideLabel = false,
  indicatorStyle = "semantic",
  addActionPlacement = "inline",
  collapsibleAfter,
  onSelectedOptionChange,
}: {
  kind: JournalLookupKind;
  value: ApiId | ApiId[] | null;
  onChange: (value: ApiId | ApiId[] | null) => void;
  multiple?: boolean;
  allowCustom?: boolean;
  label: string;
  presentation?: "default" | "chips" | "tiles";
  addLabel?: string;
  hideLabel?: boolean;
  indicatorStyle?: JournalChoiceIndicatorStyle;
  addActionPlacement?: "inline" | "after";
  collapsibleAfter?: number;
  onSelectedOptionChange?: (option: JournalLookupOption | null) => void;
}) {
  const selectedIds = useMemo(
    () => (Array.isArray(value) ? value : value == null ? [] : [value]),
    [value],
  );
  const [options, setOptions] = useState<JournalLookupOption[]>([]);
  const [customName, setCustomName] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [loadedKind, setLoadedKind] = useState<JournalLookupKind | null>(null);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const loading = loadedKind !== kind;
  const collapseLimit = collapsibleAfter ?? Number.POSITIVE_INFINITY;
  const canCollapse =
    presentation === "chips" && options.length > collapseLimit;
  const visibleOptions =
    canCollapse && !expanded
      ? options.filter(
          (option, index) =>
            index < collapseLimit ||
            selectedIds.some((id) => idsMatch(id, option.id)),
        )
      : options;
  const selectedSingleOption =
    !multiple && selectedIds.length
      ? (options.find((option) =>
          selectedIds.some((id) => idsMatch(id, option.id)),
        ) ?? null)
      : null;

  useEffect(() => {
    onSelectedOptionChange?.(selectedSingleOption);
  }, [onSelectedOptionChange, selectedSingleOption]);

  useEffect(() => {
    const controller = new AbortController();
    void journalApi
      .listLookups(kind, { signal: controller.signal })
      .then(setOptions)
      .finally(() => {
        if (!controller.signal.aborted) setLoadedKind(kind);
      });
    return () => controller.abort();
  }, [kind]);

  function toggle(id: ApiId) {
    const isSelected = selectedIds.some((item) => idsMatch(item, id));
    if (!multiple) {
      onChange(isSelected ? null : id);
      return;
    }
    const next = isSelected
      ? selectedIds.filter((item) => !idsMatch(item, id))
      : [...selectedIds, id];
    onChange(next.length ? next : null);
  }

  function cancelCustom() {
    setCustomName("");
    setCustomOpen(false);
  }

  async function createCustom() {
    const name = customName.trim();
    if (!name || !allowCustom || kind === "episode-categories") return;
    setCreating(true);
    try {
      const option = await journalApi.createLookup(kind, { name });
      setOptions((current) => [...current, option]);
      setCustomName("");
      setCustomOpen(false);
      if (multiple) {
        onChange([...selectedIds, option.id]);
      } else {
        onChange(option.id);
      }
    } finally {
      setCreating(false);
    }
  }

  function customEditor() {
    if (!allowCustom) return null;
    if (!customOpen) {
      return (
        <JournalChoiceChip addCustom onClick={() => setCustomOpen(true)}>
          {addLabel}
        </JournalChoiceChip>
      );
    }

    return (
      <div className="flex min-w-[min(100%,20rem)] flex-1 flex-wrap items-center gap-2">
        <Input
          autoFocus
          value={customName}
          aria-label={addLabel}
          placeholder="Enter a custom value"
          className="min-h-9 min-w-0 basis-full sm:min-w-44 sm:flex-1"
          onChange={(event) => setCustomName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void createCustom();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancelCustom();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={creating || !customName.trim()}
          onClick={() => void createCustom()}
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={creating}
          onClick={cancelCustom}
        >
          <X className="size-4" />
          Cancel
        </Button>
      </div>
    );
  }

  function optionPresentation(
    option: JournalLookupOption,
  ): LogFormOptionPresentation {
    const fromName = getLogFormOptionPresentation(kind, option.name);
    if (fromName.source === "curated") return fromName;

    const fromCode = getLogFormOptionPresentation(kind, option.code);
    return fromCode.source === "curated" ? fromCode : fromName;
  }

  if (presentation === "tiles") {
    return (
      <fieldset className={cn(!hideLabel && "space-y-2")}>
        <legend className={cn("text-sm font-medium", hideLabel && "sr-only")}>
          {label}
        </legend>
        <div
          role="group"
          aria-label={label}
          className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {loading ? (
            <p className="col-span-full flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading options...
            </p>
          ) : (
            options.map((option) => {
              const selectedOption = selectedIds.some((id) =>
                idsMatch(id, option.id),
              );
              return (
                <JournalChoiceTile
                  key={option.id}
                  selected={selectedOption}
                  presentation={optionPresentation(option)}
                  onClick={() => toggle(option.id)}
                >
                  {option.name}
                </JournalChoiceTile>
              );
            })
          )}
        </div>
      </fieldset>
    );
  }

  if (presentation === "chips") {
    return (
      <fieldset className={cn(!hideLabel && "space-y-2")}>
        <legend className={cn("text-sm font-medium", hideLabel && "sr-only")}>
          {label}
        </legend>
        <div className="rounded-lg border border-border bg-card p-3">
          {loading ? (
            <p className="flex min-h-9 items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading options...
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {visibleOptions.map((option) => {
                const selectedOption = selectedIds.some((id) =>
                  idsMatch(id, option.id),
                );
                return (
                  <JournalChoiceChip
                    key={option.id}
                    selected={selectedOption}
                    presentation={optionPresentation(option)}
                    indicatorStyle={indicatorStyle}
                    onClick={() => toggle(option.id)}
                  >
                    {option.name}
                  </JournalChoiceChip>
                );
              })}
              {canCollapse ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((current) => !current)}
                >
                  {expanded ? "Show less" : "Show more"}
                </Button>
              ) : null}
              {addActionPlacement === "inline" ? customEditor() : null}
            </div>
          )}
        </div>
        {addActionPlacement === "after" ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {customEditor()}
          </div>
        ) : null}
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="max-h-64 overflow-y-auto rounded-md border border-border p-2">
        {loading ? (
          <p className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading options...
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => {
              const selectedOption = selectedIds.some((id) =>
                idsMatch(id, option.id),
              );
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selectedOption}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedOption
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-muted",
                  )}
                  onClick={() => toggle(option.id)}
                >
                  {selectedOption ? <Check className="size-3.5" /> : null}
                  {option.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {allowCustom ? (
        <div className="flex gap-2">
          <Input
            value={customName}
            aria-label={`Add custom ${label.toLowerCase()}`}
            placeholder="Add your own"
            onChange={(event) => setCustomName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void createCustom();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={creating || !customName.trim()}
            onClick={() => void createCustom()}
          >
            {creating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}
