import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { IconBadge, type IconBadgeTone } from "@/components/ui/icon-badge";
import { cn } from "@/lib/utils";

export type ContactSectionHeaderProps = {
  icon?: LucideIcon;
  iconTone?: IconBadgeTone;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  headingId?: string;
  className?: string;
};

export function ContactSectionHeader({
  icon: Icon,
  iconTone = "violet",
  title,
  subtitle,
  action,
  headingId,
  className,
}: ContactSectionHeaderProps) {
  return (
    <header
      data-slot="contact-section-header"
      aria-labelledby={headingId}
      className={cn(
        "flex min-w-0 flex-wrap items-start justify-between gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 basis-48 items-start gap-2.5">
        {Icon && (
          <IconBadge tone={iconTone} size="sm">
            <Icon aria-hidden="true" />
          </IconBadge>
        )}
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-sans text-base leading-6 font-semibold break-words [overflow-wrap:anywhere]"
          >
            {title}
          </h2>
          {subtitle && (
            <div className="mt-0.5 text-xs leading-4 text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </header>
  );
}
