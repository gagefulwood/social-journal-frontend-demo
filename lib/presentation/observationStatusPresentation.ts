import { getPresentationTokens } from "@/lib/presentation/semanticTokens";
import type {
  ObservationCardVariant,
  ObservationStatusKey,
  PresentationVariant,
  SemanticPresentation,
} from "@/lib/presentation/types";
import type { ObservationStatus } from "@/types/contacts";

export type ObservationStatusPresentation = Omit<
  SemanticPresentation<ObservationStatusKey>,
  "variants"
> & {
  variants: {
    chip: Extract<PresentationVariant, "observationStatusTag.status">;
    standardCard: Extract<
      PresentationVariant,
      "observationSurface.standardCard"
    >;
    compactCard: Extract<PresentationVariant, "observationSurface.compactCard">;
    featuredCard: Extract<
      PresentationVariant,
      "observationSurface.featuredCard"
    >;
  };
};

export type ObservationStatusSurfaceVariant = ObservationCardVariant;

const statusVariants = {
  chip: "observationStatusTag.status",
  standardCard: "observationSurface.standardCard",
  compactCard: "observationSurface.compactCard",
  featuredCard: "observationSurface.featuredCard",
} as const;

export function getObservationStatusPresentation(
  status: ObservationStatus,
): ObservationStatusPresentation {
  if (status === "revisit_later") {
    return createStatusPresentation(
      "observationStatus.revisitLater",
      "Revisit later",
      "calendar-clock",
    );
  }

  if (status === "archived") {
    return createStatusPresentation(
      "observationStatus.archived",
      "Archived",
      "archive",
    );
  }

  return createStatusPresentation(
    "observationStatus.current",
    "Current",
    "check-circle-2",
  );
}

function createStatusPresentation(
  key: ObservationStatusKey,
  label: string,
  icon: ObservationStatusPresentation["icon"],
): ObservationStatusPresentation {
  return {
    key,
    label,
    icon,
    tokens: getPresentationTokens(key),
    variants: statusVariants,
    source: "enum",
  };
}
