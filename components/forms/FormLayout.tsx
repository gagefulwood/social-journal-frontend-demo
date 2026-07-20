import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormLayoutProps = ComponentProps<"div">;

type FormMainProps = ComponentProps<"div">;

type FormRailProps = ComponentProps<"aside"> & {
  children: ReactNode;
};

export function FormLayout({ className, ...props }: FormLayoutProps) {
  return (
    <div
      data-slot="form-layout"
      className={cn(
        "grid w-full min-w-0 max-w-full grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start",
        className,
      )}
      {...props}
    />
  );
}

export function FormMain({ className, ...props }: FormMainProps) {
  return (
    <div
      data-slot="form-main"
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      {...props}
    />
  );
}

export function FormRail({ className, ...props }: FormRailProps) {
  return (
    <aside
      data-slot="form-rail"
      className={cn(
        "grid w-full min-w-0 max-w-full gap-3 xl:sticky xl:top-4 xl:w-auto xl:self-start",
        className,
      )}
      {...props}
    />
  );
}
