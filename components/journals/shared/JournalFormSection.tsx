import type { ComponentProps } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils";

export type JournalFormSectionDensity = "standard" | "compact";

type JournalFormSectionProps = ComponentProps<"section"> & {
  density?: JournalFormSectionDensity;
};

const densityClasses: Record<JournalFormSectionDensity, string> = {
  standard: "p-4",
  compact: "p-3",
};

export function JournalFormSection({
  density = "standard",
  className,
  ...props
}: JournalFormSectionProps) {
  return (
    <SurfaceCard
      asChild
      className={cn("min-w-0", densityClasses[density], className)}
    >
      <section
        data-slot="journal-form-section"
        data-density={density}
        {...props}
      />
    </SurfaceCard>
  );
}
