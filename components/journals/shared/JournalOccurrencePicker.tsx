"use client";

import { useId, useSyncExternalStore } from "react";
import { CalendarDays, ChevronDown, Clock3 } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  getJournalDateTimePresentation,
  getJournalRelativeDateLabel,
} from "@/components/journals/shared/journalDateTimePresentation";
import { cn } from "@/lib/utils";

type JournalOccurrencePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  labelPosition?: "above" | "inside";
  layout?: "combined" | "split";
  showRelativeLabel?: boolean;
  className?: string;
};

export function JournalOccurrencePicker({
  label,
  value,
  onChange,
  description,
  error,
  disabled = false,
  required = false,
  labelPosition = "above",
  layout = "split",
  showRelativeLabel = false,
  className,
}: JournalOccurrencePickerProps) {
  const generatedId = useId();
  const inputId = `journal-occurrence-${generatedId}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const presentation = getJournalDateTimePresentation(value);
  const relativeLabel = useSyncExternalStore(
    emptySubscribe,
    () => (showRelativeLabel ? getJournalRelativeDateLabel(value) : null),
    () => null,
  );
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  return (
    <div
      data-slot="journal-occurrence-picker"
      data-layout={layout}
      className={cn("min-w-0 space-y-1.5", className)}
    >
      {labelPosition === "above" ? (
        <div className="space-y-1">
          <Label htmlFor={inputId}>{label}</Label>
          {description ? (
            <p id={descriptionId} className="text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "group relative flex min-h-16 min-w-0 items-stretch overflow-hidden rounded-lg border border-border/80 bg-card shadow-xs transition-[border-color,box-shadow,background-color]",
          "hover:border-primary/35 hover:bg-muted/15 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
          disabled && "bg-muted/30 opacity-65",
          error && "border-destructive/60 ring-1 ring-destructive/15",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
          <span
            aria-hidden="true"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-marker-violet text-marker-violet-foreground shadow-xs"
          >
            <CalendarDays className="size-5" />
          </span>

          {layout === "combined" ? (
            <span className="min-w-0 flex-1">
              {labelPosition === "inside" ? (
                <span className="block text-xs font-medium text-muted-foreground">
                  {label}
                </span>
              ) : null}
              <span
                className={cn(
                  "mt-0.5 block min-w-0 text-sm font-semibold break-words text-foreground",
                  !presentation && "font-medium text-muted-foreground",
                )}
              >
                {presentation?.combined ?? "Choose date and time"}
              </span>
            </span>
          ) : (
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-nowrap">
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm font-semibold text-foreground",
                  !presentation && "font-medium text-muted-foreground",
                )}
              >
                {presentation?.date ?? "Choose date"}
              </span>
              <span className="hidden h-7 w-px shrink-0 bg-border/80 sm:block" />
              <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground">
                <Clock3 aria-hidden="true" className="size-4 text-primary" />
                {presentation?.time ?? "Add time"}
              </span>
              {relativeLabel ? (
                <span className="shrink-0 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
                  {relativeLabel}
                </span>
              ) : null}
            </span>
          )}
        </div>

        <span
          aria-hidden="true"
          className="flex w-12 shrink-0 items-center justify-center border-l border-border/70 text-muted-foreground transition-colors group-hover:text-primary"
        >
          <CalendarDays className="size-4" />
          <ChevronDown className="size-3.5" />
        </span>

        <input
          id={inputId}
          type="datetime-local"
          value={value}
          disabled={disabled}
          required={required}
          aria-label={label}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className="absolute inset-0 z-10 size-full cursor-pointer opacity-0 outline-none disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      {labelPosition === "inside" && description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function emptySubscribe() {
  return () => undefined;
}
