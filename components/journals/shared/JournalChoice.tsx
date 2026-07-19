import { Check, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { LogFormOptionPresentation } from "@/lib/presentation/logFormOptionPresentation";

export type JournalChoiceIndicatorStyle =
  | "semantic"
  | "selection-circle"
  | "selected-check";

export function JournalChoiceChip({
  children,
  selected = false,
  disabled = false,
  addCustom = false,
  presentation,
  indicatorStyle = "semantic",
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  addCustom?: boolean;
  presentation?: LogFormOptionPresentation;
  indicatorStyle?: JournalChoiceIndicatorStyle;
  onClick: () => void;
}) {
  const OptionIcon = presentation?.icon;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={addCustom ? undefined : selected}
      className={cn(
        "inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        addCustom
          ? "border-dashed border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent/50 hover:text-foreground"
          : selected
            ? (presentation?.selectedClassName ??
              "border-primary/50 bg-accent text-foreground")
            : cn(
                presentation?.unselectedClassName ??
                  "border-border bg-card text-foreground",
                "hover:border-primary/30 hover:bg-muted/60",
              ),
      )}
      onClick={onClick}
    >
      {addCustom ? (
        <Plus className="size-4 shrink-0" />
      ) : indicatorStyle === "selection-circle" ? (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/70 text-muted-foreground",
          )}
        >
          <Check className="size-3" strokeWidth={2.5} />
        </span>
      ) : indicatorStyle === "selected-check" ? (
        selected ? (
          <span
            aria-hidden="true"
            className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Check className="size-3" strokeWidth={2.5} />
          </span>
        ) : null
      ) : OptionIcon ? (
        <OptionIcon
          aria-hidden="true"
          className={cn(
            "size-4.5 shrink-0",
            presentation.iconClassName,
            selected && presentation.tone === "neutral" && "text-primary",
          )}
        />
      ) : null}
      <span className="min-w-0 break-words text-left">{children}</span>
      {selected && indicatorStyle === "semantic" ? (
        <span
          className={cn(
            "ml-0.5 flex size-4 shrink-0 items-center justify-center rounded-full",
            presentation?.selectedCheckClassName ??
              "bg-primary text-primary-foreground",
          )}
        >
          <Check className="size-3" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}

export function JournalChoiceTile({
  children,
  selected = false,
  disabled = false,
  presentation,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  presentation?: LogFormOptionPresentation;
  onClick: () => void;
}) {
  const OptionIcon = presentation?.icon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-lg border p-3 text-left text-sm font-medium outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? (presentation?.selectedClassName ??
              "border-primary/50 bg-accent text-foreground")
          : cn(
              presentation?.unselectedClassName ??
                "border-border bg-card text-foreground",
              "hover:border-primary/30 hover:bg-muted/60",
            ),
      )}
      onClick={onClick}
    >
      {OptionIcon ? (
        <OptionIcon
          aria-hidden="true"
          className={cn(
            "size-6 shrink-0",
            presentation.iconClassName,
            selected && presentation.tone === "neutral" && "text-primary",
          )}
        />
      ) : null}
      <span className="min-w-0 flex-1">{children}</span>
      {selected ? (
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full",
            presentation?.selectedCheckClassName ??
              "bg-primary text-primary-foreground",
          )}
        >
          <Check className="size-3.5" strokeWidth={2.5} />
        </span>
      ) : null}
    </button>
  );
}
