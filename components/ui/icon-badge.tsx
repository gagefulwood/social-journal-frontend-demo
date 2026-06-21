import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type IconBadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "info"
  | "warning"
  | "destructive"
  | "rose"
  | "violet"
  | "teal"
  | "fuchsia"
  | "indigo"

type IconBadgeSize = "sm" | "md" | "lg"

type IconBadgeShape = "rounded" | "circle"

type IconBadgeProps = {
  tone?: IconBadgeTone
  size?: IconBadgeSize
  shape?: IconBadgeShape
  className?: string
  children: ReactNode
}

const toneClasses: Record<IconBadgeTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success-muted text-success",
  info: "bg-info-muted text-info",
  warning: "bg-warning-muted text-warning",
  destructive: "bg-destructive/10 text-destructive",
  rose: "bg-marker-rose text-marker-rose-foreground",
  violet: "bg-marker-violet text-marker-violet-foreground",
  teal: "bg-marker-teal text-marker-teal-foreground",
  fuchsia: "bg-marker-fuchsia text-marker-fuchsia-foreground",
  indigo: "bg-marker-indigo text-marker-indigo-foreground",
}

const sizeClasses: Record<IconBadgeSize, string> = {
  sm: "size-8 [&_svg:not([class*='size-'])]:size-4",
  md: "size-10 [&_svg:not([class*='size-'])]:size-5",
  lg: "size-11 [&_svg:not([class*='size-'])]:size-5",
}

const shapeClasses: Record<IconBadgeShape, string> = {
  rounded: "rounded-xl",
  circle: "rounded-full",
}

function IconBadge({
  tone = "neutral",
  size = "md",
  shape = "rounded",
  className,
  children,
}: IconBadgeProps) {
  return (
    <span
      data-slot="icon-badge"
      className={cn(
        "inline-flex shrink-0 items-center justify-center shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0",
        toneClasses[tone],
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
    >
      {children}
    </span>
  )
}

export { IconBadge }
