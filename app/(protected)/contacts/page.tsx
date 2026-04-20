"use client";

import { useContacts } from "@/lib/hooks/useContacts";
import { useContactsStore } from "@/store/useContactsStore";
import { ContactCard } from "@/components/contacts/ContactCard";
import { ContactSearchBar } from "@/components/contacts/ContactSearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function ContactsPage() {
  const { contacts, isLoading, error } = useContacts();
  const setFilter = useContactsStore((s) => s.setFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ContactSearchBar onSearch={(q) => setFilter({ search: q })} />
        <Button asChild>
          <Link href="/contacts/new">New Contact</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {error && <p className="text-destructive">Failed to load contacts.</p>}

      {!isLoading && contacts.length === 0 && !error && (
        <p className="text-muted-foreground">
          No contacts yet. Add one to get started.
        </p>
      )}

      {!isLoading && contacts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}