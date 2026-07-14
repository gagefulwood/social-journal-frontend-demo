import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { ObservationPrimaryPresentation } from "@/lib/presentation/observationPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type ObservationTimelineNodeProps = {
  presentation: ObservationPrimaryPresentation;
  size?: "compact" | "standard";
  className?: string;
};

const sizeClasses = {
  compact: "size-7 [&_svg]:size-3.5",
  standard: "size-8 [&_svg]:size-4",
} as const;

export function ObservationTimelineNode({
  presentation,
  size = "compact",
  className,
}: ObservationTimelineNodeProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <span
      role="img"
      aria-label={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.timelineNode}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center justify-center rounded-full border ring-3 ring-card [&_svg]:shrink-0",
        sizeClasses[size],
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        className,
      )}
    >
      {renderPresentationIcon(presentation.icon, { "aria-hidden": true })}
    </span>
  );
}
