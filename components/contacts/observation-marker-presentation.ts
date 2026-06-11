import {
  Bell,
  Circle,
  MessageSquareText,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { ObservationMarker } from "@/types/lookups";

export type ObservationMarkerPresentation = {
  badge: string;
  icon: LucideIcon;
  iconClassName: string;
  line: string;
  pill: string;
  text: string;
};

const MARKER_PRESENTATIONS: Record<string, ObservationMarkerPresentation> = {
  general: {
    badge: "bg-violet-100",
    icon: MessageSquareText,
    iconClassName: "size-3",
    line: "bg-violet-200",
    pill: "bg-violet-100",
    text: "text-violet-700",
  },
  important: {
    badge: "bg-rose-100",
    icon: Star,
    iconClassName: "size-3.5",
    line: "bg-rose-200",
    pill: "bg-rose-100",
    text: "text-rose-700",
  },
  neutral: {
    badge: "bg-sky-100",
    icon: Circle,
    iconClassName: "size-2.5 fill-current",
    line: "bg-sky-200",
    pill: "bg-sky-100",
    text: "text-sky-700",
  },
  neutralnote: {
    badge: "bg-sky-100",
    icon: MessageSquareText,
    iconClassName: "size-3",
    line: "bg-sky-200",
    pill: "bg-sky-100",
    text: "text-sky-700",
  },
  note: {
    badge: "bg-sky-100",
    icon: MessageSquareText,
    iconClassName: "size-3",
    line: "bg-sky-200",
    pill: "bg-sky-100",
    text: "text-sky-700",
  },
  noticed: {
    badge: "bg-emerald-100",
    icon: Sparkles,
    iconClassName: "size-3.5",
    line: "bg-emerald-300",
    pill: "bg-emerald-100",
    text: "text-emerald-700",
  },
  positive: {
    badge: "bg-emerald-100",
    icon: Star,
    iconClassName: "size-3.5",
    line: "bg-emerald-300",
    pill: "bg-emerald-100",
    text: "text-emerald-700",
  },
  positivenoticed: {
    badge: "bg-emerald-100",
    icon: Sparkles,
    iconClassName: "size-3.5",
    line: "bg-emerald-300",
    pill: "bg-emerald-100",
    text: "text-emerald-700",
  },
  reminder: {
    badge: "bg-amber-100",
    icon: Bell,
    iconClassName: "size-3.5",
    line: "bg-amber-300",
    pill: "bg-amber-100",
    text: "text-amber-700",
  },
};

const DEFAULT_MARKER_PRESENTATION: ObservationMarkerPresentation = {
  badge: "bg-violet-100",
  icon: Circle,
  iconClassName: "size-2.5 fill-current",
  line: "bg-violet-200",
  pill: "bg-violet-100",
  text: "text-violet-700",
};

export function getObservationMarkerPresentation(
  marker: ObservationMarker | undefined,
): ObservationMarkerPresentation {
  if (!marker) {
    return DEFAULT_MARKER_PRESENTATION;
  }

  return (
    MARKER_PRESENTATIONS[normalizeMarkerName(marker.name)] ??
    getIconReferencePresentation(marker.icon_reference) ??
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
