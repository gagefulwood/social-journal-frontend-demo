import type { ReactNode } from "react";

type ContactOverviewEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  copy: string;
};

export function ContactOverviewEmptyState({
  icon,
  title,
  copy,
}: ContactOverviewEmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-sm">
      {icon && (
        <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-background/80 text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground">{copy}</p>
    </div>
  );
}
