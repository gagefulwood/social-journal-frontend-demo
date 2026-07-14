import type { ComponentProps } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils";

export type ContactSectionCardDensity = "standard" | "compact" | "featured";

export type ContactSectionCardProps = ComponentProps<typeof SurfaceCard> & {
  density?: ContactSectionCardDensity;
};

const densityClasses: Record<ContactSectionCardDensity, string> = {
  standard: "p-4",
  compact: "p-3",
  featured: "p-5",
};

export function ContactSectionCard({
  className,
  density = "standard",
  ...props
}: ContactSectionCardProps) {
  return (
    <SurfaceCard
      data-slot="contact-section-card"
      data-density={density}
      className={cn("min-w-0 max-w-full", densityClasses[density], className)}
      {...props}
    />
  );
}
