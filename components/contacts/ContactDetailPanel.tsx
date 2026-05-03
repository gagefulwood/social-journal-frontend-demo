"use client";

import { BookOpenText } from "lucide-react";
import { IdentityPanel } from "@/components/contacts/IdentityPanel";
import { ContactOverviewTab } from "@/components/contacts/ContactOverviewTab";
import { FactsPanel } from "@/components/contacts/FactsPanel";
import { ObservationsPanel } from "@/components/contacts/ObservationsPanel";
import { TimelinePanel } from "@/components/contacts/TimelinePanel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useQueryTabs } from "@/hooks/useQueryTabs";
import type { ApiId } from "@/types/api";
import type {
  Contact,
  CreateFactRequest,
  CreateObservationRequest,
  Fact,
  Observation,
  UpdateFactRequest,
  UpdateObservationRequest,
} from "@/types/contacts";

const contactDetailTabs = [
  "overview",
  "facts-observations",
  "journals",
  "timeline",
] as const;

type ContactDetailTab = (typeof contactDetailTabs)[number];

type ContactDetailPanelProps = {
  contact: Contact | null;
  facts?: Fact[];
  observations?: Observation[];
  onCreateFact: (data: CreateFactRequest) => Promise<void>;
  onUpdateFact: (factId: ApiId, data: UpdateFactRequest) => Promise<void>;
  onDeleteFact: (factId: ApiId) => Promise<void>;
  onCreateObservation: (data: CreateObservationRequest) => Promise<void>;
  onUpdateObservation: (
    observationId: ApiId,
    data: UpdateObservationRequest
  ) => Promise<void>;
  onDeleteObservation: (observationId: ApiId) => Promise<void>;
};

export function ContactDetailPanel({
  contact,
  facts = [],
  observations = [],
  onCreateFact,
  onUpdateFact,
  onDeleteFact,
  onCreateObservation,
  onUpdateObservation,
  onDeleteObservation,
}: ContactDetailPanelProps) {
  const { value: activeTab, setValue: setActiveTab } =
    useQueryTabs<ContactDetailTab>({
      values: contactDetailTabs,
      defaultValue: "overview",
    });

  if (!contact) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <aside className="md:col-span-4">
        <IdentityPanel contact={contact} />
      </aside>

      <div className="space-y-5 md:col-span-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ContactDetailTab)}
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="facts-observations">
              Facts & Observations
            </TabsTrigger>
            <TabsTrigger value="journals">Journals</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-5">
            <ContactOverviewTab
              contact={contact}
              facts={facts}
              observations={observations}
              onViewFactsAndObservations={() =>
                setActiveTab("facts-observations")
              }
            />
          </TabsContent>

          <TabsContent value="facts-observations" className="mt-4 space-y-5">
            <FactsPanel
              facts={facts}
              onCreate={onCreateFact}
              onUpdate={onUpdateFact}
              onDelete={onDeleteFact}
            />
            <ObservationsPanel
              observations={observations}
              onCreate={onCreateObservation}
              onUpdate={onUpdateObservation}
              onDelete={onDeleteObservation}
            />
          </TabsContent>

          <TabsContent value="journals" className="mt-4">
            <section className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <BookOpenText className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Journals</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Journal entries will appear here once journals are rebuilt.
              </p>
            </section>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <TimelinePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
