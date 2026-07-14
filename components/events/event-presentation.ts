import {
  BriefcaseBusiness,
  CalendarDays,
  Coffee,
  Footprints,
  Gift,
  Heart,
  Star,
  UsersRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { IconBadgeTone } from "@/components/ui/icon-badge";
import type { EventTier } from "@/types/events";

type PresentableEvent = {
  context_category?: { name: string } | null;
  interaction_mode?: { name: string } | null;
  tier: EventTier;
  title: string;
};

export type EventPresentation = {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  tone: IconBadgeTone;
};

export function getEventPresentation(
  event: PresentableEvent,
): EventPresentation {
  const category = event.context_category?.name.trim().toLowerCase() ?? "";
  const mode = event.interaction_mode?.name.trim().toLowerCase() ?? "";
  const title = event.title.trim().toLowerCase();
  const meaning = `${title} ${category} ${mode}`;

  if (/(birthday|anniversary|celebration|holiday|gift)/.test(meaning)) {
    return {
      icon: Gift,
      iconClassName: "bg-marker-rose text-marker-rose-foreground",
      label: "Celebration or important date",
      tone: "rose",
    };
  }

  if (event.tier === "milestone") {
    return {
      icon: Star,
      iconClassName: "bg-warning-muted text-warning",
      label: "Milestone",
      tone: "warning",
    };
  }

  if (
    /(coffee|café|cafe|meal|lunch|dinner|breakfast|food|dining)/.test(meaning)
  ) {
    return {
      icon: Coffee,
      iconClassName: "bg-warning-muted text-warning",
      label: "Food or coffee context",
      tone: "warning",
    };
  }

  if (/(video|online|virtual|zoom|facetime|remote|call)/.test(meaning)) {
    return {
      icon: Video,
      iconClassName: "bg-marker-indigo text-marker-indigo-foreground",
      label: "Video or online interaction",
      tone: "indigo",
    };
  }

  if (
    /(outdoor|hike|walk|run|fitness|exercise|sport|trail|park)/.test(meaning)
  ) {
    return {
      icon: Footprints,
      iconClassName: "bg-marker-teal text-marker-teal-foreground",
      label: "Outdoor or activity context",
      tone: "teal",
    };
  }

  if (/(work|professional|school|study|career|office|team)/.test(meaning)) {
    return {
      icon: BriefcaseBusiness,
      iconClassName: "bg-marker-indigo text-marker-indigo-foreground",
      label: "Work or learning context",
      tone: "indigo",
    };
  }

  if (/(family|romance|partner|care)/.test(meaning)) {
    return {
      icon: Heart,
      iconClassName: "bg-marker-rose text-marker-rose-foreground",
      label: "Personal context",
      tone: "rose",
    };
  }

  if (
    /(social|friend|community|conversation|in person|catch-up|catch up)/.test(
      meaning,
    )
  ) {
    return {
      icon: UsersRound,
      iconClassName: "bg-marker-violet text-marker-violet-foreground",
      label: "Social context",
      tone: "violet",
    };
  }

  return {
    icon: CalendarDays,
    iconClassName: "bg-muted text-muted-foreground",
    label: event.context_category?.name || "Moment",
    tone: "neutral",
  };
}
