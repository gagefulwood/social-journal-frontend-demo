import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RepeatableEntryShellProps = {
  icon?: LucideIcon;
  label: ReactNode;
  primaryStatus?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function RepeatableEntryShell({
  icon: Icon,
  label,
  primaryStatus,
  actions,
  children,
  className,
}: RepeatableEntryShellProps) {
  return (
    <div
      data-slot="repeatable-entry-shell"
      className={cn(
        "min-w-0 rounded-[10px] border border-border/70 bg-background/50 p-3",
        className,
      )}
    >
      <div className="mb-3 flex min-w-0 items-center gap-2">
        {Icon && (
          <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="min-w-0 text-sm font-medium break-words [overflow-wrap:anywhere]">
            {label}
          </div>
          {primaryStatus}
        </div>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-1">
            {actions}
          </div>
        )}
      </div>
      <div className="grid min-w-0 gap-3">{children}</div>
    </div>
  );
}
