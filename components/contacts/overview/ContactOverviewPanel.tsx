import { ContactContentStack } from "@/components/contacts/surfaces/ContactContentStack";
import { ContactHelperStack } from "@/components/contacts/surfaces/ContactHelperStack";
import { ContactKnowledgePreview } from "./ContactKnowledgePreview";
import {
  RelationshipOverviewCard,
  type OverviewHeaderData,
} from "./RelationshipOverviewCard";
import { RelationshipPulsePanel } from "./RelationshipPulsePanel";
import { StorySoFarStrip } from "./StorySoFarStrip";
import type { ApiError } from "@/types/auth";
import type { Contact, Fact, Observation } from "@/types/contacts";
import type { ContactOverviewModel } from "./contact-overview-utils";

type ContactOverviewPanelProps = {
  contact: Contact;
  facts: Fact[];
  observations: Observation[];
  pinnedObservations: Observation[];
  factsCount?: number;
  factsError?: string | null;
  observationsError?: string | null;
  pinnedObservationsError?: string | null;
  pinnedObservationsLoading?: boolean;
  model: ContactOverviewModel;
  headerSummary: OverviewHeaderData;
  eventsLoading?: boolean;
  eventsError?: ApiError | null;
  onRetryEvents?: () => void;
  onRetryPinnedObservations?: () => void;
  onViewFactsAndObservations: () => void;
  onViewTimeline: () => void;
};

export function ContactOverviewPanel({
  contact,
  facts,
  factsCount,
  factsError,
  headerSummary,
  observations,
  observationsError,
  pinnedObservations,
  pinnedObservationsError,
  pinnedObservationsLoading = false,
  model,
  eventsLoading = false,
  eventsError = null,
  onRetryEvents,
  onRetryPinnedObservations,
  onViewFactsAndObservations,
  onViewTimeline,
}: ContactOverviewPanelProps) {
  return (
    <div className="grid min-w-0 max-w-full gap-4 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] xl:grid-rows-[minmax(0,1fr)] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,330px)]">
      <ContactContentStack className="max-w-full xl:h-full">
        <div className="min-w-0 shrink-0">
          <RelationshipOverviewCard model={model} summary={headerSummary} />
        </div>
        <div className="min-w-0 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-y-contain xl:pr-1">
          <ContactContentStack className="max-w-full xl:min-h-full">
            <StorySoFarStrip
              model={model}
              loading={eventsLoading}
              error={eventsError}
              onRetry={onRetryEvents}
              onViewTimeline={onViewTimeline}
            />
            <ContactKnowledgePreview
              facts={facts}
              factsCount={factsCount}
              factsError={factsError}
              observations={observations}
              observationsError={observationsError}
              pinnedObservations={pinnedObservations}
              pinnedObservationsError={pinnedObservationsError}
              pinnedObservationsLoading={pinnedObservationsLoading}
              onRetryPinnedObservations={onRetryPinnedObservations}
              onViewFactsAndObservations={onViewFactsAndObservations}
            />
          </ContactContentStack>
        </div>
      </ContactContentStack>
      <ContactHelperStack
        asChild
        className="xl:h-full xl:min-h-0 xl:grid-rows-[minmax(0,1fr)] xl:self-stretch xl:overflow-y-auto xl:overscroll-y-contain"
      >
        <aside>
          <RelationshipPulsePanel
            contact={contact}
            model={model}
            variant="rail"
          />
        </aside>
      </ContactHelperStack>
    </div>
  );
}
