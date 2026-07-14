"use client";

import Link from "next/link";
import {
  type FocusEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  CalendarDays,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { ContactTabHeader } from "@/components/contacts/ContactTabHeader";
import { ContactContentStack } from "@/components/contacts/surfaces/ContactContentStack";
import { ContactHelperStack } from "@/components/contacts/surfaces/ContactHelperStack";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { EventIconTile } from "@/components/presentation/EventIconTile";
import { EventSemanticChip } from "@/components/presentation/EventSemanticChip";
import { FactCategoryIconTile } from "@/components/presentation/FactCategoryIconTile";
import { JournalStateIndicator } from "@/components/presentation/JournalStateIndicator";
import { ObservationIconTile } from "@/components/presentation/ObservationIconTile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useContactEvents,
  type ContactEventListParams,
} from "@/hooks/useContactEvents";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";
import { getEventPresentation } from "@/lib/presentation/eventPresentation";
import { getFactCategoryPresentation } from "@/lib/presentation/factPresentation";
import { getJournalStatePresentation } from "@/lib/presentation/journalStatePresentation";
import { getObservationPresentation } from "@/lib/presentation/observationPresentation";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contacts";
import type { EventListItem, EventTier } from "@/types/events";
import type { ContactOverviewModel } from "./overview/contact-overview-utils";
import {
  isTimelineIndexExpanded,
  nextExpandedWindowStart,
  TIMELINE_EXPANDED_WINDOW_SIZE,
} from "./timeline-window";

const pageSize = 8;

type DateRangeFilter = "all" | "upcoming" | "past" | "this_month";
type TierFilter = "all" | EventTier;
type JournaledFilter = "all" | "journaled" | "not_journaled";

type TimelinePanelProps = {
  contact: Contact;
  model: ContactOverviewModel;
  onAddObservation: () => void;
};

type PendingAnchor = {
  eventId: string;
  index: number;
  top: number;
};

type TimelineFocusBand = {
  bottom: number;
  center: number;
  top: number;
};

type TimelineFocusSource = "direct" | "scroll";

