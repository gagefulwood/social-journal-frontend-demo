import type { ComponentPropsWithoutRef } from "react";
import type {
  ObservationStatusPresentation,
  ObservationStatusSurfaceVariant,
} from "@/lib/presentation/observationStatusPresentation";
import { resolveObservationSurfaceTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type ObservationStatusSurfaceProps = ComponentPropsWithoutRef<"article"> & {
  presentation: ObservationStatusPresentation;
  variant: ObservationStatusSurfaceVariant;
};

export function ObservationStatusSurface({
  presentation,
  variant,
  className,
  ...props
}: ObservationStatusSurfaceProps) {
  const tokenClasses = resolveObservationSurfaceTokenClasses(
    presentation.key,
    variant,
  );
  return (
    <article
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants[variant]}
      className={cn(tokenClasses.surface, tokenClasses.border, className)}
      {...props}
    />
  );
}
