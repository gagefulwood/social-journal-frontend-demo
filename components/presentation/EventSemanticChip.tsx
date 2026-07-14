import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import type {
  EventContextKey,
  EventTierKey,
  SemanticPresentation,
} from "@/lib/presentation/types";
import { cn } from "@/lib/utils";

type EventSemanticChipProps = {
  presentation: SemanticPresentation<EventContextKey | EventTierKey>;
  size?: "compact" | "standard";
  className?: string;
};

const sizeClasses = {
  compact: "max-w-24 px-2 py-0.5 text-[11px]",
  standard: "px-2 py-1 text-xs",
} as const;

export function EventSemanticChip({
  presentation,
  size = "standard",
  className,
}: EventSemanticChipProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);
  const showIcon = presentation.variants.chip === "eventSemanticChip.tier";

  return (
    <span
      title={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.chip}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border font-medium ring-1",
        sizeClasses[size],
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        tokenClasses.emphasis,
        className,
      )}
    >
      {showIcon &&
        renderPresentationIcon(presentation.icon, {
          className: "size-3 shrink-0",
          "aria-hidden": true,
        })}
      <span className="truncate">{presentation.label}</span>
    </span>
  );
}
