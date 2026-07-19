import {
  Minus,
  Smile,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { moodPolarityToneClass } from "@/lib/presentation/moodPolarityPresentation";
import { cn } from "@/lib/utils";
import type { EventImpact, EventRelatedItem } from "@/types/events";

export function RelatedMomentSignal({ event }: { event: EventRelatedItem }) {
  if (event.mood) {
    return (
      <span
        className={cn(
          "hidden items-center gap-1.5 text-sm font-medium sm:inline-flex",
          moodPolarityToneClass(event.mood.polarity),
        )}
      >
        <Smile className="size-4" />
        {event.mood.name}
      </span>
    );
  }

  if (event.impact) {
    const impact = relatedImpactPresentation(event.impact);
    const Icon = impact.icon;

    return (
      <span
        className={cn(
          "hidden items-center gap-1.5 text-sm font-medium sm:inline-flex",
          impact.className,
        )}
      >
        <Icon className="size-4" />
        {impact.label}
      </span>
    );
  }

  return null;
}

function relatedImpactPresentation(
  impact: Exclude<EventImpact, "">,
): {
  className: string;
  icon: LucideIcon;
  label: string;
} {
  if (impact === "positive") {
    return {
      className: "text-success",
      icon: TrendingUp,
      label: "Positive",
    };
  }

  if (impact === "negative") {
    return {
      className: "text-destructive",
      icon: TrendingDown,
      label: "Negative",
    };
  }

  return {
    className: "text-muted-foreground",
    icon: Minus,
    label: "Neutral",
  };
}
