import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

function SectionHeader({
  title,
  description,
  icon,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-7">{title}</h2>
          {description && (
            <div className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 sm:pt-0.5">{action}</div>}
    </div>
  )
}

export { SectionHeader }
