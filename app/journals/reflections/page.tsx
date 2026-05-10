"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRefs } from "@/hooks/useJournal";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";
import { JournalFilterPopover } from "@/components/journals/JournalFilterPopover";
import {JournalReflectionGrid} from "@/components/journals/JournalReflectionGrid";


const pageSize = 24;

export default function JournalsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [entryTag, setEntryTag] = useState("");
    const [mood, setMood] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 300);
    const { entryTags, moods, isLoading: lookupsLoading } = useLookups();
    const activeFilterCount = [mood, entryTag].filter(Boolean).length;
    const { reflections, data, loading, error, refetch } = useRefs({
        page,
        page_size: pageSize,
        title: debouncedSearch,
        entry_tag: entryTag || undefined,
        mood: mood || undefined,
    });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Journals</h1>
          <p className="text-sm text-muted-foreground">
            Manage your logs, reflections, and exercises here.
          </p>
        </div>
        <Button asChild>
          <Link href="/journals/reflections/new">
            <Plus className="size-4" />
            New Reflection
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <Tabs
          value="reflections"
          onValueChange={(value) => {
            if (value === "logs") {
              router.push("/journals");
            }
            if (value === "exercises") {
                router.push("/journals/exercises");
            }
          }}
        >
          <TabsList className="w-full md:w-fit">
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="reflections">Reflections</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
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
        <JournalFilterPopover
            mood={mood}
            entryTag={entryTag}
            moods={moods}
            entryTags={entryTags}
            isLoading={lookupsLoading}
            activeFilterCount={activeFilterCount}
            onMoodChange={(value) => {
            setMood(value);
            setPage(1);
          }}
            onTagChange={(value) => {
            setEntryTag(value);
            setPage(1);
          }}
            onClearFilters={() => {
            setMood("");
            setEntryTag("");
            setPage(1);
          }}
        />
      </section>

      <JournalReflectionGrid
        reflections={reflections}
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
