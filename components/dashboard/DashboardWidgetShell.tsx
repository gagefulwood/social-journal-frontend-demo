"use client";

import type React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WidgetStateProps } from "@/components/dashboard/dashboard-utils";
import { cn } from "@/lib/utils";

type DashboardWidgetShellProps = WidgetStateProps & {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  skeletonClassName?: string;
};

export function DashboardWidgetShell({
  title,
  description,
  action,
  children,
  loading,
  error,
  onRetry,
  className,
  skeletonClassName,
}: DashboardWidgetShellProps) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>

      {loading ? (
        <Skeleton className={cn("h-40 w-full", skeletonClassName)} />
      ) : error ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm font-medium">Unable to load this widget.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 gap-2"
              onClick={onRetry}
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          )}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

type DashboardEmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function DashboardEmptyState({
  icon,
  title,
  description,
}: DashboardEmptyStateProps) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
      <div className="mb-3 rounded-full bg-background p-2 text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
