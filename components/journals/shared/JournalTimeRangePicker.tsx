"use client";

import { ArrowRight } from "lucide-react";

import { JournalDurationSummary } from "@/components/journals/shared/JournalDurationSummary";
import { JournalOccurrencePicker } from "@/components/journals/shared/JournalOccurrencePicker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type JournalTimeRangePickerProps = {
  startedAt: string;
  endedAt: string;
  ongoing: boolean;
  onStartedAtChange: (value: string) => void;
  onEndedAtChange: (value: string) => void;
  onOngoingChange: (value: boolean) => void;
  invalidRange?: boolean;
  startedError?: string;
  endedError?: string;
  className?: string;
};

export function JournalTimeRangePicker({
  startedAt,
  endedAt,
  ongoing,
  onStartedAtChange,
  onEndedAtChange,
  onOngoingChange,
  invalidRange = false,
  startedError,
  endedError,
  className,
}: JournalTimeRangePickerProps) {
  const ongoingId = "journal-episode-still-ongoing";

  return (
    <fieldset className={cn("min-w-0 space-y-3", className)}>
      <legend className="mb-2 text-sm font-semibold text-foreground">
        Timeframe
      </legend>
      <div className="grid min-w-0 items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)_minmax(10.5rem,auto)]">
        <JournalOccurrencePicker
          label="Started"
          value={startedAt}
          labelPosition="inside"
          layout="combined"
          required
          error={startedError}
          onChange={onStartedAtChange}
        />
        <span
          aria-hidden="true"
          className="flex min-h-8 items-center justify-center text-muted-foreground"
        >
          <ArrowRight className="size-5 rotate-90 md:rotate-0" />
        </span>
        <JournalOccurrencePicker
          label="Ended"
          value={endedAt}
          labelPosition="inside"
          layout="combined"
          disabled={ongoing}
          error={invalidRange ? "End must be after start." : endedError}
          onChange={onEndedAtChange}
        />
        <JournalDurationSummary
          startedAt={startedAt}
          endedAt={endedAt}
          ongoing={ongoing}
          invalid={invalidRange}
          className="md:col-span-3 xl:col-span-1"
        />
      </div>

      <div
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-lg border border-border/80 bg-card px-3 py-2.5 shadow-xs transition-colors",
          ongoing && "border-primary/35 bg-primary/5",
        )}
      >
        <Switch
          id={ongoingId}
          checked={ongoing}
          aria-describedby={`${ongoingId}-description`}
          onCheckedChange={onOngoingChange}
        />
        <span className="min-w-0 flex-1">
          <Label htmlFor={ongoingId} className="cursor-pointer">
            Still ongoing
          </Label>
          <span
            id={`${ongoingId}-description`}
            className="mt-1 block text-xs text-muted-foreground"
          >
            Leave the end time open and show this episode as in progress.
          </span>
        </span>
      </div>
    </fieldset>
  );
}
