"use client";

import { ChevronDown } from "lucide-react";
import { FactCategoryIconTile } from "@/components/presentation/FactCategoryIconTile";
import { Button } from "@/components/ui/button";
import type { FactCategoryPresentation } from "@/lib/presentation/factPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type FactCategoryHeaderProps = {
  contentId: string;
  count: number;
  expanded: boolean;
  presentation: FactCategoryPresentation;
  onToggle: () => void;
};

export function FactCategoryHeader({
  contentId,
  count,
  expanded,
  presentation,
  onToggle,
}: FactCategoryHeaderProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);

  return (
    <header
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.header}
      className={cn("border-b", tokenClasses.surface, tokenClasses.border)}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-full justify-between px-2.5 text-left hover:bg-transparent aria-expanded:bg-transparent aria-expanded:text-inherit"
        aria-controls={contentId}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${presentation.label} facts`}
        onClick={onToggle}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FactCategoryIconTile
            presentation={presentation}
            size="compact"
            className="shadow-none"
          />
          <span
            title={presentation.label}
            className="truncate text-xs font-semibold"
          >
            {presentation.label}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {count > 1 && (
            <span
              data-presentation-variant={presentation.variants.count}
              className={cn(
                "rounded-full border px-1.5 py-0.5 text-[11px] font-medium",
                tokenClasses.surface,
                tokenClasses.foreground,
                tokenClasses.border,
              )}
            >
              {count} facts
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform motion-reduce:transition-none",
              !expanded && "-rotate-90",
              tokenClasses.foreground,
            )}
            aria-hidden="true"
          />
        </span>
      </Button>
    </header>
  );
}
