"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactGrid } from "@/components/contacts/ContactGrid";
import { ContactFilterPopover } from "@/components/contacts/ContactFilterPopover";
import { useContacts } from "@/hooks/useContacts";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";

const pageSize = 24;

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [occupation, setOccupation] = useState("");
  const [relation, setRelation] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { occupations, relations, isLoading: lookupsLoading } = useLookups();
  const activeFilterCount = [occupation, relation].filter(Boolean).length;
  const hasActiveQuery = Boolean(search.trim()) || activeFilterCount > 0;
  const { contacts, data, loading, error, refetch } = useContacts({
    page,
    page_size: pageSize,
    name: debouncedSearch,
    occupation: occupation || undefined,
    relation: relation || undefined,
  });

  function clearQuery() {
    setSearch("");
    setOccupation("");
    setRelation("");
    setPage(1);
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Your people</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The relationships and context you have chosen to remember.
          </p>
        </div>
        <Button asChild>
          <Link href="/contacts/new">
            <Plus className="size-4" />
            New contact
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 rounded-lg border border-border/80 bg-card p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            aria-label="Search people"
            className="pl-9"
            placeholder="Search people"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <ContactFilterPopover
          occupation={occupation}
          relation={relation}
          occupations={occupations}
          relations={relations}
          isLoading={lookupsLoading}
          activeFilterCount={activeFilterCount}
          onOccupationChange={(value) => {
            setOccupation(value);
            setPage(1);
          }}
          onRelationChange={(value) => {
            setRelation(value);
            setPage(1);
          }}
          onClearFilters={() => {
            setOccupation("");
            setRelation("");
            setPage(1);
          }}
        />
        <p
          className="justify-self-start whitespace-nowrap text-sm text-muted-foreground sm:justify-self-end"
          aria-live="polite"
        >
          {loading
            ? "Loading people..."
            : `${data?.count ?? 0} ${(data?.count ?? 0) === 1 ? "person" : "people"}`}
        </p>
      </section>

      <section aria-labelledby="all-people-heading">
        <h2 id="all-people-heading" className="text-base font-semibold">
          All people
        </h2>
        <div className="mt-3">
          <ContactGrid
            contacts={contacts}
            loading={loading}
            error={error}
            page={page}
            totalCount={data?.count ?? 0}
            hasActiveQuery={hasActiveQuery}
            onClearQuery={clearQuery}
            onPageChange={setPage}
            onRetry={refetch}
          />
        </div>
      </section>
    </main>
  );
}
