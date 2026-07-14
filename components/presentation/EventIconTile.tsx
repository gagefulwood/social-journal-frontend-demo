import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import type {
  DerivedEventKindKey,
  EventContextKey,
  EventImpactKey,
  EventTierKey,
  InteractionModeKey,
  SemanticPresentation,
} from "@/lib/presentation/types";
import { cn } from "@/lib/utils";

type EventIconTilePresentation = SemanticPresentation<
  | DerivedEventKindKey
  | EventContextKey
  | EventImpactKey
  | EventTierKey
  | InteractionModeKey
>;

type EventIconTileProps = {
  presentation: EventIconTilePresentation;
  size?: "compact" | "standard";
  className?: string;
};

const sizeClasses = {
  compact: "size-6 rounded-md [&_svg]:size-3",
  standard: "size-10 rounded-md [&_svg]:size-5",
} as const;

export function EventIconTile({
  presentation,
  size = "standard",
  className,
}: EventIconTileProps) {
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
