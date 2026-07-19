import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalSelectedContextSummaryProps = {
  children: ReactNode;
  actions: ReactNode;
  ariaLabel: string;
  className?: string;
};

export function JournalSelectedContextSummary({
  children,
  actions,
  ariaLabel,
  className,
}: JournalSelectedContextSummaryProps) {
  return (
    <div
      data-slot="journal-selected-context-summary"
      role="group"
      aria-label={ariaLabel}
      className={cn("min-w-0 space-y-2", className)}
    >
      <div className="min-w-0 space-y-1.5">{children}</div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
