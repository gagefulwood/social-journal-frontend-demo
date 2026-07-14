import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { ObservationPrimaryPresentation } from "@/lib/presentation/observationPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type ObservationTypeTagProps = {
  presentation: ObservationPrimaryPresentation;
  className?: string;
};

export function ObservationTypeTag({
  presentation,
  className,
}: ObservationTypeTagProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <span
      title={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.chip}
      className={cn(
        "inline-flex h-5 max-w-32 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium",
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
      <span className="truncate">{presentation.label}</span>
    </span>
  );
}
