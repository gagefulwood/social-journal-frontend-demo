import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { ObservationStatusPresentation } from "@/lib/presentation/observationStatusPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type ObservationStatusTagProps = {
  presentation: ObservationStatusPresentation;
  className?: string;
};

export function ObservationStatusTag({
  presentation,
  className,
}: ObservationStatusTagProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <span
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.chip}
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium",
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        className,
      )}
    >
      {renderPresentationIcon(presentation.icon, {
        className: "size-3 shrink-0",
        "aria-hidden": true,
      })}
      {presentation.label}
    </span>
  );
}
