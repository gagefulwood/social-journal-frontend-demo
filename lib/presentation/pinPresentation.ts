import { getPresentationTokens } from "@/lib/presentation/semanticTokens";
import type {
  PinStateKey,
  SemanticPresentation,
} from "@/lib/presentation/types";

export type PinPresentation = SemanticPresentation<PinStateKey> & {
  accessibleLabel:
    | "Pin fact"
    | "Unpin fact"
    | "Pin observation"
    | "Unpin observation"
    | "Updating pin state";
  pending: boolean;
  pressed: boolean;
};

export type PinPresentationSubject = "fact" | "observation";

export function getPinPresentation(
  isPinned: boolean,
  pending = false,
  subject: PinPresentationSubject = "fact",
): PinPresentation {
  if (pending) {
    return {
      key: "pinState.pending",
      label: "Updating pin",
      accessibleLabel: "Updating pin state",
      icon: "loader-circle",
      tokens: getPresentationTokens("pinState.pending"),
      variants: { indicator: "pinStateIndicator.status" },
      source: "derived",
      pending: true,
      pressed: isPinned,
    };
  }

  if (isPinned) {
    return {
      key: "pinState.pinned",
      label: "Pinned",
      accessibleLabel:
        subject === "observation" ? "Unpin observation" : "Unpin fact",
      icon: "pin",
      tokens: getPresentationTokens("pinState.pinned"),
      variants: { indicator: "pinStateIndicator.status" },
      source: "derived",
      pending: false,
      pressed: true,
    };
  }

  return {
    key: "pinState.unpinned",
    label: "Not pinned",
    accessibleLabel: subject === "observation" ? "Pin observation" : "Pin fact",
    icon: "pin",
    tokens: getPresentationTokens("pinState.unpinned"),
    variants: { indicator: "pinStateIndicator.status" },
    source: "derived",
    pending: false,
    pressed: false,
  };
}
