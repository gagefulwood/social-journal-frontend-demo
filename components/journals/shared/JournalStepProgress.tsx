"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type JournalStepState =
  | "completed"
  | "current"
  | "upcoming"
  | "optional";

export type JournalStep = {
  id: string;
  label: string;
  state: JournalStepState;
  description?: string;
  canNavigate?: boolean;
};

type JournalStepProgressProps = {
  steps: JournalStep[];
  onStepChange?: (stepId: string) => void;
  ariaLabel?: string;
  className?: string;
};

const stateLabel: Record<JournalStepState, string> = {
  completed: "Complete",
  current: "In progress",
  upcoming: "Not started",
  optional: "Optional",
};

export function JournalStepProgress({
  steps,
  onStepChange,
  ariaLabel = "Reflection progress",
  className,
}: JournalStepProgressProps) {
  if (steps.length === 0) {
    return null;
  }

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.state === "current"),
  );
  const currentStep = steps[currentIndex];
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <nav aria-label={ariaLabel} className={cn("min-w-0", className)}>
      <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm md:hidden">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">
              Step {currentIndex + 1} of {steps.length}
            </p>
            <p className="mt-0.5 font-sans text-base font-semibold break-words">
              {currentStep.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {currentStep.description ?? stateLabel[currentStep.state]}
            </p>
          </div>
          <span
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            aria-hidden="true"
          >
            {currentIndex + 1}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`${currentStep.label}, step ${currentIndex + 1} of ${steps.length}`}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={currentIndex + 1}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ol className="hidden min-w-0 md:flex">
        {steps.map((step, index) => {
          const isNavigable = Boolean(onStepChange && step.canNavigate);
          const marker = (
            <>
              {step.state === "completed" ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">{index + 1}</span>
              )}
              <span className="sr-only">{stateLabel[step.state]}</span>
            </>
          );
          const markerClassName = cn(
            "relative z-10 inline-flex size-8 items-center justify-center rounded-full border bg-card text-xs font-semibold outline-none",
            step.state === "completed" &&
              "border-success bg-success-muted text-success",
            step.state === "current" &&
              "border-primary bg-primary text-primary-foreground ring-2 ring-primary/15",
            (step.state === "upcoming" || step.state === "optional") &&
              "border-border text-muted-foreground",
            isNavigable &&
              "transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50",
          );

          return (
            <li
              key={step.id}
              className="relative flex min-w-0 flex-1 flex-col items-center px-1 text-center"
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-4 right-1/2 h-px w-full bg-border",
                    step.state === "completed" && "bg-success/45",
                    step.state === "current" && "bg-primary/45",
                  )}
                />
              )}
              {isNavigable ? (
                <button
                  type="button"
                  aria-current={step.state === "current" ? "step" : undefined}
                  aria-label={`${step.label}, ${stateLabel[step.state]}`}
                  className={markerClassName}
                  onClick={() => onStepChange?.(step.id)}
                >
                  {marker}
                </button>
              ) : (
                <span
                  aria-current={step.state === "current" ? "step" : undefined}
                  className={markerClassName}
                >
                  {marker}
                </span>
              )}
              <span
                className={cn(
                  "mt-2 max-w-full text-xs font-medium break-words",
                  step.state === "current" ? "text-primary" : "text-foreground",
                )}
              >
                {step.label}
              </span>
              <span className="mt-0.5 max-w-full text-[11px] break-words text-muted-foreground">
                {step.description ?? stateLabel[step.state]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
