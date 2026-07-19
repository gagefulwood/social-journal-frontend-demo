import { renderJournalPresentationIcon } from "@/components/presentation/journal-presentation-icons";
import {
  resolveJournalPresentationTokenClasses,
  type JournalStatusPresentation,
} from "@/lib/presentation/journalPresentation";
import { cn } from "@/lib/utils";

type JournalStatusIndicatorProps = {
  presentation: JournalStatusPresentation;
  size?: "compact" | "standard";
  className?: string;
};

const sizeClasses = {
  compact: "gap-1 text-[11px] [&_svg]:size-3.5",
  standard: "gap-1.5 text-xs [&_svg]:size-4",
} as const;

export function JournalStatusIndicator({
  presentation,
  size = "standard",
  className,
}: JournalStatusIndicatorProps) {
  const tokenClasses = resolveJournalPresentationTokenClasses(
    presentation.tokens,
  );

  return (
    <span
      aria-label={presentation.accessibleLabel}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.indicator}
      className={cn(
        "inline-flex shrink-0 items-center font-medium",
        sizeClasses[size],
        tokenClasses.foreground,
        className,
      )}
    >
      {renderJournalPresentationIcon(presentation.icon, {
        "aria-hidden": true,
      })}
      <span aria-hidden="true">{presentation.label}</span>
    </span>
  );
}
