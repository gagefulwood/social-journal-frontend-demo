import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { ObservationPrimaryPresentation } from "@/lib/presentation/observationPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type ObservationIconTileProps = {
  presentation: ObservationPrimaryPresentation;
  size?: "compact" | "standard";
  className?: string;
};

const sizeClasses = {
  compact: "size-7 rounded-md [&_svg]:size-3.5",
  standard: "size-8 rounded-md [&_svg]:size-4",
} as const;

export function ObservationIconTile({
  presentation,
  size = "standard",
  className,
}: ObservationIconTileProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <span
      role="img"
      aria-label={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.iconTile}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border ring-1 shadow-sm [&_svg]:shrink-0",
        sizeClasses[size],
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        tokenClasses.emphasis,
        className,
      )}
    >
      {renderPresentationIcon(presentation.icon, { "aria-hidden": true })}
    </span>
  );
}
