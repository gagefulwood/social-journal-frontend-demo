import type { ComponentProps, ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormAddActionProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "type" | "variant" | "size"
> & {
  children: ReactNode;
};

export function FormAddAction({
  children,
  className,
  ...props
}: FormAddActionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-8", className)}
      {...props}
    >
      <Plus aria-hidden="true" />
      {children}
    </Button>
  );
}
