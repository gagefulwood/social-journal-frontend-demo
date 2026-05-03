"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactGrid } from "@/components/contacts/ContactGrid";
import { useContacts } from "@/hooks/useContacts";
import { useDebounce } from "@/hooks/useDebounce";
import { useLookups } from "@/hooks/useLookups";

const pageSize = 24;

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [occupation, setOccupation] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const { occupations, isLoading: lookupsLoading } = useLookups();
  const { contacts, data, loading, error, refetch } = useContacts({
    page,
    page_size: pageSize,
    name: debouncedSearch,
    occupation: occupation || undefined,
  });

  return (
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

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_240px]">
        <Input
          value={search}
          placeholder="Search by name"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          value={occupation}
          disabled={lookupsLoading}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          onChange={(event) => {
            setOccupation(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All occupations</option>
          {occupations.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name}
            </option>
          ))}
        </select>
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
  );
}
