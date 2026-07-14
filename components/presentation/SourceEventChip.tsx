import Link from "next/link";
import { renderPresentationIcon } from "@/components/presentation/presentation-icons";
import type { ObservationSourcePresentation } from "@/lib/presentation/observationPresentation";
import { resolvePresentationTokenClasses } from "@/lib/presentation/semanticTokens";
import { cn } from "@/lib/utils";

type SourceEventChipProps = {
  presentation: ObservationSourcePresentation;
  href: string;
  label: string;
  className?: string;
};

export function SourceEventChip({
  presentation,
  href,
  label,
  className,
}: SourceEventChipProps) {
  const tokenClasses = resolvePresentationTokenClasses(presentation.tokens);
  const title = `${presentation.label} · ${label}`;

  return (
    <Link
      href={href}
      title={title}
      data-presentation-key={presentation.key}
      data-presentation-variant={presentation.variants.chip}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-md border px-1.5 py-0.5 text-[11px] outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50",
        tokenClasses.surface,
        tokenClasses.foreground,
        tokenClasses.border,
        className,
      )}
    >
      {renderPresentationIcon(presentation.icon, {
        className: "size-3 shrink-0",
        "aria-hidden": true,
      })}
      <span className="shrink-0">{presentation.label} ·</span>
      <span className="min-w-0 truncate font-medium">{label}</span>
    </Link>
  );
}
