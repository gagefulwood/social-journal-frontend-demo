"use client";

import {
  AlertCircle,
  CheckCircle2,
  Circle,
  LoaderCircle,
  PencilLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type JournalDraftSaveState =
  | "pristine"
  | "unsaved"
  | "saving"
  | "saved"
  | "error";

type JournalDraftSaveStatusProps = {
  state: JournalDraftSaveState;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

const defaultMessages: Record<JournalDraftSaveState, string> = {
  pristine: "Draft starts after your first meaningful entry.",
  unsaved: "Unsaved changes",
  saving: "Saving draft…",
  saved: "Draft saved",
  error: "Draft not saved.",
};

export function JournalDraftSaveStatus({
  state,
  message,
  onRetry,
  className,
}: JournalDraftSaveStatusProps) {
  const Icon = {
    pristine: Circle,
    unsaved: PencilLine,
    saving: LoaderCircle,
    saved: CheckCircle2,
    error: AlertCircle,
  }[state];

  return (
    <div
      role={state === "error" ? "alert" : "status"}
      aria-live={state === "error" ? "assertive" : "polite"}
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground",
        state === "saved" && "text-success",
        state === "error" && "text-destructive",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          state === "saving" && "motion-safe:animate-spin",
        )}
      />
      <span className="min-w-0 break-words">
        {message ?? defaultMessages[state]}
      </span>
      {state === "error" && onRetry && (
        <Button
          type="button"
          variant="link"
          size="xs"
          className="h-auto shrink-0 px-1 py-0 text-destructive"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
}
