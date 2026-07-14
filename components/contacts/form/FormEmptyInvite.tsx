import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormEmptyInviteProps = {
  summary: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function FormEmptyInvite({
  summary,
  actions,
  className,
}: FormEmptyInviteProps) {
  return (
    <div
      data-slot="form-empty-invite"
      className={cn(
        "flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-[10px] border border-border/70 bg-background/40 p-3",
        className,
      )}
    >
      <p className="min-w-0 text-sm leading-5 text-muted-foreground">
        {summary}
      </p>
      {actions && (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
