"use client";

import type { MouseEventHandler } from "react";
import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import type { JournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import { cn } from "@/lib/utils";

type JournalStateIndicatorBaseProps = {
  presentation: JournalStatePresentation;
  size?: "compact" | "standard";
  className?: string;
};

type JournalStateIndicatorProps = JournalStateIndicatorBaseProps &
  (
    | {
        interactive: true;
        onClick: MouseEventHandler<HTMLButtonElement>;
        disabled?: boolean;
      }
    | {
        interactive?: false;
        onClick?: never;
        disabled?: never;
      }
  );

const sizeClasses = {
  compact: "gap-1 text-[11px] [&_svg]:size-3.5",
  standard: "gap-1.5 text-xs [&_svg]:size-4",
} as const;

export function JournalStateIndicator({
  presentation,
  size = "standard",
  className,
  ...interactionProps
}: JournalStateIndicatorProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);
  const content = (
    <>
      {renderPresentationIcon(presentation.icon, { "aria-hidden": true })}
      <span aria-hidden="true">{presentation.label}</span>
    </>
  );
  const sharedClassName = cn(
    "inline-flex shrink-0 items-center font-medium",
    sizeClasses[size],
    tokenClasses.foreground,
    className,
  );

  if (interactionProps.interactive) {
    return (
      <button
        type="button"
        aria-label={presentation.accessibleLabel}
        data-presentation-key={presentation.key}
        data-presentation-variant={presentation.variants.indicator}
        disabled={interactionProps.disabled}
        onClick={interactionProps.onClick}
        className={cn(
          sharedClassName,
          "rounded-md border px-2 py-1 outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60",
          tokenClasses.surface,
          tokenClasses.border,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      aria-label={presentation.accessibleLabel}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.indicator}
      className={sharedClassName}
    >
      {content}
    </span>
  );
}
