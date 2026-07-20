import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IconBadge, type IconBadgeTone } from "@/components/ui/icon-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/utils";

export type ContactTabHeaderProps = {
  actions?: ReactNode;
  className?: string;
  controls?: ReactNode;
  headingId: string;
  icon: LucideIcon;
  iconTone?: IconBadgeTone;
  metadata?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function ContactTabHeader({
  actions,
  className,
  controls,
  headingId,
  icon: Icon,
  iconTone = "violet",
  metadata,
  subtitle,
  title,
}: ContactTabHeaderProps) {
  const hasUtilityRail = Boolean(metadata || controls || actions);

  return (
    <SurfaceCard
      asChild
      className={cn(
        "min-w-0 max-w-full shrink-0 px-4 py-3 xl:min-h-[82px]",
        className,
      )}
    >
      <header
        aria-labelledby={headingId}
        className="flex min-h-14 items-center"
      >
        <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <div className="flex min-w-0 basis-auto items-center gap-3 xl:min-w-64 xl:flex-1 xl:basis-64">
            <IconBadge tone={iconTone} size="md">
              <Icon aria-hidden="true" />
            </IconBadge>
            <div className="min-w-0">
              <h2
                id={headingId}
                className="font-sans text-xl font-semibold leading-7 break-words [overflow-wrap:anywhere]"
              >
                {title}
              </h2>
              {subtitle && (
                <div className="mt-0.5 text-sm leading-5 text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {hasUtilityRail && (
            <div className="flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 xl:ml-auto xl:w-auto xl:max-w-full xl:flex-none xl:justify-end">
              {metadata}
              {controls}
              {actions}
            </div>
          )}
        </div>
      </header>
    </SurfaceCard>
  );
}
