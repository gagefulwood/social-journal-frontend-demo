import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type TimelineItemProps = {
  dateLabel?: ReactNode
  marker?: ReactNode
  children: ReactNode
  isLast?: boolean
  className?: string
}

function TimelineItem({
  dateLabel,
  marker,
  children,
  isLast = false,
  className,
}: TimelineItemProps) {
  return (
    <div
      data-slot="timeline-item"
      className={cn(
        "grid gap-2.5 sm:grid-cols-[4.5rem_2.5rem_minmax(0,1fr)]",
        className
      )}
    >
      <div className="hidden text-xs font-medium leading-4 text-muted-foreground sm:block sm:pt-2 sm:text-right">
        {dateLabel}
      </div>
      <div className="relative hidden justify-center sm:flex">
        {marker && (
          <>
            <span
              className={cn(
                "absolute top-0 h-[calc(100%+0.75rem)] w-px rounded-full bg-border",
                isLast && "h-8"
              )}
            />
            <div className="relative z-10 mt-0.5">{marker}</div>
          </>
        )}
      </div>
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 sm:hidden">
          {marker}
          {dateLabel && (
            <div className="text-xs font-medium leading-4 text-muted-foreground">
              {dateLabel}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export { TimelineItem }
