"use client";

import type { MouseEventHandler } from "react";
import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { PinPresentation } from "@/lib/presentation/pinPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type PinnedStateIndicatorProps = {
  presentation: PinPresentation;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function PinnedStateIndicator({
  presentation,
  onClick,
  className,
}: PinnedStateIndicatorProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <button
      type="button"
      aria-label={presentation.accessibleLabel}
      aria-pressed={presentation.pressed}
      title={presentation.accessibleLabel}
      disabled={presentation.pending}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.indicator}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md border outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-70 [&_svg]:size-3.5",
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        tokenClasses.emphasis,
        className,
      )}
    >
      {renderPresentationIcon(presentation.icon, {
        "aria-hidden": true,
        className: cn(
          presentation.pressed && "fill-current",
          presentation.pending && "animate-spin motion-reduce:animate-none",
        ),
      })}
    </button>
  );
}
