"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BookOpenText,
  CalendarDays,
  LayoutGrid,
  NotebookTabs,
  Sparkles,
} from "lucide-react";
import { ContactContextWorkspace } from "@/components/contacts/ContactContextWorkspace";
import { ContextProfileDetailsRail } from "@/components/contacts/ContextProfileDetailsRail";
import { ProfileDetailsSheet } from "@/components/contacts/ProfileDetailsSheet";
import { TimelinePanel } from "@/components/contacts/TimelinePanel";
import { ContactOverviewPanel } from "@/components/contacts/overview/ContactOverviewPanel";
import { ContactProfileRail } from "@/components/contacts/overview/ContactProfileRail";
import { buildContactOverviewModel } from "@/components/contacts/overview/contact-overview-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContactEvents } from "@/hooks/useContactEvents";
import { useContactFacts } from "@/hooks/useContactFacts";
import { useContactObservations } from "@/hooks/useContactObservations";
import { useQueryTabs } from "@/hooks/useQueryTabs";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
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
  headerEnd?: ReactNode;
  headerStart?: ReactNode;
  observations?: Observation[];
  onCreateFact: (data: CreateFactRequest) => Promise<void>;
  onUpdateFact: (factId: ApiId, data: UpdateFactRequest) => Promise<void>;
  onDeleteFact: (factId: ApiId) => Promise<void>;
  onPinFact: (factId: ApiId) => Promise<void>;
  onUnpinFact: (factId: ApiId) => Promise<void>;
  onCreateObservation: (data: CreateObservationRequest) => Promise<void>;
  onUpdateObservation: (
    observationId: ApiId,
    data: UpdateObservationRequest,
  ) => Promise<void>;
  onDeleteObservation: (observationId: ApiId) => Promise<void>;
  onPinObservation: (observationId: ApiId) => Promise<void>;
  onUnpinObservation: (observationId: ApiId) => Promise<void>;
  onDeleteContact?: () => Promise<void>;
  factsCount?: number;
  factsError?: ApiError | null;
  observationsError?: ApiError | null;
};

const contactDetailTabContentClassName =
  "min-w-0 w-full max-w-full px-0 py-4 sm:py-5 xl:h-full xl:min-h-0 xl:py-0";

