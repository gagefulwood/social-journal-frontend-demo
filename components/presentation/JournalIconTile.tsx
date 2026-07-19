import { renderJournalPresentationIcon } from "@/components/presentation/journal-presentation-icons";
import {
  resolveJournalPresentationTokenClasses,
  type JournalIdentityPresentation,
} from "@/lib/presentation/journalPresentation";
import { cn } from "@/lib/utils";

type JournalIconTileProps = {
  presentation: JournalIdentityPresentation;
  size?: "compact" | "standard";
  className?: string;
};

const sizeClasses = {
  compact: "size-8 rounded-md [&_svg]:size-4",
  standard: "size-10 rounded-md [&_svg]:size-5",
} as const;

export function JournalIconTile({
  presentation,
  size = "standard",
  className,
}: JournalIconTileProps) {
  const tokenClasses = resolveJournalPresentationTokenClasses(
    presentation.tokens,
  );

  return (
    <span
      role="img"
      aria-label={presentation.label}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.iconTile}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border ring-1 shadow-sm [&_svg]:shrink-0",
        sizeClasses[size],
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        tokenClasses.emphasis,
        className,
      )}
    >
      {renderJournalPresentationIcon(presentation.icon, {
        "aria-hidden": true,
      })}
    </span>
  );
}
