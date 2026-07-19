import { createElement } from "react";
import {
  Activity,
  BatteryMedium,
  BookOpen,
  CheckCircle2,
  Circle,
  Heart,
  NotebookTabs,
  PencilLine,
  Smile,
  Star,
  UsersRound,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { JournalIconIdentifier } from "@/lib/presentation/journalPresentation";

const journalPresentationIcons = {
  activity: Activity,
  "battery-medium": BatteryMedium,
  "book-open": BookOpen,
  "check-circle-2": CheckCircle2,
  circle: Circle,
  heart: Heart,
  "notebook-tabs": NotebookTabs,
  "pencil-line": PencilLine,
  smile: Smile,
  star: Star,
  "users-round": UsersRound,
} satisfies Record<JournalIconIdentifier, LucideIcon>;

export function renderJournalPresentationIcon(
  identifier: JournalIconIdentifier,
  props: LucideProps,
) {
  return createElement(journalPresentationIcons[identifier], props);
}
