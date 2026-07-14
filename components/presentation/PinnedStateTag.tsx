import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { PinPresentation } from "@/lib/presentation/pinPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type PinnedStateTagProps = {
  presentation: PinPresentation;
  iconOnly?: boolean;
  className?: string;
};

export function PinnedStateTag({
  presentation,
  iconOnly = false,
  className,
}: PinnedStateTagProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <span
      aria-label={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant="pinnedStateTag.status"
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-1.5 text-[11px] font-medium",
        iconOnly && "size-6 justify-center px-0",
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        className,
      )}
    >
      {renderPresentationIcon(presentation.icon, {
        className: cn(
          "size-3",
          presentation.pressed && "fill-current",
          presentation.pending && "animate-spin motion-reduce:animate-none",
        ),
        "aria-hidden": true,
      })}
      {!iconOnly && <span aria-hidden="true">{presentation.label}</span>}
    </span>
  );
}
