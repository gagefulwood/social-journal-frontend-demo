import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalReferenceCardProps = Omit<ComponentProps<"div">, "title"> & {
  title: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  metadata?: ReactNode;
  leading?: ReactNode;
  action?: ReactNode;
  href?: string;
  linkAriaLabel?: string;
};

export function JournalReferenceCard({
  title,
  eyebrow,
  description,
  metadata,
  leading,
  action,
  href,
  linkAriaLabel,
  className,
  ...props
}: JournalReferenceCardProps) {
  const titleContent = href ? (
    <Link
      href={href}
      aria-label={linkAriaLabel ?? `Open ${title}`}
      title={title}
      className="rounded-sm font-semibold text-foreground outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {title}
    </Link>
  ) : (
    <span title={title} className="font-semibold text-foreground">
      {title}
    </span>
  );

  return (
    <div
      data-slot="journal-reference-card"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-3 rounded-md border border-border/80 bg-muted/20 p-3",
        className,
      )}
      {...props}
    >
      {leading}
      <div className="min-w-0 flex-1 basis-48">
        {eyebrow && (
          <div className="mb-0.5 text-xs font-medium text-primary">
            {eyebrow}
          </div>
        )}
        <div className="line-clamp-2 text-sm leading-5">{titleContent}</div>
        {description && (
          <div className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">
            {description}
          </div>
        )}
        {metadata && (
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {metadata}
          </div>
        )}
      </div>
      {action && (
        <div className="min-w-0 basis-full sm:ml-auto sm:basis-auto">
          {action}
        </div>
      )}
    </div>
  );
}
