"use client";

import {
  Archive,
  ArchiveRestore,
  BookHeart,
  BookOpen,
  ClipboardList,
  Edit3,
  EllipsisVertical,
  Filter,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  flattenFactCategories,
  formatDate,
} from "@/components/contacts/contact-utils";
import { ContactTabHeader } from "@/components/contacts/ContactTabHeader";
import { ContactContentStack } from "@/components/contacts/surfaces/ContactContentStack";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { FactCategoryHeader } from "@/components/presentation/FactCategoryHeader";
import { ObservationStatusSurface } from "@/components/presentation/ObservationStatusSurface";
import { ObservationStatusTag } from "@/components/presentation/ObservationStatusTag";
import { ObservationTimelineNode } from "@/components/presentation/ObservationTimelineNode";
import { ObservationTypeTag } from "@/components/presentation/ObservationTypeTag";
import { PinnedStateIndicator } from "@/components/presentation/PinnedStateIndicator";
import { PinnedStateTag } from "@/components/presentation/PinnedStateTag";
import { SourceEventChip } from "@/components/presentation/SourceEventChip";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useContactContextFilters } from "@/hooks/useContactContextFilters";
import { useContactFacts } from "@/hooks/useContactFacts";
import { useContactObservations } from "@/hooks/useContactObservations";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";
import {
  mapContextFacts,
  mapContextObservations,
  type ContextFact,
  type ContextObservation,
} from "@/lib/context/context-mappers";
import { getFactCategoryPresentation } from "@/lib/presentation/factPresentation";
import { getObservationPresentation } from "@/lib/presentation/observationPresentation";
import { getPinPresentation } from "@/lib/presentation/pinPresentation";
import { cn } from "@/lib/utils";
import type { ApiId } from "@/types/api";
import type {
  Contact,
  CreateFactRequest,
  CreateObservationRequest,
  ObservationStatus,
  ObservationType,
  UpdateFactRequest,
  UpdateObservationRequest,
} from "@/types/contacts";
import type { EventListItem } from "@/types/events";
import type { FactCategory, ObservationMarker } from "@/types/lookups";

type ContactContextWorkspaceProps = {
  active: boolean;
  contact: Contact;
  events: EventListItem[];
  eventsLoading: boolean;
  initialObservationCreateRequest: number;
  onCreateFact: (data: CreateFactRequest) => Promise<void>;
  onCreateObservation: (data: CreateObservationRequest) => Promise<void>;
  onDeleteFact: (factId: ApiId) => Promise<void>;
  onDeleteObservation: (observationId: ApiId) => Promise<void>;
  onPinFact: (factId: ApiId) => Promise<void>;
  onPinObservation: (observationId: ApiId) => Promise<void>;
  onUnpinFact: (factId: ApiId) => Promise<void>;
  onUnpinObservation: (observationId: ApiId) => Promise<void>;
  onUpdateFact: (factId: ApiId, data: UpdateFactRequest) => Promise<void>;
  onUpdateObservation: (
    observationId: ApiId,
    data: UpdateObservationRequest,
  ) => Promise<void>;
};

type ContextEditor =
  | { kind: "fact"; fact?: ContextFact }
  | { kind: "observation"; observation?: ContextObservation }
  | null;

type PinMutation = {
  id: ApiId;
  kind: "fact" | "observation";
} | null;

type FactGroup = {
  category: ContextFact["category"];
  facts: ContextFact[];
  key: string;
  name: string;
};

type ContextContentLayout =
  | "both-empty"
  | "facts-only"
  | "observations-only"
  | "populated";

const observationTypeOptions: Array<{
  label: string;
  value: Exclude<ObservationType, null>;
}> = [
  { value: "notice", label: "Notice" },
  { value: "conversation_cue", label: "Conversation cue" },
  { value: "appreciation", label: "Appreciation" },
  { value: "change", label: "Change" },
];

const observationStatusOptions: Array<{
  label: string;
  value: ObservationStatus;
}> = [
  { value: "current", label: "Current" },
  { value: "revisit_later", label: "Revisit later" },
  { value: "archived", label: "Archived" },
];

