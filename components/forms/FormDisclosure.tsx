"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import {
  FormSection,
  type FormSectionDensity,
} from "@/components/forms/FormSection";
import { IconBadge, type IconBadgeTone } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

type FormDisclosureProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  iconTone?: IconBadgeTone;
  density?: FormSectionDensity;
  children: ReactNode;
  collapsedContent?: ReactNode;
  collapsedSummary?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hasErrors?: boolean;
  errorSummary?: ReactNode;
  headingId?: string;
  panelId?: string;
  className?: string;
};

export function FormDisclosure({
  title,
  description,
  icon: Icon,
  iconTone = "violet",
  density = "compact",
  children,
  collapsedContent,
  collapsedSummary,
  defaultOpen = false,
  open,
  onOpenChange,
  hasErrors = false,
  errorSummary,
  headingId,
  panelId,
  className,
}: FormDisclosureProps) {
  const generatedId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedHeadingId =
    headingId ?? `form-disclosure-heading-${generatedId}`;
  const resolvedPanelId = panelId ?? `form-disclosure-panel-${generatedId}`;
  const isOpen = hasErrors || (open ?? uncontrolledOpen);
  const supportingCopy = isOpen
    ? description
    : (collapsedSummary ?? description);

  function handleToggle() {
    const nextOpen = hasErrors ? true : !isOpen;
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }

  return (
    <FormSection
      density={density}
      className={cn("p-0", className)}
      data-slot="form-disclosure"
      data-state={isOpen ? "open" : "closed"}
      aria-labelledby={resolvedHeadingId}
    >
      <h2 id={resolvedHeadingId}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={resolvedPanelId}
          onClick={handleToggle}
          className={cn(
            "flex min-h-12 w-full min-w-0 items-start justify-between gap-3 rounded-xl text-left font-sans outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            density === "standard" ? "px-4 py-3.5" : "px-3 py-2.5",
          )}
        >
          <span className="flex min-w-0 items-start gap-2.5">
            {Icon && (
              <IconBadge tone={iconTone} size="sm">
                <Icon aria-hidden="true" />
              </IconBadge>
            )}
            <span className="min-w-0 pt-0.5">
              <span className="block text-base leading-5 font-semibold break-words">
                {title}
              </span>
              {supportingCopy && (
                <span className="mt-0.5 block text-sm leading-5 break-words text-muted-foreground [overflow-wrap:anywhere]">
                  {supportingCopy}
                </span>
              )}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "mt-2 size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </h2>
      {isOpen ? (
        <div
          id={resolvedPanelId}
          role="region"
          aria-labelledby={resolvedHeadingId}
          className={cn(
            "border-t border-border/70",
            density === "standard" ? "px-4 pt-3 pb-4" : "p-3",
          )}
        >
          {hasErrors && errorSummary && (
            <div role="alert" className="mb-3 text-sm text-destructive">
              {errorSummary}
            </div>
          )}
          {children}
        </div>
      ) : (
        collapsedContent && (
          <div
            id={resolvedPanelId}
            role="region"
            aria-labelledby={resolvedHeadingId}
            className={density === "standard" ? "px-4 pb-4" : "px-3 pb-3"}
          >
            {collapsedContent}
          </div>
        )
      )}
    </FormSection>
  );
}
