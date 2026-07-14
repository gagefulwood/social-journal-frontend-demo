import type { ComponentProps } from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

export type ContactHelperStackProps = ComponentProps<"div"> & {
  asChild?: boolean;
};

export function ContactHelperStack({
  asChild = false,
  className,
  ...props
}: ContactHelperStackProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="contact-helper-stack"
      className={cn(
        "grid min-h-0 min-w-0 max-w-full auto-rows-max content-start gap-4",
        className,
      )}
      {...props}
    />
  );
}
