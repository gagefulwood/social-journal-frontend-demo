import { renderJournalPresentationIcon } from "@/components/presentation/journal-presentation-icons";
import {
  resolveJournalPresentationTokenClasses,
  type JournalIdentityPresentation,
} from "@/lib/presentation/journalPresentation";
import { cn } from "@/lib/utils";

type JournalSemanticChipProps = {
  presentation: JournalIdentityPresentation;
  size?: "compact" | "standard";
  showIcon?: boolean;
  className?: string;
};

const sizeClasses = {
  compact: "gap-1 px-1.5 py-0.5 text-[11px] [&_svg]:size-3",
  standard: "gap-1.5 px-2 py-1 text-xs [&_svg]:size-3.5",
} as const;

export function JournalSemanticChip({
  presentation,
  size = "standard",
  showIcon = true,
  className,
}: JournalSemanticChipProps) {
  const tokenClasses = resolveJournalPresentationTokenClasses(
    presentation.tokens,
  );

  return (
    <span
      title={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.chip}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center rounded-md border font-medium ring-1",
        sizeClasses[size],
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        tokenClasses.emphasis,
        className,
      )}
    >
      {showIcon &&
        renderJournalPresentationIcon(presentation.icon, {
          className: "shrink-0",
          "aria-hidden": true,
        })}
      <span className="truncate">{presentation.label}</span>
    </span>
  );
}
