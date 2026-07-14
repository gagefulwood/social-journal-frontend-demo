import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ContactContentStackProps = ComponentProps<"div">;

export function ContactContentStack({
  className,
  ...props
}: ContactContentStackProps) {
  return (
    <div
      data-slot="contact-content-stack"
      className={cn("flex min-h-0 min-w-0 flex-col gap-4", className)}
      {...props}
    />
  );
}
