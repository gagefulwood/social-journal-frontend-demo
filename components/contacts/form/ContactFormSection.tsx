import type { ComponentProps } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils";

export type ContactFormSectionDensity = "standard" | "compact" | "entry";

type ContactFormSectionProps = ComponentProps<"section"> & {
  density?: ContactFormSectionDensity;
};

const densityClasses: Record<ContactFormSectionDensity, string> = {
  standard: "p-4",
  compact: "p-3",
  entry: "p-3",
};

export function ContactFormSection({
  density = "standard",
  className,
  ...props
}: ContactFormSectionProps) {
  return (
    <SurfaceCard
      asChild
      className={cn(
        "min-w-0 rounded-xl border border-primary/15 bg-card shadow-sm",
        densityClasses[density],
        className,
      )}
    >
      <section
        data-slot="contact-form-section"
        data-density={density}
        {...props}
      />
    </SurfaceCard>
  );
}
