import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyActionBoxProps = {
  icon?: ReactNode
  title: ReactNode
  copy?: ReactNode
  action?: ReactNode
  className?: string
}

function EmptyActionBox({
  icon,
  title,
  copy,
  action,
  className,
}: EmptyActionBoxProps) {
  return (
    <div
      data-slot="empty-action-box"
      className={cn(
        "rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm",
        className
      )}
    >
      {icon && <div className="mb-3">{icon}</div>}
      <p className="font-medium text-foreground">{title}</p>
      {copy && <div className="mt-1 text-muted-foreground">{copy}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export { EmptyActionBox }
