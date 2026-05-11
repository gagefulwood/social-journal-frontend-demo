"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJournalFeed } from "@/hooks/useJournal";
import { useDebounce } from "@/hooks/useDebounce";
import { JournalFeedGrid } from "@/components/journals/JournalFeedGrid";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSJ } from "@/components/layout/SideBarLayout";


const pageSize = 24;

export default function JournalsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 300);
    const { entries, data, loading, error, refetch } = useJournalFeed({
        page,
        page_size: pageSize,
        title: debouncedSearch,
    });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarSJ />
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Journals</h1>
          <p className="text-sm text-muted-foreground">
            Manage your logs, reflections, and exercises here.
          </p>
        </div>
        <Button asChild>
          <Link href="/journals/new">
            <Plus className="size-4" />
            New Journal
          </Link>
        </Button>
      </div>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
        <Tabs
          value="all"
          onValueChange={(value) => {
            if (value === "logs") {
              router.push("/journals/logs");
            }
            if (value === "reflections") {
              router.push("/journals/reflections");
            }
            if (value === "exercises") {
                router.push("/journals/exercises");
            }
          }}
        >
          <TabsList className="w-full md:w-fit">
            <TabsTrigger value="all">All</TabsTrigger>
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
      </section>

      <JournalFeedGrid
        entries={entries}
        loading={loading}
        error={error}
        page={page}
        totalCount={data?.count ?? 0}
        onPageChange={setPage}
        onRetry={refetch}
      />
    </main>
    </div>
    </SidebarProvider>
  );
}