export function TimelinePanel({
  contact,
  model,
  onAddObservation,
}: TimelinePanelProps) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [journaled, setJournaled] = useState<JournaledFilter>("all");
  const [contextCategory, setContextCategory] = useState("all");
  const [now] = useState(() => new Date());
  const debouncedSearch = useDebounce(search, 300);
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const { contextCategories, isLoading: lookupsLoading } = useLookups();
  const rowElements = useRef(new Map<string, HTMLElement>());
  const nodeElements = useRef(new Map<string, HTMLSpanElement>());
  const timelineListRef = useRef<HTMLDivElement>(null);
  const timelineConnectorRef = useRef<HTMLSpanElement>(null);
  const timelineScrollRootRef = useRef<HTMLDivElement>(null);
  const pendingAnchor = useRef<PendingAnchor | null>(null);
  const expandedStartRef = useRef(0);
  const keyboardFocusedIndexRef = useRef<number | null>(null);
  const activeTimelineIndexRef = useRef<number | null>(null);
  const observedIndices = useRef(new Set<number>());

  const dateParams = useMemo(
    () => buildDateRangeParams(dateRange, now),
    [dateRange, now],
  );
  const queryParams = useMemo<ContactEventListParams>(
    () => ({
      search: debouncedSearch || undefined,
      event_after: dateParams.event_after,
      event_before: dateParams.event_before,
      tier: tier === "all" ? undefined : tier,
      context_category: contextCategory === "all" ? undefined : contextCategory,
      journaled: journaled === "all" ? undefined : journaled === "journaled",
      page_size: pageSize,
    }),
    [
      contextCategory,
      dateParams.event_after,
      dateParams.event_before,
      debouncedSearch,
      journaled,
      tier,
    ],
  );
  const filterKey = useMemo(() => JSON.stringify(queryParams), [queryParams]);
  const expansionModeKey = `${filterKey}|${
    isDesktop && !prefersReducedMotion ? "observer" : "static"
  }`;
  const [expandedWindow, setExpandedWindow] = useState({
    key: expansionModeKey,
    start: 0,
  });
  const [focusedEventId, setFocusedEventId] = useState<string | null>(null);
  const expandedStart =
    expandedWindow.key === expansionModeKey ? expandedWindow.start : 0;
  const {
    data,
    events,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    refetch,
  } = useContactEvents(contact.id, queryParams);
  const {
    events: upcomingEvents,
    loading: upcomingLoading,
    error: upcomingError,
    refetch: refetchUpcoming,
  } = useContactEvents(contact.id, {
    event_after: now.toISOString(),
    ordering: "event_timestamp",
    page_size: 2,
  });

  const activeFilterCount = [
    dateRange !== "all",
    tier !== "all",
    journaled !== "all",
    contextCategory !== "all",
  ].filter(Boolean).length;
  const advancedFilterCount = [
    tier !== "all",
    journaled !== "all",
    contextCategory !== "all",
  ].filter(Boolean).length;
  const resultCount = data?.count ?? events.length;
  const isInitialLoading = loading && events.length === 0;
  const hasActiveQuery = Boolean(search) || activeFilterCount > 0;

  const updateTimelineConnector = useCallback(() => {
    const list = timelineListRef.current;
    const connector = timelineConnectorRef.current;
    const firstEvent = events[0];
    const lastEvent = events.at(-1);
    const firstNode = firstEvent
      ? nodeElements.current.get(String(firstEvent.id))
      : null;
    const lastNode = lastEvent
      ? nodeElements.current.get(String(lastEvent.id))
      : null;

    if (!list || !connector || !firstNode || !lastNode || events.length < 2) {
      if (connector) {
        connector.style.opacity = "0";
        connector.style.height = "0px";
      }
      return;
    }

    const listRect = list.getBoundingClientRect();
    const firstRect = firstNode.getBoundingClientRect();
    const lastRect = lastNode.getBoundingClientRect();
    const start = firstRect.top + firstRect.height / 2 - listRect.top;
    const end = lastRect.top + lastRect.height / 2 - listRect.top;

    connector.style.left = `${firstRect.left + firstRect.width / 2 - listRect.left}px`;
    connector.style.top = `${start}px`;
    connector.style.height = `${Math.max(0, end - start)}px`;
    connector.style.opacity = "1";
  }, [events]);

  useLayoutEffect(() => {
    if (events.length < 2) {
      return;
    }

    const animationFrame = requestAnimationFrame(updateTimelineConnector);
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateTimelineConnector);
    const list = timelineListRef.current;

    if (list) {
      resizeObserver?.observe(list);
    }
    for (const event of events) {
      const node = nodeElements.current.get(String(event.id));
      if (node) {
        resizeObserver?.observe(node);
      }
    }
    window.addEventListener("resize", updateTimelineConnector);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateTimelineConnector);
    };
  }, [events, expandedStart, updateTimelineConnector]);

  useLayoutEffect(() => {
    expandedStartRef.current = expandedStart;
  }, [expandedStart]);

  const commitExpandedStart = useCallback(
    (nextStart: number, anchorIndex: number, protectFocusedEvent = true) => {
      const maximumStart = Math.max(
        0,
        events.length - TIMELINE_EXPANDED_WINDOW_SIZE,
      );
      const clampedStart = Math.max(0, Math.min(nextStart, maximumStart));
      const focusedIndex = keyboardFocusedIndexRef.current;

      if (
        protectFocusedEvent &&
        focusedIndex !== null &&
        !isTimelineIndexExpanded(focusedIndex, clampedStart, events.length)
      ) {
        return false;
      }

      if (clampedStart === expandedStartRef.current) {
        return true;
      }

      const root = timelineScrollRootRef.current;
      const anchorEvent = events[anchorIndex];
      const anchorElement = anchorEvent
        ? rowElements.current.get(String(anchorEvent.id))
        : null;

      if (root && anchorElement) {
        pendingAnchor.current = {
          eventId: String(anchorEvent.id),
          index: anchorIndex,
          top:
            anchorElement.getBoundingClientRect().top -
            root.getBoundingClientRect().top,
        };
      }

      expandedStartRef.current = clampedStart;
      setExpandedWindow({ key: expansionModeKey, start: clampedStart });
      return true;
    },
    [events, expansionModeKey],
  );

  const getTimelineFocusBand = useCallback(
    (root: HTMLDivElement): TimelineFocusBand => {
      const rootRect = root.getBoundingClientRect();
      const rootHeight = root.clientHeight;
      // The toolbar is a sibling above this scroll root, so keep the focus
      // band centered within the event stream rather than accounting for it.
      const topInset = Math.max(48, Math.min(rootHeight * 0.28, 112));
      const bottomInset = Math.max(48, Math.min(rootHeight * 0.32, 144));
      const top = rootRect.top + topInset;
      const bottom = Math.max(top + 1, rootRect.bottom - bottomInset);

      return {
        top,
        bottom,
        center: top + (bottom - top) / 2,
      };
    },
    [],
  );

  const getClosestTimelineCandidate = useCallback(
    (root: HTMLDivElement, allowedIndices?: Set<number>) => {
      const band = getTimelineFocusBand(root);
      let candidate:
        | { center: number; distance: number; index: number }
        | undefined;

      for (const [index, event] of events.entries()) {
        if (allowedIndices && !allowedIndices.has(index)) {
          continue;
        }

        const element = rowElements.current.get(String(event.id));
        if (!element) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        if (rect.bottom < band.top || rect.top > band.bottom) {
          continue;
        }

        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - band.center);
        if (!candidate || distance < candidate.distance) {
          candidate = { center, distance, index };
        }
      }

      if (!candidate) {
        return null;
      }

      const maxOutsideDistance = (band.bottom - band.top) / 2 + 48;
      if (
        (candidate.center < band.top || candidate.center > band.bottom) &&
        candidate.distance > maxOutsideDistance
      ) {
        return null;
      }

      return { ...candidate, band };
    },
    [events, getTimelineFocusBand],
  );

  const focusTimelineIndex = useCallback(
    (index: number, source: TimelineFocusSource, band?: TimelineFocusBand) => {
      const event = events[index];
      if (!event) {
        return;
      }

      const maximumStart = Math.max(
        0,
        events.length - TIMELINE_EXPANDED_WINDOW_SIZE,
      );
      const nextStart =
        source === "direct"
          ? Math.max(0, Math.min(index - 2, maximumStart))
          : nextExpandedWindowStart(
              expandedStartRef.current,
              index,
              events.length,
            );

      const activeIndex = activeTimelineIndexRef.current;
      if (
        source === "scroll" &&
        band &&
        activeIndex !== null &&
        activeIndex !== index
      ) {
        const activeEvent = events[activeIndex];
        const activeElement = activeEvent
          ? rowElements.current.get(String(activeEvent.id))
          : null;
        const candidateElement = rowElements.current.get(String(event.id));

        if (activeElement && candidateElement) {
          const activeRect = activeElement.getBoundingClientRect();
          const candidateRect = candidateElement.getBoundingClientRect();
          const activeCenter = activeRect.top + activeRect.height / 2;
          const candidateCenter = candidateRect.top + candidateRect.height / 2;
          const activeDistance = Math.abs(activeCenter - band.center);
          const candidateDistance = Math.abs(candidateCenter - band.center);
          const activeWithinDeadZone =
            activeCenter >= band.top - 36 && activeCenter <= band.bottom + 36;

          if (
            activeWithinDeadZone &&
            candidateDistance + 36 >= activeDistance
          ) {
            return;
          }
        }
      }

      const committed = commitExpandedStart(
        nextStart,
        index,
        source !== "direct",
      );
      if (!committed) {
        return;
      }

      activeTimelineIndexRef.current = index;
      setFocusedEventId(String(event.id));
    },
    [commitExpandedStart, events],
  );

  useLayoutEffect(() => {
    let animationFrame: number | null = null;
    const anchor = pendingAnchor.current;
    const root = timelineScrollRootRef.current;
    const anchorElement = anchor
      ? rowElements.current.get(anchor.eventId)
      : null;

    if (anchor && root && anchorElement) {
      const nextTop =
        anchorElement.getBoundingClientRect().top -
        root.getBoundingClientRect().top;
      root.scrollTop += nextTop - anchor.top;
    }

    pendingAnchor.current = null;
    if (anchor) {
      const nextStart = nextExpandedWindowStart(
        expandedStartRef.current,
        anchor.index,
        events.length,
      );
      if (nextStart !== expandedStartRef.current) {
        animationFrame = requestAnimationFrame(() => {
          focusTimelineIndex(anchor.index, "scroll");
        });
      }
    }

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [expandedStart, events, focusTimelineIndex]);

  useLayoutEffect(() => {
    expandedStartRef.current = 0;
    activeTimelineIndexRef.current = null;
    observedIndices.current.clear();
    const root = timelineScrollRootRef.current;
    if (root) {
      root.scrollTop = 0;
    }
  }, [filterKey]);

  useEffect(() => {
    const root = timelineScrollRootRef.current;
    if (
      !root ||
      !isDesktop ||
      prefersReducedMotion ||
      events.length <= TIMELINE_EXPANDED_WINDOW_SIZE ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const activeIndices = observedIndices.current;
    activeIndices.clear();
    const rootHeight = root.clientHeight;
    const topInset = Math.max(48, Math.min(rootHeight * 0.28, 112));
    const bottomInset = Math.max(48, Math.min(rootHeight * 0.32, 144));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.timelineIndex,
          );
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            activeIndices.add(index);
          } else if (!entry.isIntersecting || entry.intersectionRatio <= 0.25) {
            activeIndices.delete(index);
          }
        }

        const candidate = getClosestTimelineCandidate(root, activeIndices);
        if (candidate) {
          focusTimelineIndex(candidate.index, "scroll", candidate.band);
        }
      },
      {
        root,
        rootMargin: `${-Math.round(topInset)}px 0px ${-Math.round(
          bottomInset,
        )}px 0px`,
        threshold: [0, 0.25, 0.6],
      },
    );

    for (const event of events) {
      const element = rowElements.current.get(String(event.id));
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
      activeIndices.clear();
    };
  }, [
    events,
    focusTimelineIndex,
    getClosestTimelineCandidate,
    isDesktop,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    const root = timelineScrollRootRef.current;
    if (
      !root ||
      !isDesktop ||
      prefersReducedMotion ||
      events.length <= TIMELINE_EXPANDED_WINDOW_SIZE
    ) {
      return;
    }

    let animationFrame: number | null = null;
    const measureScrollFocus = () => {
      animationFrame = null;
      const candidate = getClosestTimelineCandidate(root);
      if (candidate) {
        focusTimelineIndex(candidate.index, "scroll", candidate.band);
      }
    };
    const scheduleScrollFocus = () => {
      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(measureScrollFocus);
      }
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleScrollFocus);

    root.addEventListener("scroll", scheduleScrollFocus, { passive: true });
    window.addEventListener("resize", scheduleScrollFocus);
    resizeObserver?.observe(root);
    if (timelineListRef.current) {
      resizeObserver?.observe(timelineListRef.current);
    }
    for (const event of events) {
      const row = rowElements.current.get(String(event.id));
      if (row) {
        resizeObserver?.observe(row);
      }
    }
    scheduleScrollFocus();

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      root.removeEventListener("scroll", scheduleScrollFocus);
      window.removeEventListener("resize", scheduleScrollFocus);
      resizeObserver?.disconnect();
    };
  }, [
    events,
    expandedStart,
    focusTimelineIndex,
    getClosestTimelineCandidate,
    isDesktop,
    prefersReducedMotion,
  ]);

  function handleClearFilters() {
    setSearch("");
    setDateRange("all");
    setTier("all");
    setJournaled("all");
    setContextCategory("all");
  }

  function handleRowFocus(index: number, event: FocusEvent<HTMLElement>) {
    if (isTimelineControlTarget(event.target)) {
      return;
    }

    keyboardFocusedIndexRef.current = index;
    focusTimelineIndex(index, "direct");
  }

  function handleRowBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      keyboardFocusedIndexRef.current = null;
      if (!isDesktop || prefersReducedMotion) {
        expandedStartRef.current = 0;
        setExpandedWindow({ key: expansionModeKey, start: 0 });
      }
    }
  }

  return (
    <div className="grid min-w-0 max-w-full items-start gap-3 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_270px] xl:grid-rows-[minmax(0,1fr)] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_288px]">
      <ContactContentStack className="max-w-full xl:h-full">
        <ContactTabHeader
          headingId="relationship-timeline-title"
          icon={CalendarClock}
          title="Our story, moment by moment"
          subtitle={`${resultCount} shared ${
            resultCount === 1 ? "moment" : "moments"
          }`}
          controls={
            <div className="grid min-w-0 w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-[minmax(12rem,1fr)_6.25rem_auto]">
              <div className="relative min-w-0">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search timeline"
                  value={search}
                  placeholder="Search timeline"
                  className="h-9 bg-background pl-9"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                aria-label="Timeline date range"
                value={dateRange}
                className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                onChange={(event) =>
                  setDateRange(event.target.value as DateRangeFilter)
                }
              >
                <option value="all">All time</option>
                <option value="past">Past</option>
                <option value="upcoming">Upcoming</option>
                <option value="this_month">This month</option>
              </select>
              <TimelineAdvancedFilters
                activeFilterCount={advancedFilterCount}
                contextCategory={contextCategory}
                contextCategories={contextCategories}
                journaled={journaled}
                loading={lookupsLoading}
                tier={tier}
                onClear={() => {
                  setTier("all");
                  setJournaled("all");
                  setContextCategory("all");
                }}
                onContextCategoryChange={setContextCategory}
                onJournaledChange={setJournaled}
                onTierChange={setTier}
              />
            </div>
          }
          actions={
            <Button
              asChild
              className="h-9 w-full whitespace-nowrap bg-primary hover:bg-primary-hover sm:w-auto"
            >
              <Link href={`/events/new?contact=${contact.id}`}>
                <Plus className="size-4" />
                Log moment
              </Link>
            </Button>
          }
        />

        <ContactSectionCard
          asChild
          density="standard"
          className="min-w-0 max-w-full xl:min-h-0 xl:flex-1"
        >
          <section
            aria-label="Shared moments"
            className="xl:flex xl:h-full xl:min-h-0 xl:flex-col"
          >
            <div
              ref={timelineScrollRootRef}
              className="min-w-0 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:overscroll-y-contain"
            >
              {error && (
                <TimelineState
                  icon={CalendarClock}
                  title="Unable to load this story"
                  message={error.message}
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void refetch()}
                    >
                      Try again
                    </Button>
                  }
                />
              )}

              {!error && isInitialLoading && <TimelineSkeleton />}

              {!error && !isInitialLoading && events.length === 0 && (
                <TimelineState
                  icon={CalendarDays}
                  title={
                    hasActiveQuery
                      ? "No matching moments"
                      : "No shared moments yet"
                  }
                  message={
                    hasActiveQuery
                      ? "Try a different search or clear the current filters."
                      : "Log a moment to begin building this story."
                  }
                  action={
                    hasActiveQuery ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearFilters}
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button asChild variant="soft">
                        <Link href={`/events/new?contact=${contact.id}`}>
                          Log moment
                        </Link>
                      </Button>
                    )
                  }
                />
              )}

              {!error && events.length > 0 && (
                <div
                  ref={timelineListRef}
                  className="relative isolate min-w-0 max-w-full [overflow-anchor:none]"
                >
                  {events.length > 1 && (
                    <span
                      ref={timelineConnectorRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute z-0 w-px -translate-x-1/2 bg-border opacity-0"
                    />
                  )}
                  <ol
                    className="relative z-10"
                    aria-label="Shared moments, newest first"
                  >
                    {events.map((event, index) => {
                      const expanded = isTimelineIndexExpanded(
                        index,
                        expandedStart,
                        events.length,
                      );

                      return (
                        <TimelineEventRow
                          key={event.id}
                          event={event}
                          expanded={expanded}
                          focused={focusedEventId === String(event.id)}
                          index={index}
                          onBlur={handleRowBlur}
                          onFocus={(focusEvent) =>
                            handleRowFocus(index, focusEvent)
                          }
                          setElement={(element) => {
                            const key = String(event.id);
                            if (element) {
                              rowElements.current.set(key, element);
                            } else {
                              rowElements.current.delete(key);
                            }
                          }}
                          setNodeElement={(element) => {
                            const key = String(event.id);
                            if (element) {
                              nodeElements.current.set(key, element);
                            } else {
                              nodeElements.current.delete(key);
                            }
                          }}
                        />
                      );
                    })}
                  </ol>
                </div>
              )}

              {!error && events.length > 0 && hasMore && (
                <div className="mt-4 border-t border-border/70 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-background"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                  >
                    {loadingMore && (
                      <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                    )}
                    Load earlier moments
                  </Button>
                  {loadMoreError && (
                    <p role="alert" className="mt-2 text-sm text-destructive">
                      {loadMoreError.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </ContactSectionCard>
      </ContactContentStack>

      <ContactHelperStack
        asChild
        className="xl:h-full xl:min-h-0 xl:overflow-y-auto xl:overscroll-y-contain"
      >
        <aside>
          <RememberNextTimeCard
            model={model}
            onAddObservation={onAddObservation}
          />
          <UpcomingCard
            events={upcomingEvents}
            loading={upcomingLoading}
            error={upcomingError?.message ?? null}
            now={now}
            onRetry={() => void refetchUpcoming()}
          />
        </aside>
      </ContactHelperStack>
    </div>
  );
}

function TimelineEventRow({
  event,
  expanded,
  focused,
  index,
  onBlur,
  onFocus,
  setElement,
  setNodeElement,
}: {
  event: EventListItem;
  expanded: boolean;
  focused: boolean;
  index: number;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  setElement: (element: HTMLElement | null) => void;
  setNodeElement: (element: HTMLSpanElement | null) => void;
}) {
  const presentation = getEventPresentation(event);
  const journalPresentation = getJournalStatePresentation(event.journaled);
  const description = event.description?.trim();

  return (
    <li className="min-w-0">
      {index === 0 && (
        <TimelineSectionLabel>Recent moments</TimelineSectionLabel>
      )}
      {index === TIMELINE_EXPANDED_WINDOW_SIZE && (
        <TimelineSectionLabel>Earlier moments</TimelineSectionLabel>
      )}

      <div className="grid min-w-0 grid-cols-[3.5rem_0.875rem_minmax(0,1fr)] sm:grid-cols-[3.75rem_0.875rem_minmax(0,1fr)]">
        <time
          dateTime={event.event_timestamp}
          className={cn(
            "pr-2 pt-2.5 text-right text-[11px] leading-4 text-muted-foreground sm:text-xs",
            expanded && "pt-4",
          )}
        >
          {formatRailDate(event.event_timestamp, expanded)}
        </time>

        <div className="relative flex justify-center">
          <span
            ref={setNodeElement}
            aria-hidden="true"
            className={cn(
              "relative z-10 mt-[1.15rem] size-2 rounded-full bg-primary ring-[3px] ring-card",
              expanded && "mt-[1.8rem] size-2.5",
            )}
          />
        </div>

        <article
          ref={setElement}
          data-timeline-index={index}
          data-timeline-focused={focused || undefined}
          className={cn(
            "grid min-w-0 max-w-full scroll-mt-40 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2 border-b border-border/70 bg-transparent [overflow-anchor:none] xl:grid-cols-[auto_minmax(0,1fr)_8.25rem_auto] xl:gap-x-3",
            "transition-[padding,background-color] duration-200 ease-out motion-reduce:transition-none",
            expanded
              ? "min-h-32 py-4 pr-1 pl-2 sm:pl-3"
              : "min-h-11 py-1.5 pr-1 pl-1.5 hover:bg-muted/20",
          )}
          onFocusCapture={onFocus}
          onBlurCapture={onBlur}
        >
          <EventIconTile
            presentation={presentation.icon}
            size={expanded ? "standard" : "compact"}
            className={cn(
              "row-span-2 transition-[width,height,transform] duration-200 ease-out motion-reduce:transition-none",
              !expanded && "mt-1",
            )}
          />

          <div className="min-w-0 self-center">
            <Link
              href={`/events/${event.id}`}
              title={event.title || "Untitled event"}
              className={cn(
                "block min-w-0 break-words rounded-sm font-semibold text-foreground outline-none [overflow-wrap:anywhere] hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50",
                expanded
                  ? "line-clamp-2 text-base leading-6"
                  : "truncate text-xs leading-5 sm:text-sm",
              )}
            >
              {event.title || "Untitled event"}
            </Link>

            <div
              aria-hidden={!expanded}
              className={cn(
                "grid min-w-0 transition-[grid-template-rows,opacity,transform] duration-200 ease-out motion-reduce:transition-none",
                expanded
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] -translate-y-0.5 opacity-0",
              )}
            >
              <div className="min-h-0 min-w-0 overflow-hidden">
                {description && (
                  <p
                    title={description}
                    className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]"
                  >
                    {description}
                  </p>
                )}
                <MomentDetails event={event} />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "col-start-2 row-start-2 mt-1 flex min-w-0 flex-wrap items-center gap-2 xl:col-start-3 xl:row-start-1 xl:mt-0 xl:flex-col xl:items-end",
              expanded ? "xl:gap-3" : "xl:gap-1",
            )}
          >
            <EventSemanticChip
              presentation={presentation.semanticChip}
              size={expanded ? "standard" : "compact"}
            />
            <JournalStateIndicator
              presentation={journalPresentation}
              size={expanded ? "standard" : "compact"}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Open actions for ${event.title || "event"}`}
                className="col-start-3 row-start-1 flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 xl:col-start-4"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <DropdownMenuItem asChild>
                <Link href={`/events/${event.id}`}>View event</Link>
              </DropdownMenuItem>
              {!event.journaled && (
                <DropdownMenuItem asChild>
                  <Link href={`/journals/new?event=${event.id}`}>
                    Add journal entry
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </article>
      </div>
    </li>
  );
}

function MomentDetails({ event }: { event: EventListItem }) {
  return (
    <div className="mt-2 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <ParticipantSummary event={event} />
      {event.location_label && (
        <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{event.location_label}</span>
        </span>
      )}
    </div>
  );
}

function ParticipantSummary({ event }: { event: EventListItem }) {
  const visibleParticipants = event.participants.slice(0, 2);
  const total = event.participant_count || event.participants.length;
  const names = visibleParticipants.map(
    ({ contact }) =>
      contact.first_name.trim() ||
      [contact.first_name, contact.last_name].filter(Boolean).join(" ").trim(),
  );
  if (total === 0) {
    return null;
  }
  const label =
    total === 1
      ? `You & ${names[0] || "1 person"}`
      : names.length > 0
        ? `You, ${names.join(" & ")}${total > names.length ? ` +${total - names.length}` : ""}`
        : `You & ${total} people`;

  return (
    <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
      <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
        {visibleParticipants.length > 0
          ? visibleParticipants.map(({ id, contact }) => {
              const name = [contact.first_name, contact.last_name]
                .filter(Boolean)
                .join(" ")
                .trim();
              return (
                <span
                  key={id}
                  className="flex size-6 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-muted bg-cover bg-center text-[9px] font-semibold text-foreground"
                  style={
                    contact.profile_picture?.url
                      ? {
                          backgroundImage: `url(${contact.profile_picture.url})`,
                        }
                      : undefined
                  }
                >
                  {!contact.profile_picture?.url && initials(name)}
                </span>
              );
            })
          : null}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

function TimelineSectionLabel({ children }: { children: string }) {
  return (
    <div className="relative my-1 flex items-center gap-2" aria-hidden="true">
      <span className="rounded-sm bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function RememberNextTimeCard({
  model,
  onAddObservation,
}: {
  model: ContactOverviewModel;
  onAddObservation: () => void;
}) {
  return (
    <ContactSectionCard asChild density="standard">
      <section aria-labelledby="timeline-remember-next-time-title">
        <ContactSectionHeader
          headingId="timeline-remember-next-time-title"
          icon={Bookmark}
          iconTone="violet"
          title="Remember next time"
        />

        {model.rememberNextTimeItems.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {model.rememberNextTimeItems.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 items-start gap-2.5 rounded-md py-1"
              >
                {item.source === "fact" ? (
                  <FactCategoryIconTile
                    presentation={getFactCategoryPresentation(item.category)}
                  />
                ) : (
                  <ObservationIconTile
                    presentation={
                      getObservationPresentation(item.observation).primary
                    }
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    title={item.fullText}
                    className="truncate text-sm font-medium text-foreground"
                  >
                    {item.primaryText}
                  </p>
                  {item.supportingText && (
                    <p
                      title={item.supportingText}
                      className="mt-0.5 line-clamp-2 break-words text-xs leading-4 text-muted-foreground [overflow-wrap:anywhere]"
                    >
                      {item.supportingText}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-5 text-muted-foreground">
            Mark a useful fact or save a conversation cue to keep it close here.
          </p>
        )}

        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full bg-background"
          onClick={onAddObservation}
        >
          <Plus className="size-4" />
          Add note
        </Button>
      </section>
    </ContactSectionCard>
  );
}

function UpcomingCard({
  events,
  loading,
  error,
  now,
  onRetry,
}: {
  events: EventListItem[];
  loading: boolean;
  error: string | null;
  now: Date;
  onRetry: () => void;
}) {
  return (
    <ContactSectionCard asChild density="standard">
      <section aria-labelledby="timeline-upcoming-title">
        <ContactSectionHeader
          headingId="timeline-upcoming-title"
          title="Upcoming"
        />

        {loading && events.length === 0 && (
          <div className="mt-3 space-y-2" aria-label="Loading upcoming moments">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="flex items-center gap-3 py-1.5">
                <span className="size-9 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
                <span className="h-8 flex-1 animate-pulse rounded bg-muted motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        )}

        {error && events.length === 0 && (
          <div className="mt-3 rounded-md bg-muted/30 p-3">
            <p className="text-xs leading-4 text-muted-foreground">
              Upcoming moments could not be loaded.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 -ml-2"
              onClick={onRetry}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="mt-3 text-sm leading-5 text-muted-foreground">
            No upcoming shared moments are scheduled.
          </p>
        )}

        {events.length > 0 && (
          <ul className="mt-3 divide-y divide-border/70">
            {events.slice(0, 2).map((event) => {
              const presentation = getEventPresentation(event);
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-sm py-2 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <EventIconTile
                      presentation={presentation.icon}
                      size="compact"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {event.title || "Untitled event"}
                      </span>
                      <time
                        dateTime={event.event_timestamp}
                        className="mt-0.5 block truncate text-xs text-muted-foreground"
                      >
                        {formatUpcomingDate(event.event_timestamp)}
                      </time>
                    </span>
                    <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                      {formatRelativeFutureDate(event.event_timestamp, now)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 border-t border-border/70 pt-3">
          <Link
            href="/events/calendar"
            className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary outline-none hover:text-primary-strong focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            View calendar
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </ContactSectionCard>
  );
}

function TimelineAdvancedFilters({
  activeFilterCount,
  contextCategory,
  contextCategories,
  journaled,
  loading,
  tier,
  onClear,
  onContextCategoryChange,
  onJournaledChange,
  onTierChange,
}: {
  activeFilterCount: number;
  contextCategory: string;
  contextCategories: Array<{ id: string | number; name: string }>;
  journaled: JournaledFilter;
  loading: boolean;
  tier: TierFilter;
  onClear: () => void;
  onContextCategoryChange: (value: string) => void;
  onJournaledChange: (value: JournaledFilter) => void;
  onTierChange: (value: TierFilter) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative bg-background"
          aria-label={
            activeFilterCount > 0
              ? `${activeFilterCount} advanced Timeline filters active`
              : "Open advanced Timeline filters"
          }
          title="Timeline filters"
        >
          <Filter className="size-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <PopoverHeader className="flex-row items-center justify-between gap-3">
          <PopoverTitle>Timeline filters</PopoverTitle>
          {activeFilterCount > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
              Clear
            </Button>
          )}
        </PopoverHeader>

        <div className="grid gap-3">
          <FilterField label="Moment type">
            <select
              value={tier}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) =>
                onTierChange(event.target.value as TierFilter)
              }
            >
              <option value="all">All moments</option>
              <option value="routine">Routine</option>
              <option value="milestone">Milestones</option>
            </select>
          </FilterField>
          <FilterField label="Context">
            <select
              value={contextCategory}
              disabled={loading}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
              onChange={(event) => onContextCategoryChange(event.target.value)}
            >
              <option value="all">All contexts</option>
              {contextCategories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Journal state">
            <select
              value={journaled}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) =>
                onJournaledChange(event.target.value as JournaledFilter)
              }
            >
              <option value="all">All journal states</option>
              <option value="journaled">Journaled</option>
              <option value="not_journaled">Not journaled</option>
            </select>
          </FilterField>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-foreground">
      {label}
      {children}
    </label>
  );
}

function TimelineState({
  action,
  icon: Icon,
  message,
  title,
}: {
  action: ReactNode;
  icon: typeof CalendarDays;
  message: string;
  title: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-md bg-background text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">
        {message}
      </p>
      <div className="mt-4">{action}</div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div aria-label="Loading shared moments">
      {Array.from({ length: TIMELINE_EXPANDED_WINDOW_SIZE }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[3.5rem_0.875rem_minmax(0,1fr)] sm:grid-cols-[3.75rem_0.875rem_minmax(0,1fr)]"
        >
          <div className="mr-2 mt-4 h-7 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="relative flex justify-center">
            <span className="mt-7 size-2 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          </div>
          <div className="h-32 animate-pulse border-b border-border bg-muted/30 motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

function buildDateRangeParams(dateRange: DateRangeFilter, now: Date) {
  if (dateRange === "upcoming") {
    return { event_after: now.toISOString() };
  }

  if (dateRange === "past") {
    return { event_before: now.toISOString() };
  }

  if (dateRange === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
      event_after: start.toISOString(),
      event_before: end.toISOString(),
    };
  }

  return {};
}

function formatRailDate(value: string, expanded: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const monthDay = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
  if (!expanded) {
    return `${monthDay}, ${date.getFullYear()}`;
  }

  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date);
  return (
    <>
      <span className="block font-medium text-foreground">{monthDay}</span>
      <span className="block">{weekday}</span>
    </>
  );
}

function formatUpcomingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeFutureDate(value: string, now: Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const eventDay = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.max(
    0,
    Math.round((eventDay - currentDay) / dayInMilliseconds),
  );
  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Tomorrow";
  }
  return `In ${days} days`;
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function isTimelineControlTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "button, input, select, textarea, [role='menuitem'], [data-timeline-control]",
    ),
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [query]);

  return matches;
}
