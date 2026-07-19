import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { IconBadge, type IconBadgeTone } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

export type JournalFormSectionHeaderProps = {
  icon: LucideIcon;
  iconTone?: IconBadgeTone;
  iconSize?: "sm" | "md";
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  headingId?: string;
  className?: string;
};

export function JournalFormSectionHeader({
  icon: Icon,
  iconTone = "violet",
  iconSize = "sm",
  title,
  description,
  action,
  headingId,
  className,
}: JournalFormSectionHeaderProps) {
  const generatedId = useId();
  const resolvedHeadingId = headingId ?? `journal-section-${generatedId}`;

  return (
    <header
      data-slot="journal-form-section-header"
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-52 items-start gap-2.5">
        <IconBadge tone={iconTone} size={iconSize}>
          <Icon aria-hidden="true" />
        </IconBadge>
        <div className="min-w-0 space-y-0.5">
          <h2
            id={resolvedHeadingId}
            className="font-sans text-base leading-5 font-semibold break-words [overflow-wrap:anywhere]"
          >
            {title}
          </h2>
          {description && (
            <div className="text-sm leading-5 text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>
      {action && (
        <div className="min-w-0 basis-full sm:ml-auto sm:basis-auto">
          {action}
        </div>
      )}
    </header>
  );
}
