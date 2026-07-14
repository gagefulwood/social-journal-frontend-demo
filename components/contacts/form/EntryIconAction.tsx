"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type EntryIconActionProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "type" | "size" | "variant" | "aria-label"
> & {
  icon: LucideIcon;
  label: string;
  tone?: "default" | "destructive";
};

export function EntryIconAction({
  icon: Icon,
  label,
  tone = "default",
  className,
  ...props
}: EntryIconActionProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn(
              "text-muted-foreground",
              tone === "destructive" &&
                "text-destructive hover:bg-destructive/10 hover:text-destructive",
              className,
            )}
            {...props}
          >
            <Icon aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