export function ContactDetailPanel({
  contact,
  facts = [],
  headerEnd,
  headerStart,
  observations = [],
  onCreateFact,
  onUpdateFact,
  onDeleteFact,
  onPinFact,
  onUnpinFact,
  onCreateObservation,
  onUpdateObservation,
  onDeleteObservation,
  onPinObservation,
  onUnpinObservation,
  onDeleteContact,
  factsCount,
  factsError,
  observationsError,
}: ContactDetailPanelProps) {
  const { value: activeTab, setValue: setActiveTab } =
    useQueryTabs<ContactDetailTab>({
      values: contactDetailTabs,
      defaultValue: "overview",
    });
  const [observationCreateRequest, setObservationCreateRequest] = useState(0);
  const [profileDetailsHighlighted, setProfileDetailsHighlighted] =
    useState(false);
  const [mobileProfileDetailsOpen, setMobileProfileDetailsOpen] =
    useState(false);
  const profileDetailsRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [nowIso] = useState(() => new Date().toISOString());
  const contextEventsQuery = useContactEvents(
    contact?.id,
    { page_size: 100 },
    { enabled: activeTab === "facts-observations" },
  );
  const pastEventsQuery = useContactEvents(contact?.id, {
    event_before: nowIso,
    ordering: "-event_timestamp",
    page_size: 4,
  });
  const nextPlanQuery = useContactEvents(
    contact?.id,
    {
      event_after: nowIso,
      ordering: "event_timestamp",
      page_size: 2,
    },
    { enabled: activeTab === "overview" },
  );
  const toJournalQuery = useContactEvents(
    contact?.id,
    {
      event_before: nowIso,
      journaled: false,
      ordering: "-event_timestamp",
      page_size: 1,
    },
    { enabled: activeTab === "overview" },
  );
  const pinnedObservationsQuery = useContactObservations(
    contact?.id,
    {
      pinned: true,
      ordering: "-pinned_at",
      page_size: 100,
    },
    { enabled: activeTab === "overview" },
  );
  const { facts: conversationCueFacts } = useContactFacts(
    contact?.id,
    { is_conversation_cue: true },
    { enabled: activeTab === "timeline" },
  );
  const { observations: conversationCueObservations } = useContactObservations(
    contact?.id,
    { observation_type: "conversation_cue" },
    { enabled: activeTab === "timeline" },
  );

  const overviewModel = useMemo(
    () =>
      contact
        ? buildContactOverviewModel({
            contact,
            facts: conversationCueFacts,
            observations: conversationCueObservations,
            events: pastEventsQuery.events,
            eventCount: pastEventsQuery.data?.count,
          })
        : null,
    [
      contact,
      conversationCueFacts,
      conversationCueObservations,
      pastEventsQuery.data?.count,
      pastEventsQuery.events,
    ],
  );
  const nextPlan = useMemo(
    () =>
      nextPlanQuery.events.find(
        (event) => Date.parse(event.event_timestamp) > Date.parse(nowIso),
      ) ?? null,
    [nextPlanQuery.events, nowIso],
  );

  useEffect(() => {
    const legacyProfileLink =
      searchParams.get("tab") === "context" ||
      searchParams.has("about") ||
      searchParams.has("details") ||
      searchParams.has("more");
    if (!legacyProfileLink) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "facts-observations");
    params.set("focus", "profile-details");
    params.delete("about");
    params.delete("details");
    params.delete("more");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (
      activeTab !== "facts-observations" ||
      searchParams.get("focus") !== "profile-details"
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (!window.matchMedia("(min-width: 1280px)").matches) {
        setMobileProfileDetailsOpen(true);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("focus");
        router.replace(
          params.size ? `${pathname}?${params.toString()}` : pathname,
          { scroll: false },
        );
        return;
      }
      const rail = profileDetailsRef.current;
      if (!rail) return;
      setProfileDetailsHighlighted(true);
      rail.scrollIntoView({ block: "nearest", behavior: "auto" });
      rail.focus({ preventScroll: true });

      window.setTimeout(() => setProfileDetailsHighlighted(false), 1600);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("focus");
      router.replace(
        params.size ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false },
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeTab, pathname, router, searchParams]);

  if (!contact || !overviewModel) {
    return null;
  }

  function handleTabChange(nextTab: ContactDetailTab) {
    setActiveTab(nextTab);
    if (nextTab !== "facts-observations") {
      setProfileDetailsHighlighted(false);
    }
  }

  function handleAddNote() {
    handleTabChange("facts-observations");
    setObservationCreateRequest((value) => value + 1);
  }

  function handleViewProfileDetails() {
    if (!window.matchMedia("(min-width: 1280px)").matches) {
      setMobileProfileDetailsOpen(true);
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "facts-observations");
    params.set("focus", "profile-details");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs
      className="min-w-0 gap-0 xl:min-h-0 xl:flex-1 xl:overflow-hidden"
      value={activeTab}
      onValueChange={(value) => handleTabChange(value as ContactDetailTab)}
    >
      <header className="mb-4 grid min-w-0 shrink-0 grid-cols-[auto_auto] items-center gap-x-3 border-b border-border sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="min-w-0 justify-self-start">{headerStart}</div>

        <TabsList
          variant="line"
          className="col-span-2 row-start-2 mx-auto h-14 w-full max-w-full justify-start overflow-x-auto rounded-none border-b-0 px-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-16 sm:justify-center sm:px-4"
        >
          <TabsTrigger
            value="overview"
            className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
          >
            <Sparkles className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="facts-observations"
            className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
          >
            <LayoutGrid className="size-4" />
            Context
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
          >
            <CalendarDays className="size-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger
            value="journals"
            className="gap-2 px-3 data-active:text-primary-strong data-active:after:bg-primary-strong sm:px-5"
          >
            <NotebookTabs className="size-4" />
            Journals
          </TabsTrigger>
        </TabsList>

        <div className="col-start-2 row-start-1 min-w-0 justify-self-end sm:col-start-3">
          {headerEnd}
        </div>
      </header>

      <div
        className={cn(
          "grid min-w-0 grid-cols-1 items-start gap-4 xl:h-full xl:min-h-0 xl:flex-1 xl:items-stretch xl:gap-5 2xl:gap-6",
          activeTab === "facts-observations"
            ? "xl:grid-cols-[minmax(252px,288px)_minmax(0,1fr)_minmax(248px,280px)] 2xl:grid-cols-[296px_minmax(0,1fr)_minmax(260px,300px)]"
            : "xl:grid-cols-[288px_minmax(0,1fr)] 2xl:grid-cols-[296px_minmax(0,1fr)]",
        )}
      >
        <aside className="min-w-0 xl:h-full xl:min-h-0 xl:self-stretch">
          <ContactProfileRail
            contact={contact}
            model={overviewModel}
            lastInteraction={overviewModel.relationshipSnapshot.latestEvent}
            lastInteractionLoading={pastEventsQuery.loading}
            onAddNote={handleAddNote}
            onDeleteContact={onDeleteContact}
            onViewProfileDetails={handleViewProfileDetails}
          />
        </aside>

        <div className="min-w-0 max-w-full xl:h-full xl:min-h-0 xl:overflow-hidden">
          <ContactDetailTabContent value="overview">
            <ContactOverviewPanel
              contact={contact}
              facts={facts}
              factsCount={factsCount}
              factsError={factsError?.message ?? null}
              observations={observations}
              observationsError={observationsError?.message ?? null}
              pinnedObservations={pinnedObservationsQuery.observations}
              pinnedObservationsError={
                pinnedObservationsQuery.error?.message ?? null
              }
              pinnedObservationsLoading={pinnedObservationsQuery.loading}
              model={overviewModel}
              headerSummary={{
                lastShared: pastEventsQuery.events[0] ?? null,
                lastSharedLoading: pastEventsQuery.loading,
                lastSharedUnavailable: Boolean(pastEventsQuery.error),
                nextPlan,
                nextPlanLoading: nextPlanQuery.loading,
                nextPlanUnavailable: Boolean(nextPlanQuery.error),
                toJournalCount: toJournalQuery.data?.count ?? null,
                toJournalLoading: toJournalQuery.loading,
                toJournalUnavailable: Boolean(toJournalQuery.error),
              }}
              eventsLoading={pastEventsQuery.loading}
              eventsError={pastEventsQuery.error}
              onRetryEvents={() => void pastEventsQuery.refetch()}
              onRetryPinnedObservations={() =>
                void pinnedObservationsQuery.refetch()
              }
              onViewFactsAndObservations={() =>
                handleTabChange("facts-observations")
              }
              onViewTimeline={() => handleTabChange("timeline")}
            />
          </ContactDetailTabContent>

          <ContactDetailTabContent value="facts-observations">
            <ContactContextWorkspace
              key={`context-${observationCreateRequest}`}
              active={activeTab === "facts-observations"}
              contact={contact}
              events={contextEventsQuery.events}
              eventsLoading={contextEventsQuery.loading}
              initialObservationCreateRequest={observationCreateRequest}
              onCreateFact={onCreateFact}
              onUpdateFact={onUpdateFact}
              onDeleteFact={onDeleteFact}
              onPinFact={onPinFact}
              onUnpinFact={onUnpinFact}
              onCreateObservation={onCreateObservation}
              onUpdateObservation={onUpdateObservation}
              onDeleteObservation={onDeleteObservation}
              onPinObservation={onPinObservation}
              onUnpinObservation={onUnpinObservation}
            />
          </ContactDetailTabContent>

          <ContactDetailTabContent value="journals">
            <section className="flex min-w-0 max-w-full flex-col rounded-lg border border-border bg-card p-8 text-center xl:h-full xl:min-h-0 xl:items-center xl:justify-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <BookOpenText className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Journals</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Journal entries will appear here once journals are rebuilt.
              </p>
            </section>
          </ContactDetailTabContent>

          <ContactDetailTabContent value="timeline">
            <TimelinePanel
              contact={contact}
              model={overviewModel}
              onAddObservation={handleAddNote}
            />
          </ContactDetailTabContent>
        </div>

        {activeTab === "facts-observations" ? (
          <ContextProfileDetailsRail
            ref={profileDetailsRef}
            contact={contact}
            highlighted={profileDetailsHighlighted}
          />
        ) : null}
      </div>
      <ProfileDetailsSheet
        contact={contact}
        open={mobileProfileDetailsOpen}
        onOpenChange={setMobileProfileDetailsOpen}
      />
    </Tabs>
  );
}

function ContactDetailTabContent({
  value,
  children,
}: {
  value: ContactDetailTab;
  children: ReactNode;
}) {
  return (
    <TabsContent
      value={value}
      tabIndex={-1}
      className="m-0 xl:h-full xl:min-h-0"
    >
      <div className={contactDetailTabContentClassName}>{children}</div>
    </TabsContent>
  );
}