export function ContactContextWorkspace({
  active,
  contact,
  events,
  eventsLoading,
  initialObservationCreateRequest,
  onCreateFact,
  onCreateObservation,
  onDeleteFact,
  onDeleteObservation,
  onPinFact,
  onPinObservation,
  onUnpinFact,
  onUnpinObservation,
  onUpdateFact,
  onUpdateObservation,
}: ContactContextWorkspaceProps) {
  const {
    activeFilterCount,
    clearFilters,
    factParams,
    filters,
    observationParams,
    search,
    setFilter,
    setSearch,
  } = useContactContextFilters();
  const [editor, setEditor] = useState<ContextEditor>(() =>
    initialObservationCreateRequest > 0 ? { kind: "observation" } : null,
  );
  const [pinMutation, setPinMutation] = useState<PinMutation>(null);
  const debouncedSearch = useDebounce(search, 300);
  const { factCategories, observationMarkers } = useLookups();
  const categories = useMemo(
    () => flattenFactCategories(factCategories),
    [factCategories],
  );
  const factsQuery = useContactFacts(
    contact.id,
    { ...factParams, search: debouncedSearch || undefined },
    { enabled: active },
  );
  const observationsQuery = useContactObservations(
    contact.id,
    { ...observationParams, search: debouncedSearch || undefined },
    { enabled: active },
  );

  const isHistoryMode = filters.status === "archived";
  const facts = useMemo(
    () => mapContextFacts(factsQuery.facts),
    [factsQuery.facts],
  );
  const observations = useMemo(
    () =>
      mapContextObservations(
        observationsQuery.observations,
        observationMarkers,
      ),
    [observationMarkers, observationsQuery.observations],
  );
  const groups = useMemo(() => groupFacts(facts), [facts]);
  const hasActiveQuery = activeFilterCount > 0;
  const visibleObservationCount = useMemo(
    () =>
      observations.filter((observation) =>
        isHistoryMode
          ? observation.status === "archived"
          : observation.status !== "archived",
      ).length,
    [isHistoryMode, observations],
  );
  const contextContentLayout: ContextContentLayout =
    !factsQuery.loading &&
    !observationsQuery.loading &&
    !factsQuery.error &&
    !observationsQuery.error &&
    !hasActiveQuery
      ? facts.length === 0 && visibleObservationCount === 0
        ? "both-empty"
        : facts.length > 0 && visibleObservationCount === 0
          ? "facts-only"
          : facts.length === 0 && visibleObservationCount > 0
            ? "observations-only"
            : "populated"
      : "populated";
  const bothEmpty = contextContentLayout === "both-empty";
  const fillsDesktopWorkspace = contextContentLayout === "populated";

  async function saveFact(data: CreateFactRequest) {
    if (editor?.kind === "fact" && editor.fact) {
      await onUpdateFact(editor.fact.id, data);
    } else {
      await onCreateFact(data);
    }
    await factsQuery.refetch();
    setEditor(null);
  }

  async function saveObservation(data: CreateObservationRequest) {
    if (editor?.kind === "observation" && editor.observation) {
      await onUpdateObservation(editor.observation.id, data);
    } else {
      await onCreateObservation(data);
    }
    await observationsQuery.refetch();
    setEditor(null);
  }

  async function removeFact(factId: ApiId) {
    await onDeleteFact(factId);
    await factsQuery.refetch();
  }

  async function removeObservation(observationId: ApiId) {
    await onDeleteObservation(observationId);
    await observationsQuery.refetch();
  }

  async function updateObservationStatus(
    observationId: ApiId,
    status: ObservationStatus,
  ) {
    await onUpdateObservation(observationId, { status });
    await observationsQuery.refetch();
  }

  async function toggleFactPin(fact: ContextFact) {
    setPinMutation({ kind: "fact", id: fact.id });
    try {
      if (fact.isPinned) {
        await onUnpinFact(fact.id);
      } else {
        await onPinFact(fact.id);
      }
      await factsQuery.refetch();
    } finally {
      setPinMutation(null);
    }
  }

  async function toggleObservationPin(observation: ContextObservation) {
    setPinMutation({ kind: "observation", id: observation.id });
    try {
      if (observation.isPinned) {
        await onUnpinObservation(observation.id);
      } else {
        await onPinObservation(observation.id);
      }
      await observationsQuery.refetch();
    } finally {
      setPinMutation(null);
    }
  }

  return (
    <section
      className="min-w-0 max-w-full xl:h-full xl:min-h-0"
      aria-labelledby="contact-context-title"
    >
      <ContactContentStack className="max-w-full xl:h-full">
        <ContactTabHeader
          headingId="contact-context-title"
          icon={BookHeart}
          title={`Context for ${contact.first_name || "this person"}`}
          subtitle="Details and observations that help you remember."
          controls={
            <div className="grid min-w-0 w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[minmax(12rem,1fr)_auto]">
              <div className="relative min-w-0">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search context"
                  className="h-9 bg-background pl-9"
                  value={search}
                  placeholder="Search context"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <ContextFilterPopover
                activeFilterCount={activeFilterCount}
                categories={categories}
                events={events}
                filters={filters}
                markers={observationMarkers}
                onClear={clearFilters}
                onChange={setFilter}
              />
            </div>
          }
          actions={
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 border-primary/35 text-primary-strong hover:bg-accent sm:flex-none"
                onClick={() => setEditor({ kind: "fact" })}
              >
                <Plus className="size-4" />
                Add fact
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 flex-1 border-destructive/35 text-destructive hover:bg-destructive/10 sm:flex-none"
                onClick={() => setEditor({ kind: "observation" })}
              >
                <Plus className="size-4" />
                Add observation
              </Button>
            </div>
          }
        />

        <div
          className={cn(
            "grid min-w-0 max-w-full content-start items-start gap-4 xl:min-h-0 xl:flex-1 xl:grid-cols-1 xl:overflow-y-auto xl:overscroll-y-contain",
            bothEmpty && "xl:grid-rows-2 xl:items-stretch",
            fillsDesktopWorkspace &&
              "xl:grid-rows-[minmax(12rem,1fr)_auto] xl:items-stretch",
          )}
          aria-label="Context workspace"
        >
          <FactsChannel
            balancedEmpty={bothEmpty}
            fillsDesktopWorkspace={fillsDesktopWorkspace}
            error={factsQuery.error?.message}
            facts={facts}
            groups={groups}
            hasActiveQuery={hasActiveQuery}
            hasMore={factsQuery.hasMore}
            loading={factsQuery.loading}
            loadingMore={factsQuery.loadingMore}
            totalCount={factsQuery.data?.count ?? null}
            onAdd={() => setEditor({ kind: "fact" })}
            onDelete={(factId) => void removeFact(factId)}
            onEdit={(fact) => setEditor({ kind: "fact", fact })}
            onLoadMore={() => void factsQuery.loadMore()}
            onPinChange={(fact) => void toggleFactPin(fact)}
            onRetry={() => void factsQuery.refetch()}
            pinningId={pinMutation?.kind === "fact" ? pinMutation.id : null}
          />
          <ObservationsChannel
            balancedEmpty={bothEmpty}
            contactFirstName={contact.first_name}
            error={observationsQuery.error?.message}
            hasActiveQuery={hasActiveQuery}
            historyMode={isHistoryMode}
            loading={observationsQuery.loading}
            observations={observations}
            onAdd={() => setEditor({ kind: "observation" })}
            onDelete={(observationId) => void removeObservation(observationId)}
            onEdit={(observation) =>
              setEditor({ kind: "observation", observation })
            }
            onPinChange={(observation) =>
              void toggleObservationPin(observation)
            }
            onRetry={() => void observationsQuery.refetch()}
            onStatusChange={(observationId, status) =>
              void updateObservationStatus(observationId, status)
            }
            onViewHistory={() => setFilter("status", "archived")}
            onViewCurrent={() => setFilter("status", "")}
            pinningId={
              pinMutation?.kind === "observation" ? pinMutation.id : null
            }
          />
        </div>
      </ContactContentStack>

      <ContextEditorSheet
        categories={categories}
        editor={editor}
        events={events}
        eventsLoading={eventsLoading}
        markers={observationMarkers}
        onClose={() => setEditor(null)}
        onSaveFact={saveFact}
        onSaveObservation={saveObservation}
      />
    </section>
  );
}

