import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventTier } from "@/types/events";
import type { ContextCategory } from "@/types/lookups";

type EventContextChipProps = {
  category: ContextCategory | null | undefined;
  compact?: boolean;
  fallbackLabel?: string | null;
  tier: EventTier;
};

type EventContextTone =
  | "milestone"
  | "neutral"
  | "peach"
  | "rose"
  | "sage"
  | "sky";

const toneClassNames: Record<EventContextTone, string> = {
  milestone: "bg-warning-muted text-warning ring-1 ring-warning/25",
  neutral: "bg-muted text-muted-foreground",
  peach: "bg-warning-muted text-warning",
  rose: "bg-marker-rose text-marker-rose-foreground",
  sage: "bg-marker-teal text-marker-teal-foreground",
  sky: "bg-marker-indigo text-marker-indigo-foreground",
};

export function EventContextChip({
  category,
  compact = false,
  fallbackLabel = "Uncategorized",
  tier,
}: EventContextChipProps) {
  const label =
    tier === "milestone" ? "Milestone" : category?.name || fallbackLabel;

  if (!label) {
    return <span className="sr-only">No context category recorded</span>;
  }

  const tone = getEventContextTone(category, tier);

  return (
    <span
      title={label}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        toneClassNames[tone],
        compact && "max-w-24 py-0.5 text-[11px]",
      )}
    >
      {tier === "milestone" && (
        <Star className="size-3 shrink-0" aria-hidden="true" />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}

function getEventContextTone(
  category: ContextCategory | null | undefined,
  tier: EventTier,
): EventContextTone {
  if (tier === "milestone") {
    return "milestone";
  }

  const meaning =
    `${category?.name ?? ""} ${category?.color ?? ""}`.toLowerCase();

  if (/(social|friend|community|#4a90d9|blue|sky)/.test(meaning)) {
    return "sky";
  }
  if (
    /(professional|work|career|business|school|study|office|#27ae60|green|sage|teal)/.test(
      meaning,
    )
  ) {
    return "sage";
  }
  if (/(family|#e67e22|orange|peach|yellow)/.test(meaning)) {
    return "peach";
  }
  if (/(personal|romance|partner|care|rose|pink)/.test(meaning)) {
    return "rose";
  }
  if (/(health|exercise|fitness|outdoor|walk|hike|run|sport)/.test(meaning)) {
    return "sage";
  }
  return "neutral";
}
