"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactGrid } from "@/components/contacts/ContactGrid";
import { ContactFilterPopover } from "@/components/contacts/ContactFilterPopover";
import { useContacts } from "@/hooks/useContacts";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSJ } from "@/components/layout/SideBarLayout";

const pageSize = 24;

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [occupation, setOccupation] = useState("");
  const [relation, setRelation] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { occupations, relations, isLoading: lookupsLoading } = useLookups();
  const activeFilterCount = [occupation, relation].filter(Boolean).length;
  const { contacts, data, loading, error, refetch } = useContacts({
    page,
    page_size: pageSize,
    name: debouncedSearch,
    occupation: occupation || undefined,
    relation: relation || undefined,
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarSJ />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Contacts</h1>
              <p className="text-sm text-muted-foreground">
                Manage the people in your contacts.
              </p>
            </div>
            <Button asChild>
              <Link href="/contacts/new">
                <Plus className="size-4" />
                New Contact
              </Link>
            </Button>
          </div>

          <section className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_auto] md:items-center">
            <Input
              value={search}
              placeholder="Search by name"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
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
          </section>

          <ContactGrid
            contacts={contacts}
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
