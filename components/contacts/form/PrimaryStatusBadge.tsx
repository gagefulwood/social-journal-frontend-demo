import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type PrimaryStatusBadgeProps = ComponentProps<"span">;

export function PrimaryStatusBadge({
  className,
  children = "Primary",
  ...props
}: PrimaryStatusBadgeProps) {
  return (
    <span
      data-slot="primary-status-badge"
      className={cn(
        "inline-flex min-h-5 items-center rounded-full border border-primary/20 bg-accent/70 px-2 text-xs leading-4 font-medium text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
