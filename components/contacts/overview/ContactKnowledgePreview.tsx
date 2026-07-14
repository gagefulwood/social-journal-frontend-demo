import { ContactContentStack } from "@/components/contacts/surfaces/ContactContentStack";
import type { Fact, Observation } from "@/types/contacts";
import { FactsPreviewCard } from "./FactsPreviewCard";
import { RecentObservationsPreviewCard } from "./RecentObservationsPreviewCard";

type ContactKnowledgePreviewProps = {
  facts: Fact[];
  factsCount?: number;
  factsError?: string | null;
  factsLoading?: boolean;
  observations: Observation[];
  pinnedObservations: Observation[];
  observationsError?: string | null;
  observationsLoading?: boolean;
  pinnedObservationsError?: string | null;
  pinnedObservationsLoading?: boolean;
  onRetryPinnedObservations?: () => void;
  onViewFactsAndObservations: () => void;
};

export function ContactKnowledgePreview({
  facts,
  factsCount,
  factsError = null,
  factsLoading = false,
  observations,
  observationsError = null,
  observationsLoading = false,
  pinnedObservations,
  pinnedObservationsError = null,
  pinnedObservationsLoading = false,
  onRetryPinnedObservations,
  onViewFactsAndObservations,
}: ContactKnowledgePreviewProps) {
  return (
    <section
      aria-label="Contact knowledge and observations"
      className="min-w-0 max-w-full"
    >
      <ContactContentStack>
        <FactsPreviewCard
          facts={facts}
          totalCount={factsCount}
          loading={factsLoading}
          error={factsError}
          onViewAll={onViewFactsAndObservations}
        />
        <RecentObservationsPreviewCard
          observations={observations}
          pinnedObservations={pinnedObservations}
          loading={observationsLoading}
          error={observationsError}
          pinnedError={pinnedObservationsError}
          pinnedLoading={pinnedObservationsLoading}
          onRetryPinned={onRetryPinnedObservations}
          onViewAll={onViewFactsAndObservations}
        />
      </ContactContentStack>
    </section>
  );
}
