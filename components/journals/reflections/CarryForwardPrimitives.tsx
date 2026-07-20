"use client";

import { useId, type ReactNode } from "react";
import { Check, ChevronDown, Circle, LockKeyhole, Trash2 } from "lucide-react";

import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import type { SemanticPresentation } from "@/lib/presentation/types";
import { cn } from "@/lib/utils";

type CarryForwardEntryShellProps = {
  kind: "fact" | "observation";
  title: string;
  icon: ReactNode;
  badge: string;
  onRemove?: () => void;
  children: ReactNode;
};

export function CarryForwardEntryShell({
  kind,
  title,
  icon,
  badge,
  onRemove,
  children,
}: CarryForwardEntryShellProps) {
  const headingId = useId();

  return (
    <article
      aria-labelledby={headingId}
      data-carry-forward-kind={kind}
      className={cn(
        "min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-xs",
        kind === "fact" ? "border-info/20" : "border-success/20",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2.5 border-b border-border/65 pb-3">
        {icon}
        <h3
          id={headingId}
          className="min-w-0 flex-1 font-sans text-sm font-semibold break-words [overflow-wrap:anywhere]"
        >
          {title}
        </h3>
        <span
          className={cn(
            "inline-flex min-h-6 shrink-0 items-center rounded-full border px-2 text-[11px] font-semibold",
            badge === "Draft"
              ? "border-primary/20 bg-primary/5 text-primary"
              : badge === "Added to contact"
                ? "border-success/25 bg-success-muted text-success"
                : "border-border bg-muted/30 text-muted-foreground",
          )}
        >
          {badge}
        </span>
        {onRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${title.toLowerCase()}`}
            title={`Remove ${title.toLowerCase()}`}
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      {children}
    </article>
  );
}

export type CarryForwardPickerOption = {
  value: string;
  label: string;
};

type CarryForwardSemanticPickerProps = {
  label: string;
  helper: string;
  value: string;
  displayValue: string;
  options: CarryForwardPickerOption[];
  presentation?: SemanticPresentation;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

export function CarryForwardSemanticPicker({
  label,
  helper,
  value,
  displayValue,
  options,
  presentation,
  disabled = false,
  error,
  onChange,
}: CarryForwardSemanticPickerProps) {
  const selectId = useId();
  const helperId = useId();
  const errorId = useId();
  const tokenClasses = presentation
    ? resolvePresentationTokenClasses(presentation.tokens)
    : null;
  const describedBy = [helperId, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={selectId}>{label}</Label>
      <div
        className={cn(
          "relative flex min-h-14 min-w-0 items-center gap-3 rounded-lg border border-border bg-card px-2.5 py-2 shadow-xs outline-none transition-colors",
          "hover:border-primary/30 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          disabled && "cursor-not-allowed bg-muted/20",
          error && "border-destructive/45",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border ring-1 [&_svg]:size-4.5",
            tokenClasses
              ? [
                  tokenClasses.surface,
                  tokenClasses.foreground,
                  tokenClasses.border,
                  tokenClasses.emphasis,
                ]
              : "border-border bg-muted text-muted-foreground ring-border",
          )}
        >
          {presentation ? (
            renderPresentationIcon(presentation.icon, { "aria-hidden": true })
          ) : (
            <Circle aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs leading-4 text-muted-foreground">
            {helper}
          </span>
          <span
            className="block min-w-0 text-sm leading-5 font-semibold break-words [overflow-wrap:anywhere]"
            title={displayValue}
          >
            {displayValue}
          </span>
        </span>
        {disabled ? (
          <LockKeyhole
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        )}
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option
              key={`${option.value}-${option.label}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p id={helperId} className="sr-only">
        {helper}
      </p>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type CarryForwardSemanticChoiceProps = {
  label: string;
  selected: boolean;
  presentation: SemanticPresentation;
  disabled?: boolean;
  onClick: () => void;
};

export function CarryForwardSemanticChoice({
  label,
  selected,
  presentation,
  disabled = false,
  onClick,
}: CarryForwardSemanticChoiceProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "flex min-h-12 min-w-0 items-center gap-1 rounded-lg border px-1.5 py-2 text-left text-sm font-medium shadow-xs outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
        selected
          ? [
              tokenClasses.surface,
              tokenClasses.border,
              "ring-1",
              tokenClasses.emphasis,
            ]
          : "border-border bg-card hover:border-primary/30 hover:bg-muted/35",
      )}
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-7 shrink-0 items-center justify-center rounded-md border [&_svg]:size-3.5",
          tokenClasses.surface,
          tokenClasses.foreground,
          tokenClasses.border,
        )}
      >
        {renderPresentationIcon(presentation.icon, { "aria-hidden": true })}
      </span>
      <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
        {label}
      </span>
      {selected ? (
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border",
            tokenClasses.surface,
            tokenClasses.foreground,
            tokenClasses.border,
          )}
        >
          <Check className="size-3" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}
