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
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm">
      {icon && (
        <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-card text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground">{copy}</p>
    </div>
  );
}
