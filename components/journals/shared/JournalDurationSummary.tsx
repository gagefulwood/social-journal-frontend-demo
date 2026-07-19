import { Clock3 } from "lucide-react";

import { getJournalDurationLabel } from "@/components/journals/shared/journalDateTimePresentation";
import { cn } from "@/lib/utils";

type JournalDurationSummaryProps = {
  startedAt: string;
  endedAt: string;
  ongoing: boolean;
  invalid?: boolean;
  className?: string;
};

export function JournalDurationSummary({
  startedAt,
  endedAt,
  ongoing,
  invalid = false,
  className,
}: JournalDurationSummaryProps) {
  const duration = getJournalDurationLabel({ startedAt, endedAt, ongoing });
  const value = invalid ? "Check timeframe" : (duration ?? "Set an end time");

  return (
    <div
      data-slot="journal-duration-summary"
      aria-live="polite"
      className={cn(
        "flex min-h-16 min-w-40 items-center gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-xs",
        invalid && "border-destructive/50 bg-destructive/5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-marker-violet text-marker-violet-foreground shadow-xs",
          invalid && "bg-destructive/10 text-destructive",
        )}
      >
        <Clock3 className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">
          Duration
        </span>
        <span
          className={cn(
            "mt-0.5 block text-sm font-semibold text-foreground",
            !duration && !invalid && "font-medium text-muted-foreground",
            invalid && "text-destructive",
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}
