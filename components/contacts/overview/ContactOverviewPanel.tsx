import { ContactOverviewErrorState } from "./ContactOverviewErrorState";
import { ContactKnowledgePreview } from "./ContactKnowledgePreview";
import { RelationshipPulsePanel } from "./RelationshipPulsePanel";
import { RelationshipSnapshotCard } from "./RelationshipSnapshotCard";
import { StorySoFarStrip } from "./StorySoFarStrip";
import type { ApiError } from "@/types/auth";
import type { Contact, Fact, Observation } from "@/types/contacts";
import type { ContactOverviewModel } from "./contact-overview-utils";

type ContactOverviewPanelProps = {
  contact: Contact;
  facts: Fact[];
  observations: Observation[];
  model: ContactOverviewModel;
  eventsLoading?: boolean;
  eventsError?: ApiError | null;
  onRetryEvents?: () => void;
  onViewFactsAndObservations: () => void;
  onViewTimeline: () => void;
};

export function ContactOverviewPanel({
  contact,
  facts,
  observations,
  model,
  eventsLoading = false,
  eventsError = null,
  onRetryEvents,
  onViewFactsAndObservations,
  onViewTimeline,
}: ContactOverviewPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,330px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(320px,350px)] xl:items-start">
      <div className="contents xl:flex xl:min-w-0 xl:flex-col xl:gap-4">
        <div className="order-1 min-w-0 xl:order-none">
          <RelationshipSnapshotCard model={model} />
        </div>
        <div className="order-2 min-w-0 xl:order-none">
          <RelationshipPulsePanel contact={contact} model={model} />
        </div>
        {eventsError && (
          <div className="order-3 min-w-0 xl:order-none">
            <ContactOverviewErrorState
              message={eventsError.message}
              onRetry={onRetryEvents}
            />
          </div>
        )}
        <div className="order-5 min-w-0 xl:order-none">
          <StorySoFarStrip
            model={model}
            loading={eventsLoading}
            onViewTimeline={onViewTimeline}
          />
        </div>
      </div>
      <div className="order-4 min-w-0 xl:order-none xl:self-start">
        <ContactKnowledgePreview
          facts={facts}
          observations={observations}
          onViewFactsAndObservations={onViewFactsAndObservations}
        />
      </div>
    </div>
  );
}