function FactsChannel({
  balancedEmpty,
  fillsDesktopWorkspace,
  error,
  facts,
  groups,
  hasActiveQuery,
  hasMore,
  loading,
  loadingMore,
  onAdd,
  onDelete,
  onEdit,
  onLoadMore,
  onPinChange,
  onRetry,
  pinningId,
  totalCount,
}: {
  balancedEmpty: boolean;
  fillsDesktopWorkspace: boolean;
  error: string | undefined;
  facts: ContextFact[];
  groups: FactGroup[];
  hasActiveQuery: boolean;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  onAdd: () => void;
  onDelete: (factId: ApiId) => void;
  onEdit: (fact: ContextFact) => void;
  onLoadMore: () => void;
  onPinChange: (fact: ContextFact) => void;
  onRetry: () => void;
  pinningId: ApiId | null;
  totalCount: number | null;
}) {
  const count = totalCount ?? facts.length;

  return (
    <ContactSectionCard
      asChild
      density="standard"
      className={cn(
        balancedEmpty || fillsDesktopWorkspace
          ? "xl:h-full xl:min-h-0 xl:max-h-none"
          : "xl:max-h-60",
      )}
    >
      <section className="flex flex-col" aria-labelledby="what-i-know-title">
        <ContactSectionHeader
          headingId="what-i-know-title"
          icon={BookOpen}
          iconTone="violet"
          title="What I know"
          subtitle="Durable facts that stay useful over time."
          action={
            <span className="shrink-0 rounded-full bg-info-muted px-2 py-0.5 text-xs font-medium text-info">
              {count} {count === 1 ? "fact" : "facts"}
            </span>
          }
        />

        <div
          className={cn(
            "mt-3 min-w-0 space-y-1.5 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-y-contain xl:pr-1",
            balancedEmpty && "xl:flex xl:flex-col xl:justify-center",
          )}
          aria-live="polite"
        >
          {loading && <FactsChannelSkeleton />}
          {!loading && error && (
            <ChannelError message={error} onRetry={onRetry} />
          )}
          {!loading && !error && facts.length === 0 && (
            <FactsEmptyState
              centered={balancedEmpty}
              hasActiveQuery={hasActiveQuery}
              onAdd={onAdd}
            />
          )}
          {!loading &&
            !error &&
            groups.map((group) => (
              <FactGroupCard
                key={group.key}
                group={group}
                onDelete={onDelete}
                onEdit={onEdit}
                onPinChange={onPinChange}
                pinningId={pinningId}
              />
            ))}

          {!loading && !error && hasMore && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              disabled={loadingMore}
              onClick={onLoadMore}
            >
              {loadingMore && (
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
              )}
              Load more facts
            </Button>
          )}
        </div>
      </section>
    </ContactSectionCard>
  );
}

