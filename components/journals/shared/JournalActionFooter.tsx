import type { ComponentProps, ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type JournalActionFooterProps = ComponentProps<"footer"> & {
  actions: ReactNode;
  saveStatus?: ReactNode;
  reassurance?: ReactNode;
  sticky?: boolean;
  actionsClassName?: string;
};

export function JournalActionFooter({
  actions,
  saveStatus,
  reassurance = "Your entries are private and only visible to you.",
  sticky = true,
  actionsClassName,
  className,
  ...props
}: JournalActionFooterProps) {
  return (
    <footer
      data-slot="journal-action-footer"
      className={cn(
        "relative z-20 flex min-w-0 flex-col gap-3 rounded-lg border border-border/80 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-sm md:flex-row md:items-center md:justify-between",
        sticky && "md:sticky md:bottom-3",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {saveStatus}
        {saveStatus && reassurance && (
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border sm:block"
          />
        )}
        {reassurance && (
          <p className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="break-words">{reassurance}</span>
          </p>
        )}
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center justify-end gap-2 sm:shrink-0",
          actionsClassName,
        )}
      >
        {actions}
      </div>
    </footer>
  );
}
