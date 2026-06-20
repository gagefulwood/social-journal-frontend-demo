"use client";

import { useMemo, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  LayoutGrid,
  NotebookTabs,
  Sparkles,
} from "lucide-react";
import { FactsPanel } from "@/components/contacts/FactsPanel";
import { ObservationsPanel } from "@/components/contacts/ObservationsPanel";
import { TimelinePanel } from "@/components/contacts/TimelinePanel";
import { ContactOverviewPanel } from "@/components/contacts/overview/ContactOverviewPanel";
import { ContactProfileRail } from "@/components/contacts/overview/ContactProfileRail";
import { buildContactOverviewModel } from "@/components/contacts/overview/contact-overview-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContactEvents } from "@/hooks/useContactEvents";
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
    data: UpdateObservationRequest,
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
  const [observationCreateRequest, setObservationCreateRequest] = useState(0);
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useContactEvents(contact?.id);

  const overviewModel = useMemo(
    () =>
      contact
        ? buildContactOverviewModel({
            contact,
            facts,
            observations,
            events,
          })
        : null,
    [contact, events, facts, observations],
  );

  if (!contact || !overviewModel) {
    return null;
  }

  function handleAddNote() {
    setActiveTab("facts-observations");
    setObservationCreateRequest((value) => value + 1);
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="flex self-stretch">
        <ContactProfileRail
          contact={contact}
          model={overviewModel}
          lastInteraction={overviewModel.relationshipSnapshot.latestEvent}
          onAddNote={handleAddNote}
        />
      </aside>

      <div className="min-w-0 rounded-xl border border-border bg-background shadow-sm">
        <Tabs
          className="h-full"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ContactDetailTab)}
        >
          <TabsList
            variant="line"
            className="h-16 w-full max-w-full justify-start overflow-x-auto rounded-none border-b border-border px-5"
          >
            <TabsTrigger
              value="overview"
              className="gap-2 px-5 data-active:text-primary-strong data-active:after:bg-primary-strong"
            >
              <Sparkles className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="facts-observations"
              className="gap-2 px-5 data-active:text-primary-strong data-active:after:bg-primary-strong"
            >
              <LayoutGrid className="size-4" />
              Context
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="gap-2 px-5 data-active:text-primary-strong data-active:after:bg-primary-strong"
            >
              <CalendarDays className="size-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="journals"
              className="gap-2 px-5 data-active:text-primary-strong data-active:after:bg-primary-strong"
            >
              <NotebookTabs className="size-4" />
              Journals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="m-0 p-4 sm:p-5">
            <ContactOverviewPanel
              contact={contact}
              facts={facts}
              observations={observations}
              model={overviewModel}
              eventsLoading={eventsLoading}
              eventsError={eventsError}
              onRetryEvents={() => void refetchEvents()}
              onViewFactsAndObservations={() =>
                setActiveTab("facts-observations")
              }
              onViewTimeline={() => setActiveTab("timeline")}
            />
          </TabsContent>

          <TabsContent value="facts-observations" className="m-0 p-4 sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
              <FactsPanel
                facts={facts}
                contactFirstName={contact.first_name}
                onCreate={onCreateFact}
                onUpdate={onUpdateFact}
                onDelete={onDeleteFact}
              />
              <ObservationsPanel
                key={`observations-${observationCreateRequest}`}
                observations={observations}
                initialCreateOpen={observationCreateRequest > 0}
                onCreate={onCreateObservation}
                onUpdate={onUpdateObservation}
                onDelete={onDeleteObservation}
              />
            </div>
          </TabsContent>

          <TabsContent value="journals" className="m-0 p-5">
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

          <TabsContent value="timeline" className="m-0 p-5">
            <TimelinePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