function FactsChannelSkeleton() {
  return (
    <div className="space-y-1.5" aria-label="Loading facts">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-14 animate-pulse rounded-md border border-border/70 bg-muted/35 motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function FactsEmptyState({
  centered,
  hasActiveQuery,
  onAdd,
}: {
  centered: boolean;
  hasActiveQuery: boolean;
  onAdd: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2.5",
        centered && "xl:mx-auto xl:w-full xl:max-w-sm",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <ClipboardList
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="min-w-0 text-muted-foreground">
          {hasActiveQuery
            ? "No facts match these filters."
            : "No facts saved yet."}
        </p>
      </div>
      {!hasActiveQuery && (
        <Button type="button" size="xs" variant="outline" onClick={onAdd}>
          <Plus className="size-3" />
          Add fact
        </Button>
      )}
    </div>
  );
}

function FactGroupCard({
  group,
  onDelete,
  onEdit,
  onPinChange,
  pinningId,
}: {
  group: FactGroup;
  onDelete: (factId: ApiId) => void;
  onEdit: (fact: ContextFact) => void;
  onPinChange: (fact: ContextFact) => void;
  pinningId: ApiId | null;
}) {
  const presentation = getFactCategoryPresentation(group.category);
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();

  return (
    <section
      className="min-w-0 max-w-full overflow-hidden rounded-md border border-border bg-card"
      aria-label={`${presentation.label} facts`}
    >
      <FactCategoryHeader
        contentId={contentId}
        count={group.facts.length}
        expanded={expanded}
        presentation={presentation}
        onToggle={() => setExpanded((value) => !value)}
      />
      {expanded && (
        <dl id={contentId} className="divide-y divide-border/60">
          {group.facts.map((fact) => {
            const pinPresentation = getPinPresentation(
              fact.isPinned,
              idsMatch(pinningId, fact.id),
            );

            return (
              <div
                key={fact.id}
                className={cn(
                  "group/fact grid min-h-9 items-center gap-2 px-2.5 py-0.5 transition-colors hover:bg-surface-muted/55",
                  fact.label
                    ? "grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_auto]"
                    : "grid-cols-[minmax(0,1fr)_auto]",
                )}
              >
                {fact.label && (
                  <dt
                    title={fact.label}
                    className="min-w-0 truncate text-xs font-medium leading-4 text-muted-foreground"
                  >
                    {fact.label}
                  </dt>
                )}
                <dd
                  title={fact.value}
                  className="min-w-0 truncate text-right text-xs font-medium leading-4 text-foreground"
                >
                  {fact.value}
                </dd>
                <div className="flex shrink-0 items-center gap-0.5">
                  <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/fact:opacity-100 sm:group-focus-within/fact:opacity-100">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Edit fact"
                      onClick={() => onEdit(fact)}
                    >
                      <Edit3 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete fact"
                      onClick={() => onDelete(fact.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <PinnedStateIndicator
                    presentation={pinPresentation}
                    onClick={() => onPinChange(fact)}
                  />
                </div>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

function ObservationsChannel({
  balancedEmpty,
  contactFirstName,
  error,
  hasActiveQuery,
  historyMode,
  loading,
  observations,
  onAdd,
  onDelete,
  onEdit,
  onPinChange,
  onRetry,
  onStatusChange,
  onViewCurrent,
  onViewHistory,
  pinningId,
}: {
  balancedEmpty: boolean;
  contactFirstName: string;
  error: string | undefined;
  hasActiveQuery: boolean;
  historyMode: boolean;
  loading: boolean;
  observations: ContextObservation[];
  onAdd: () => void;
  onDelete: (observationId: ApiId) => void;
  onEdit: (observation: ContextObservation) => void;
  onPinChange: (observation: ContextObservation) => void;
  onRetry: () => void;
  onStatusChange: (observationId: ApiId, status: ObservationStatus) => void;
  onViewCurrent: () => void;
  onViewHistory: () => void;
  pinningId: ApiId | null;
}) {
  const visibleObservations = observations.filter((observation) =>
    historyMode
      ? observation.status === "archived"
      : observation.status !== "archived",
  );
  const previewObservations = visibleObservations.slice(0, 3);

  return (
    <ContactSectionCard
      asChild
      density="standard"
      className={cn(balancedEmpty && "xl:h-full xl:min-h-0")}
    >
      <section className="flex flex-col" aria-labelledby="what-i-notice-title">
        <ContactSectionHeader
          headingId="what-i-notice-title"
          icon={MessageSquareText}
          iconTone="violet"
          title="What I notice"
          subtitle="Time-oriented observations from recent moments."
          action={
            <Button
              type="button"
              variant="link"
              size="xs"
              className="px-0 text-primary-strong"
              onClick={historyMode ? onViewCurrent : onViewHistory}
            >
              {historyMode
                ? "View current context"
                : "View observation history"}
              <span aria-hidden="true">→</span>
            </Button>
          }
        />

        <div
          className={cn(
            "mt-3",
            balancedEmpty &&
              "xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:justify-center",
          )}
          aria-live="polite"
        >
          {loading && <ObservationsChannelSkeleton />}
          {!loading && error && (
            <ChannelError message={error} onRetry={onRetry} />
          )}
          {!loading && !error && visibleObservations.length === 0 && (
            <ObservationsEmptyState
              centered={balancedEmpty}
              hasActiveQuery={hasActiveQuery}
              historyMode={historyMode}
              onAdd={onAdd}
            />
          )}
          {!loading && !error && visibleObservations.length > 0 && (
            <ol className="space-y-2">
              {previewObservations.map((observation, index) => (
                <ObservationTimelineItem
                  key={observation.id}
                  contactFirstName={contactFirstName}
                  hasNext={index < previewObservations.length - 1}
                  observation={observation}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onPinChange={onPinChange}
                  onStatusChange={onStatusChange}
                  pinning={idsMatch(pinningId, observation.id)}
                />
              ))}
            </ol>
          )}
        </div>
      </section>
    </ContactSectionCard>
  );
}

function ObservationsChannelSkeleton() {
  return (
    <div className="space-y-2" aria-label="Loading observations">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-md border border-border/70 bg-muted/35 motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function ObservationsEmptyState({
  centered,
  hasActiveQuery,
  historyMode,
  onAdd,
}: {
  centered: boolean;
  hasActiveQuery: boolean;
  historyMode: boolean;
  onAdd: () => void;
}) {
  const copy = historyMode
    ? "No archived observations."
    : hasActiveQuery
      ? "No observations match these filters."
      : "No observations yet.";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2.5",
        centered && "xl:mx-auto xl:w-full xl:max-w-sm",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <MessageSquareText className="size-4 shrink-0" aria-hidden="true" />
        <p>{copy}</p>
      </div>
      {!hasActiveQuery && !historyMode && (
        <Button type="button" size="xs" variant="outline" onClick={onAdd}>
          <Plus className="size-3" />
          Add observation
        </Button>
      )}
    </div>
  );
}

function ObservationTimelineItem({
  contactFirstName,
  hasNext,
  observation,
  onDelete,
  onEdit,
  onPinChange,
  onStatusChange,
  pinning,
}: {
  contactFirstName: string;
  hasNext: boolean;
  observation: ContextObservation;
  onDelete: (observationId: ApiId) => void;
  onEdit: (observation: ContextObservation) => void;
  onPinChange: (observation: ContextObservation) => void;
  onStatusChange: (observationId: ApiId, status: ObservationStatus) => void;
  pinning: boolean;
}) {
  const presentation = getObservationPresentation(
    observation,
    observation.marker,
    pinning,
  );
  const occurredOn = observation.occurredAt || observation.recordedAt;
  const eventMetadata = observation.event
    ? formatObservationEventMetadata(
        observation.event.title,
        observation.event.occurredAt,
        contactFirstName,
      )
    : null;

  return (
    <li
      className={cn(
        "relative grid grid-cols-[2.25rem_1.75rem_minmax(0,1fr)] gap-1.5 sm:grid-cols-[3rem_2rem_minmax(0,1fr)] sm:gap-2",
        hasNext &&
          "after:absolute after:top-7 after:-bottom-2 after:left-14 after:w-px after:bg-border/80 sm:after:left-18",
      )}
    >
      <time
        dateTime={occurredOn ?? undefined}
        className="pt-1 text-right text-[11px] leading-4 text-muted-foreground"
      >
        {formatTimelineDate(occurredOn)}
      </time>
      <ObservationTimelineNode
        presentation={presentation.primary}
        className="mt-1"
      />
      <ObservationStatusSurface
        presentation={presentation.status}
        variant="standardCard"
        className="min-w-0 max-w-full rounded-md border px-2.5 py-2 shadow-xs"
      >
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <ObservationStatusTag presentation={presentation.status} />
            <ObservationTypeTag presentation={presentation.primary} />
            {observation.isPinned && (
              <PinnedStateTag presentation={presentation.pin} />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <PinnedStateIndicator
              presentation={presentation.pin}
              onClick={() => onPinChange(observation)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Observation actions"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEdit(observation)}>
                  <Edit3 className="size-4" />
                  Edit observation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {observation.status === "archived" ? (
                  <DropdownMenuItem
                    onSelect={() => onStatusChange(observation.id, "current")}
                  >
                    <ArchiveRestore className="size-4" />
                    Restore to current
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onSelect={() => onStatusChange(observation.id, "archived")}
                  >
                    <Archive className="size-4" />
                    Archive observation
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(observation.id)}
                >
                  <Trash2 className="size-4" />
                  Delete observation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p
          title={observation.body}
          className="mt-1 line-clamp-1 text-sm leading-4 [overflow-wrap:anywhere]"
        >
          {observation.body}
        </p>
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] leading-4 text-muted-foreground sm:flex-nowrap">
          {observation.event && eventMetadata && (
            <SourceEventChip
              presentation={presentation.sourceEvent!}
              href={`/events/${observation.event.id}`}
              label={eventMetadata}
              className="sm:max-w-72"
            />
          )}
          {observation.recordedAt && (
            <span
              className="shrink-0"
              title={formatDate(observation.recordedAt)}
            >
              Recorded {formatDate(observation.recordedAt)}
            </span>
          )}
        </div>
      </ObservationStatusSurface>
    </li>
  );
}

function ContextFilterPopover({
  activeFilterCount,
  categories,
  events,
  filters,
  markers,
  onChange,
  onClear,
}: {
  activeFilterCount: number;
  categories: FactCategory[];
  events: EventListItem[];
  filters: {
    category: string;
    event: string;
    marker: string;
    observationType: Exclude<ObservationType, null> | "";
    occurredAfter: string;
    occurredBefore: string;
    status: ObservationStatus | "";
  };
  markers: ObservationMarker[];
  onChange: (
    key:
      | "category"
      | "event"
      | "marker"
      | "observationType"
      | "occurredAfter"
      | "occurredBefore"
      | "status",
    value: string,
  ) => void;
  onClear: () => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={
            activeFilterCount
              ? `Filter context, ${activeFilterCount} active filters`
              : "Filter context"
          }
        >
          <Filter className="size-4" />
          {activeFilterCount ? `Filter · ${activeFilterCount}` : "Filter"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[min(34rem,calc(100vh-2rem))] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto"
      >
        <PopoverHeader>
          <PopoverTitle>Context filters</PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-3">
          <FilterField label="Fact category">
            <select
              value={filters.category}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              onChange={(event) => onChange("category", event.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Observation status">
            <select
              value={filters.status}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              onChange={(event) => onChange("status", event.target.value)}
            >
              <option value="">Current context</option>
              {observationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Observation type">
            <select
              value={filters.observationType}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              onChange={(event) =>
                onChange("observationType", event.target.value)
              }
            >
              <option value="">All types</option>
              {observationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Marker">
            <select
              value={filters.marker}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              onChange={(event) => onChange("marker", event.target.value)}
            >
              <option value="">All markers</option>
              {markers.map((marker) => (
                <option key={marker.id} value={String(marker.id)}>
                  {marker.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Linked Event">
            <select
              value={filters.event}
              className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
              onChange={(event) => onChange("event", event.target.value)}
            >
              <option value="">All shared Events</option>
              {events.map((event) => (
                <option key={event.id} value={String(event.id)}>
                  {event.title || "Untitled event"}
                </option>
              ))}
            </select>
          </FilterField>
          <div className="grid grid-cols-2 gap-2">
            <FilterField label="Occurred after">
              <Input
                type="date"
                value={filters.occurredAfter}
                onChange={(event) =>
                  onChange("occurredAfter", event.target.value)
                }
              />
            </FilterField>
            <FilterField label="Occurred before">
              <Input
                type="date"
                value={filters.occurredBefore}
                onChange={(event) =>
                  onChange("occurredBefore", event.target.value)
                }
              />
            </FilterField>
          </div>
          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onClear}
            >
              Clear filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ContextEditorSheet({
  categories,
  editor,
  events,
  eventsLoading,
  markers,
  onClose,
  onSaveFact,
  onSaveObservation,
}: {
  categories: FactCategory[];
  editor: ContextEditor;
  events: EventListItem[];
  eventsLoading: boolean;
  markers: ObservationMarker[];
  onClose: () => void;
  onSaveFact: (data: CreateFactRequest) => Promise<void>;
  onSaveObservation: (data: CreateObservationRequest) => Promise<void>;
}) {
  const isFact = editor?.kind === "fact";
  const editing = Boolean(
    editor && (isFact ? editor.fact : editor.observation),
  );

  return (
    <Sheet open={editor !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {editing ? "Edit" : "Add"} {isFact ? "fact" : "observation"}
          </SheetTitle>
          <SheetDescription>
            {isFact
              ? "Save a durable detail that will remain useful over time."
              : "Capture a time-oriented observation from a real moment."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {editor?.kind === "fact" ? (
            <FactEditor
              key={`fact-${editor.fact?.id ?? "new"}`}
              categories={categories}
              fact={editor.fact}
              onCancel={onClose}
              onSubmit={onSaveFact}
            />
          ) : editor?.kind === "observation" ? (
            <ObservationEditor
              key={`observation-${editor.observation?.id ?? "new"}`}
              events={events}
              eventsLoading={eventsLoading}
              markers={markers}
              observation={editor.observation}
              onCancel={onClose}
              onSubmit={onSaveObservation}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FactEditor({
  categories,
  fact,
  onCancel,
  onSubmit,
}: {
  categories: FactCategory[];
  fact?: ContextFact;
  onCancel: () => void;
  onSubmit: (data: CreateFactRequest) => Promise<void>;
}) {
  const [category, setCategory] = useState(
    fact?.category == null ? "" : String(fact.category.id),
  );
  const [label, setLabel] = useState(fact?.label ?? "");
  const [value, setValue] = useState(fact?.value || "");
  const [isConversationCue, setIsConversationCue] = useState(
    fact?.isConversationCue ?? false,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) {
      setError("Add a fact value before saving.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        category: category || null,
        label: label.trim() || null,
        detail_value: value.trim(),
        is_conversation_cue: isConversationCue,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <FilterField label="Category">
        <select
          value={category}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Uncategorized</option>
          {categories.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name}
            </option>
          ))}
        </select>
      </FilterField>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <FilterField label="Fact label">
          <Input
            value={label}
            autoFocus
            placeholder="Coffee"
            onChange={(event) => setLabel(event.target.value)}
          />
        </FilterField>
        <FilterField label="Fact value">
          <Input
            value={value}
            placeholder="Oat milk"
            onChange={(event) => setValue(event.target.value)}
          />
        </FilterField>
      </div>
      <label className="flex items-start gap-3 rounded-md border border-border bg-muted/35 p-3 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-primary"
          checked={isConversationCue}
          onChange={(event) => setIsConversationCue(event.target.checked)}
        />
        <span>
          <span className="block font-medium">Useful next time</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Include this detail in the compact contact preview for a future
            conversation.
          </span>
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <EditorActions
        submitting={submitting}
        onCancel={onCancel}
        label={fact ? "Save fact" : "Add fact"}
      />
    </form>
  );
}

function ObservationEditor({
  events,
  eventsLoading,
  markers,
  observation,
  onCancel,
  onSubmit,
}: {
  events: EventListItem[];
  eventsLoading: boolean;
  markers: ObservationMarker[];
  observation?: ContextObservation;
  onCancel: () => void;
  onSubmit: (data: CreateObservationRequest) => Promise<void>;
}) {
  const [body, setBody] = useState(observation?.body ?? "");
  const [marker, setMarker] = useState(
    observation?.marker == null ? "" : String(observation.marker.id),
  );
  const [type, setType] = useState<Exclude<ObservationType, null> | "">(
    observation?.type === "unknown" ? "" : (observation?.type ?? ""),
  );
  const [status, setStatus] = useState<ObservationStatus>(
    observation?.status ?? "current",
  );
  const [occurredAt, setOccurredAt] = useState(
    toDateTimeInputValue(observation?.occurredAt),
  );
  const [event, setEvent] = useState(
    observation?.event == null ? "" : String(observation.event.id),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!body.trim()) {
      setError("Add an observation before saving.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({
        body: body.trim(),
        marker: marker || null,
        observation_type: type || null,
        status,
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : null,
        event: event || null,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <FilterField label="Observation">
        <textarea
          value={body}
          rows={5}
          autoFocus
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="What did you notice?"
          onChange={(event) => setBody(event.target.value)}
        />
      </FilterField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterField label="Marker">
          <select
            value={marker}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) => setMarker(event.target.value)}
          >
            <option value="">No marker</option>
            {markers.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Observation type">
          <select
            value={type}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) =>
              setType(event.target.value as Exclude<ObservationType, null> | "")
            }
          >
            <option value="">No type</option>
            {observationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FilterField label="Status">
          <select
            value={status}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) =>
              setStatus(event.target.value as ObservationStatus)
            }
          >
            {observationStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Occurred at">
          <Input
            type="datetime-local"
            value={occurredAt}
            onChange={(event) => setOccurredAt(event.target.value)}
          />
        </FilterField>
      </div>
      <FilterField label="Linked Event">
        <select
          value={event}
          disabled={eventsLoading}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(eventChange) => setEvent(eventChange.target.value)}
        >
          <option value="">
            {eventsLoading
              ? "Loading shared Events..."
              : events.length
                ? "No linked Event"
                : "No shared Events available"}
          </option>
          {events.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.title || "Untitled event"} ·{" "}
              {formatDate(item.event_timestamp)}
            </option>
          ))}
        </select>
      </FilterField>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <EditorActions
        submitting={submitting}
        onCancel={onCancel}
        label={observation ? "Save observation" : "Add observation"}
      />
    </form>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Label className="grid gap-1.5 text-xs font-medium text-foreground">
      {label}
      {children}
    </Label>
  );
}

function ChannelError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 p-4"
    >
      <p className="text-sm font-medium">Unable to load this context.</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}

function EditorActions({
  label,
  onCancel,
  submitting,
}: {
  label: string;
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-border pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={submitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={submitting}>
        {submitting && (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
        )}
        {label}
      </Button>
    </div>
  );
}

function groupFacts(facts: ContextFact[]): FactGroup[] {
  const groups = new Map<string, FactGroup>();
  for (const fact of facts) {
    const key = fact.category
      ? `category-${String(fact.category.id)}`
      : "uncategorized";
    const existing = groups.get(key);
    if (existing) {
      existing.facts.push(fact);
      continue;
    }
    groups.set(key, {
      key,
      category: fact.category,
      name: fact.category?.name || "Things to remember",
      facts: [fact],
    });
  }
  return [...groups.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function idsMatch(
  left: ApiId | null | undefined,
  right: ApiId | null | undefined,
): boolean {
  return left != null && right != null && String(left) === String(right);
}

function formatTimelineDate(value: string | null): ReactNode {
  if (!value) {
    return "Date unavailable";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return (
    <>
      <span className="block">
        {new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
        }).format(date)}
      </span>
      <span className="block">{date.getFullYear()}</span>
    </>
  );
}

function formatCompactDate(value: string | null): string {
  if (!value) {
    return "Date unavailable";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatObservationEventMetadata(
  title: string,
  occurredAt: string | null,
  contactFirstName: string,
): string {
  const compactTitle = formatObservationEventTitle(title, contactFirstName);
  const compactDate = formatCompactDate(occurredAt);

  return compactDate === "Date unavailable"
    ? compactTitle
    : `${compactTitle} · ${compactDate}`;
}

function formatObservationEventTitle(
  title: string,
  contactFirstName: string,
): string {
  const withoutDemoPrefix = title.replace(/^demo:\s*/i, "").trim();
  const escapedFirstName = contactFirstName.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const redundantContactSuffix = new RegExp(
    `\\s+with\\s+${escapedFirstName}\\s*$`,
    "i",
  );
  const compactTitle = withoutDemoPrefix
    .replace(redundantContactSuffix, "")
    .trim();

  return compactTitle || "Untitled event";
}

function toDateTimeInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return offsetDate.toISOString().slice(0, 16);
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Unable to save your changes. Please try again.";
}
