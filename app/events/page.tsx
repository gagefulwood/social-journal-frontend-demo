"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useEvent";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";
import { EventFilterPopover } from "@/components/events/EventFilterPopover";
import { EventGrid } from "@/components/events/EventGrid";


const pageSize = 24;

export default function EventsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [context_category, setContextCategory] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const activeFilterCount = [].filter(Boolean).length;
    const { events, data, loading, error, refetch } = useEvents({
        page,
        page_size: pageSize,
        title: debouncedSearch,
        context_category: context_category || undefined,
    });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Manage your events here.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="size-4" />
            New Event
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <Tabs
          value="list view"
          onValueChange={(value) => {
            if (value === "timeline") {
              router.push("/events/timeline");
            }
            if (value === "calendar") {
                router.push("/events/calendar");
            }
          }}
        >
          <TabsList className="w-full md:w-fit">
            <TabsTrigger value="list view">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={search}
          placeholder="Search by title"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <EventFilterPopover
          title={search}
          contextCategory={context_category}
          categories={[]}
          isLoading={false}
          activeFilterCount={activeFilterCount}
          onTitleChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onContextCategoryChange={(value) => {
            setContextCategory(value);
            setPage(1);
          }}
          onClearFilters={() => {
            setSearch("");
            setContextCategory("");
            setPage(1);
          }}
        />
      </section>

      <EventGrid
        events={events}
        loading={loading}
        error={error}
        page={page}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRetry={refetch}
      />

    </main>
  );
}