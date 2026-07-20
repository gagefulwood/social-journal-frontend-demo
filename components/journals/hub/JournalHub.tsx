"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { NewJournalChooser } from "@/components/journals/chooser/NewJournalChooser";
import { JournalDraftPanel } from "@/components/journals/hub/JournalDraftPanel";
import {
  JournalHubFilters,
  type JournalHubFilterValues,
} from "@/components/journals/hub/JournalHubFilters";
import { JournalList } from "@/components/journals/hub/JournalList";
import { LogPatternRail } from "@/components/journals/hub/LogPatternRail";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJournalFeed } from "@/hooks/useJournal";
import { journalApi } from "@/lib/api/journalApi";
import type { JournalListItem } from "@/types/journals";

import {
  JOURNAL_DRAFT_PREVIEW_SIZE,
  JOURNAL_HUB_PAGE_SIZE,
  familyForHubView,
  isFormatCompatibleWithView,
  isLogFormat,
  parseHubView,
  parseJournalFormat,
  parsePage,
} from "@/components/journals/hub/journalHubUtils";

type QueryUpdate = Record<string, string | null | undefined>;

export function JournalHub() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseHubView(searchParams.get("view"));
  const page = parsePage(searchParams.get("page"));
  const searchParam = searchParams.get("search") ?? "";
  const parsedFormat = parseJournalFormat(searchParams.get("format"));
  const chapter = searchParams.get("chapter") ?? undefined;
  const format = isFormatCompatibleWithView(parsedFormat, view)
    ? parsedFormat
    : undefined;
  const filters = useMemo<JournalHubFilterValues>(
    () => ({
      contact: searchParams.get("contact") ?? "",
      event: searchParams.get("event") ?? "",
      occurredAfter: searchParams.get("occurred_after") ?? "",
      occurredBefore: searchParams.get("occurred_before") ?? "",
      format,
    }),
    [format, searchParams],
  );

  const replaceQuery = useCallback(
    (updates: QueryUpdate, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      if (resetPage && !("page" in updates)) {
        next.delete("page");
      }

      const query = next.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (parsedFormat && !isFormatCompatibleWithView(parsedFormat, view)) {
      replaceQuery({ format: null });
    }
  }, [parsedFormat, replaceQuery, view]);

  const family = familyForHubView(view);
  const mainFeed = useJournalFeed({
    page,
    page_size: JOURNAL_HUB_PAGE_SIZE,
    family,
    status: view === "drafts" ? "draft" : "completed",
    format,
    search: searchParam || undefined,
    contact: filters.contact || undefined,
    event: filters.event || undefined,
    chapter: filters.event ? chapter : undefined,
    occurred_after: filters.occurredAfter || undefined,
    occurred_before: filters.occurredBefore || undefined,
    ordering: view === "drafts" ? "-updated_timestamp" : "-occurred_at",
  });
  const draftFeed = useJournalFeed({
    page: 1,
    page_size: JOURNAL_DRAFT_PREVIEW_SIZE,
    status: "draft",
    ordering: "-updated_timestamp",
  });

  const activeFilterCount = [
    filters.contact,
    filters.event,
    filters.occurredAfter,
    filters.occurredBefore,
    filters.format,
    chapter,
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0 || Boolean(searchParam);
  const chooserOpen = searchParams.get("new") === "1";

  function changeView(nextView: string) {
    const normalized = parseHubView(nextView);
    replaceQuery({
      view: normalized === "all" ? null : normalized,
      format: isFormatCompatibleWithView(format, normalized) ? format : null,
    });
  }

  function changeFilter<Key extends keyof JournalHubFilterValues>(
    key: Key,
    value: JournalHubFilterValues[Key],
  ) {
    const queryKey =
      key === "occurredAfter"
        ? "occurred_after"
        : key === "occurredBefore"
          ? "occurred_before"
          : key;
    replaceQuery({
      [queryKey]: value ? String(value) : null,
      ...(key === "event" ? { chapter: null } : {}),
    });
  }

  function clearFilters() {
    replaceQuery({
      search: null,
      contact: null,
      event: null,
      chapter: null,
      occurred_after: null,
      occurred_before: null,
      format: null,
    });
  }

  function setChooserOpen(open: boolean) {
    replaceQuery({ new: open ? "1" : null }, false);
  }

  const getChooserOptionHref = useCallback(
    (option: { href: string }) => {
      const context = new URLSearchParams();
      if (filters.event) {
        context.set("event", filters.event);
        if (chapter) context.set("chapter", chapter);
      }
      if (filters.contact) {
        context.set("contact", filters.contact);
      }
      const query = context.toString();
      return `${option.href}${query ? `?${query}` : ""}`;
    },
    [chapter, filters.contact, filters.event],
  );

  async function discardDraft(draft: JournalListItem) {
    if (draft.family === "log") {
      await journalApi.removeLog(draft.id);
    } else {
      await journalApi.removeReflection(draft.id);
    }

    toast.success("Draft discarded.");
    draftFeed.refetch();
    mainFeed.refetch();
  }

  return (
    <main className="mx-auto flex w-full max-w-[90rem] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-sans text-3xl font-semibold leading-tight">
            Journals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Track patterns and make sense of the moments that matter.
          </p>
        </div>

        <NewJournalChooser
          open={chooserOpen}
          onOpenChange={setChooserOpen}
          getOptionHref={getChooserOptionHref}
          trigger={
            <Button type="button" size="lg">
              <Plus aria-hidden="true" />
              New journal
            </Button>
          }
        />
      </div>

      <Tabs value={view} onValueChange={changeView}>
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
          <TabsTrigger value="drafts" className="gap-1.5">
            Drafts
            {!draftFeed.loading && draftFeed.data && (
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] leading-none text-accent-foreground">
                {draftFeed.data.count}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view !== "drafts" && (
        <JournalDraftPanel
          drafts={draftFeed.entries}
          totalCount={draftFeed.data?.count ?? 0}
          loading={draftFeed.loading}
          error={draftFeed.error}
          onRetry={draftFeed.refetch}
          onDiscard={discardDraft}
          onViewAll={() => changeView("drafts")}
        />
      )}

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <SurfaceCard className="min-w-0 overflow-hidden">
          <div className="border-b border-border/70 p-4">
            <JournalHubFilters
              view={view}
              search={searchParam}
              filters={filters}
              activeFilterCount={activeFilterCount}
              chapter={chapter}
              onSearchChange={(value) =>
                replaceQuery({ search: value || null })
              }
              onFilterChange={changeFilter}
              onClearFilters={clearFilters}
              onChapterChange={(value) =>
                replaceQuery({ chapter: value || null })
              }
            />
          </div>
          <JournalList
            entries={mainFeed.entries}
            loading={mainFeed.loading}
            error={mainFeed.error}
            page={page}
            pageSize={JOURNAL_HUB_PAGE_SIZE}
            totalCount={mainFeed.data?.count ?? 0}
            view={view}
            hasFilters={hasFilters}
            onPageChange={(nextPage) =>
              replaceQuery(
                { page: nextPage > 1 ? String(nextPage) : null },
                false,
              )
            }
            onRetry={mainFeed.refetch}
            onClearFilters={clearFilters}
            onCreate={() => setChooserOpen(true)}
          />
        </SurfaceCard>

        <LogPatternRail format={isLogFormat(format) ? format : undefined} />
      </div>
    </main>
  );
}
