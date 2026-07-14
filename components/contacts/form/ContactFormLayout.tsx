import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContactFormLayoutProps = ComponentProps<"div">;

type ContactFormMainProps = ComponentProps<"div">;

type ContactFormRailProps = ComponentProps<"aside"> & {
  children: ReactNode;
};

export function ContactFormLayout({
  className,
  ...props
}: ContactFormLayoutProps) {
  return (
    <div
      data-slot="contact-form-layout"
      className={cn(
        "grid w-full min-w-0 max-w-full grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start",
        className,
      )}
      {...props}
    />
  );
}

export function ContactFormMain({ className, ...props }: ContactFormMainProps) {
  return (
    <div
      data-slot="contact-form-main"
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
      {...props}
    />
  );
}

export function ContactFormRail({ className, ...props }: ContactFormRailProps) {
  return (
    <aside
      data-slot="contact-form-rail"
      className={cn(
        "grid w-full min-w-0 max-w-full gap-3 xl:sticky xl:top-4 xl:w-auto xl:self-start",
        className,
      )}
      {...props}
    />
  );
}
