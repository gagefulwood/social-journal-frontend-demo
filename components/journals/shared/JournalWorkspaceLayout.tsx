import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type JournalWorkspaceLayoutProps = ComponentProps<"div">;
type JournalWorkspaceMainProps = ComponentProps<"div">;
type JournalWorkspaceRailProps = ComponentProps<"aside"> & {
  children: ReactNode;
};

export function JournalWorkspaceLayout({
  className,
  ...props
}: JournalWorkspaceLayoutProps) {
  return (
    <div
      data-slot="journal-workspace-layout"
      className={cn(
        "grid w-full min-w-0 max-w-full grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start",
        className,
      )}
      {...props}
    />
  );
}

export function JournalWorkspaceMain({
  className,
  ...props
}: JournalWorkspaceMainProps) {
  return (
    <div
      data-slot="journal-workspace-main"
      className={cn("flex w-full min-w-0 flex-col gap-4", className)}
      {...props}
    />
  );
}

export function JournalWorkspaceRail({
  className,
  ...props
}: JournalWorkspaceRailProps) {
  return (
    <aside
      data-slot="journal-workspace-rail"
      className={cn(
        "grid w-full min-w-0 max-w-full gap-4 xl:sticky xl:top-4 xl:w-auto xl:self-start",
        className,
      )}
      {...props}
    />
  );
}
