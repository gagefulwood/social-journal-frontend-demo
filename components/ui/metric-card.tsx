import type { ReactNode } from "react"

import { IconBadge } from "@/components/ui/icon-badge"
import { SurfaceCard } from "@/components/ui/surface-card"
import { cn } from "@/lib/utils"

type MetricTone = "success" | "info" | "warning" | "muted"

type MetricCardProps = {
  label: string
  value?: ReactNode
  detail?: ReactNode
  icon?: ReactNode
  tone?: MetricTone
  hero?: boolean
  children?: ReactNode
  className?: string
}

type MetricChipProps = {
  label: string
  eyebrow?: string
  icon?: ReactNode
  tone?: MetricTone
  className?: string
}

const iconTone: Record<MetricTone, "success" | "info" | "warning" | "neutral"> =
  {
    success: "success",
    info: "info",
    warning: "warning",
    muted: "neutral",
  }

const labelToneClasses: Record<MetricTone, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  muted: "text-muted-foreground",
}

const chipToneClasses: Record<MetricTone, string> = {
  success: "border-success-muted bg-success-muted text-success",
  info: "border-info-muted bg-info-muted text-info",
  warning: "border-warning-muted bg-warning-muted text-warning",
  muted: "border-border bg-muted text-muted-foreground",
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "muted",
  hero = false,
  children,
  className,
}: MetricCardProps) {
  return (
    <SurfaceCard
      hoverable
      className={cn(
        "flex min-w-0 flex-col p-4",
        hero ? "min-h-72 gap-5 border-accent p-5" : "min-h-56 gap-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <IconBadge tone={iconTone[tone]} shape="circle" size={hero ? "lg" : "md"}>
            {icon}
          </IconBadge>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-foreground">
            {label}
          </p>
          {value && (
            <div
              className={cn(
                "mt-1 font-semibold leading-none",
                hero ? "text-3xl" : "text-xl",
                labelToneClasses[tone]
              )}
            >
              {value}
            </div>
          )}
        </div>
      </div>
      {children && <div className="min-w-0 flex-1">{children}</div>}
      {detail && (
        <div className="text-sm leading-5 text-muted-foreground">{detail}</div>
      )}
    </SurfaceCard>
  )
}

function MetricChip({
  label,
  eyebrow,
  icon,
  tone = "muted",
  className,
}: MetricChipProps) {
  return (
    <div
      data-slot="metric-chip"
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
        chipToneClasses[tone],
        className
      )}
    >
      {icon && <span className="shrink-0 [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 truncate">{label}</span>
      {eyebrow && (
        <span className="shrink-0 text-xs font-normal opacity-75">
          {eyebrow}
        </span>
      )}
    </div>
  )
}

export { MetricCard, MetricChip }
