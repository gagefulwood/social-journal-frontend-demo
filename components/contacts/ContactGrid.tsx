"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/contacts/ContactCard";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/types/auth";
import type { ContactListItem } from "@/types/contacts";

type ContactGridProps = {
  contacts: ContactListItem[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  totalCount: number;
  hasActiveQuery: boolean;
  onClearQuery: () => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
};

const pageSize = 24;

export function ContactGrid({
  contacts,
  loading,
  error,
  page,
  totalCount,
  hasActiveQuery,
  onClearQuery,
  onPageChange,
  onRetry,
}: ContactGridProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-34 border border-border/70 bg-card"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="font-medium">Unable to load people</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (contacts.length === 0) {
    if (hasActiveQuery) {
      return (
        <EmptyActionBox
          title="No people match this search or filter."
          copy="Try a different name or clear the current filters."
          action={
            <Button type="button" variant="outline" onClick={onClearQuery}>
              Clear search and filters
            </Button>
          }
        />
      );
    }

    return (
      <EmptyActionBox
        title="No people saved yet."
        copy="Add someone when there is context you would like to remember."
        action={
          <Button asChild>
            <Link href="/contacts/new">New contact</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            aria-label="Previous page"
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            aria-label="Next page"
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
