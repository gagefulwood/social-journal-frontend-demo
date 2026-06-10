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
}: ContactOverviewPanelProps) {
  return (
    <div className="grid h-full items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-5">
        <RelationshipSnapshotCard model={model} />
        {eventsError && (
          <ContactOverviewErrorState
            message={eventsError.message}
            onRetry={onRetryEvents}
          />
        )}
        <StorySoFarStrip model={model} loading={eventsLoading} />
        <RelationshipPulsePanel contact={contact} model={model} />
      </div>
      <ContactKnowledgePreview
        facts={facts}
        observations={observations}
        onViewFactsAndObservations={onViewFactsAndObservations}
      />
    </div>
  );
}
