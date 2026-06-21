import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type SurfaceCardProps = React.ComponentProps<"div"> & {
  asChild?: boolean
  hoverable?: boolean
}

function SurfaceCard({
  asChild = false,
  hoverable = false,
  className,
  ...props
}: SurfaceCardProps) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="surface-card"
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-sm",
        hoverable &&
          "transition-all duration-200 hover:border-border hover:bg-muted/20 hover:shadow-md",
        className
      )}
      {...props}
    />
  )
}

export { SurfaceCard }
