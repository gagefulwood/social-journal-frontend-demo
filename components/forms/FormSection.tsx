import type { ComponentProps } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils";

export type FormSectionDensity = "standard" | "compact" | "entry";

type FormSectionProps = ComponentProps<"section"> & {
  density?: FormSectionDensity;
};

const densityClasses: Record<FormSectionDensity, string> = {
  standard: "p-4",
  compact: "p-3",
  entry: "p-3",
};

export function FormSection({
  density = "standard",
  className,
  ...props
}: FormSectionProps) {
  return (
    <SurfaceCard
      asChild
      className={cn(
        "min-w-0 rounded-xl border border-primary/15 bg-card shadow-sm",
        densityClasses[density],
        className,
      )}
    >
      <section data-slot="form-section" data-density={density} {...props} />
    </SurfaceCard>
  );
}
