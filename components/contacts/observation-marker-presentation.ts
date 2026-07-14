import {
  Bell,
  Circle,
  MessageSquareText,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { ObservationMarker } from "@/types/lookups";

type ObservationMarkerLike = Pick<ObservationMarker, "name"> & {
  icon?: string | null;
  icon_reference?: string | null;
};

export type ObservationMarkerPresentation = {
  badge: string;
  border: string;
  icon: LucideIcon;
  iconClassName: string;
  line: string;
  pill: string;
  surface: string;
  text: string;
};

const MARKER_PRESENTATIONS: Record<string, ObservationMarkerPresentation> = {
  general: {
    badge: "bg-marker-violet",
    border: "border-marker-violet",
    icon: MessageSquareText,
    iconClassName: "size-3",
    line: "bg-marker-violet-foreground/30",
    pill: "bg-marker-violet",
    surface: "bg-marker-violet/35",
    text: "text-marker-violet-foreground",
  },
  important: {
    badge: "bg-marker-indigo",
    border: "border-marker-indigo",
    icon: Star,
    iconClassName: "size-3.5",
    line: "bg-marker-indigo-foreground/30",
    pill: "bg-marker-indigo",
    surface: "bg-marker-indigo/35",
    text: "text-marker-indigo-foreground",
  },
  neutral: {
    badge: "bg-marker-teal",
    border: "border-marker-teal",
    icon: Circle,
    iconClassName: "size-2.5 fill-current",
    line: "bg-marker-teal-foreground/30",
    pill: "bg-marker-teal",
    surface: "bg-marker-teal/35",
    text: "text-marker-teal-foreground",
  },
  neutralnote: {
    badge: "bg-marker-teal",
    border: "border-marker-teal",
    icon: MessageSquareText,
    iconClassName: "size-3",
    line: "bg-marker-teal-foreground/30",
    pill: "bg-marker-teal",
    surface: "bg-marker-teal/35",
    text: "text-marker-teal-foreground",
  },
  note: {
    badge: "bg-marker-teal",
    border: "border-marker-teal",
    icon: MessageSquareText,
    iconClassName: "size-3",
    line: "bg-marker-teal-foreground/30",
    pill: "bg-marker-teal",
    surface: "bg-marker-teal/35",
    text: "text-marker-teal-foreground",
  },
  noticed: {
    badge: "bg-marker-fuchsia",
    border: "border-marker-fuchsia",
    icon: Sparkles,
    iconClassName: "size-3.5",
    line: "bg-marker-fuchsia-foreground/30",
    pill: "bg-marker-fuchsia",
    surface: "bg-marker-fuchsia/35",
    text: "text-marker-fuchsia-foreground",
  },
  positive: {
    badge: "bg-marker-rose",
    border: "border-marker-rose",
    icon: Star,
    iconClassName: "size-3.5",
    line: "bg-marker-rose-foreground/30",
    pill: "bg-marker-rose",
    surface: "bg-marker-rose/35",
    text: "text-marker-rose-foreground",
  },
  positivenoticed: {
    badge: "bg-marker-rose",
    border: "border-marker-rose",
    icon: Sparkles,
    iconClassName: "size-3.5",
    line: "bg-marker-rose-foreground/30",
    pill: "bg-marker-rose",
    surface: "bg-marker-rose/35",
    text: "text-marker-rose-foreground",
  },
  reminder: {
    badge: "bg-marker-indigo",
    border: "border-marker-indigo",
    icon: Bell,
    iconClassName: "size-3.5",
    line: "bg-marker-indigo-foreground/30",
    pill: "bg-marker-indigo",
    surface: "bg-marker-indigo/35",
    text: "text-marker-indigo-foreground",
  },
};

const DEFAULT_MARKER_PRESENTATION: ObservationMarkerPresentation = {
  badge: "bg-marker-violet",
  border: "border-marker-violet",
  icon: Circle,
  iconClassName: "size-2.5 fill-current",
  line: "bg-marker-violet-foreground/30",
  pill: "bg-marker-violet",
  surface: "bg-marker-violet/35",
  text: "text-marker-violet-foreground",
};

export function getObservationMarkerPresentation(
  marker: ObservationMarkerLike | undefined,
): ObservationMarkerPresentation {
  if (!marker) {
    return DEFAULT_MARKER_PRESENTATION;
  }

  return (
    MARKER_PRESENTATIONS[normalizeMarkerName(marker.name)] ??
    getIconReferencePresentation(marker.icon_reference || marker.icon || "") ??
    DEFAULT_MARKER_PRESENTATION
  );
}

function getIconReferencePresentation(
  iconReference: string,
): ObservationMarkerPresentation | null {
  if (iconReference === "FiBell") {
    return MARKER_PRESENTATIONS.reminder ?? DEFAULT_MARKER_PRESENTATION;
  }

  if (iconReference === "FiStar") {
    return MARKER_PRESENTATIONS.positive ?? DEFAULT_MARKER_PRESENTATION;
  }

  if (iconReference === "FiFileText" || iconReference === "FiInfo") {
    return MARKER_PRESENTATIONS.note ?? DEFAULT_MARKER_PRESENTATION;
  }

  return null;
}

function normalizeMarkerName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\band\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}
