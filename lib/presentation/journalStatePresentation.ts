import { getPresentationTokens } from "@/lib/presentation/semanticTokens";
import type {
  JournalStateKey,
  SemanticPresentation,
} from "@/lib/presentation/types";

export type JournalStatePresentation = SemanticPresentation<JournalStateKey> & {
  accessibleLabel: "Journal created" | "Journal not yet created";
};

export function getJournalStatePresentation(
  journaled: boolean,
): JournalStatePresentation {
  if (journaled) {
    return {
      key: "journalState.complete",
      label: "Journaled",
      accessibleLabel: "Journal created",
      icon: "check-circle-2",
      tokens: getPresentationTokens("journalState.complete"),
      variants: {
        indicator: "journalStateIndicator.status",
      },
      source: "derived",
    };
  }

  return {
    key: "journalState.empty",
    label: "Journaled",
    accessibleLabel: "Journal not yet created",
    icon: "circle",
    tokens: getPresentationTokens("journalState.empty"),
    variants: {
      indicator: "journalStateIndicator.status",
    },
    source: "derived",
  };
}
