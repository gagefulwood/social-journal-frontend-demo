"use client";

import { useState } from "react";
import { useJournal } from "@/lib/hooks/useJournal";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { JournalEntryCreateDialog } from "@/components/journal/JournalEntryCreateDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalPage() {
  const { entries, isLoading, error, refetch } = useJournal();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Journal</h2>
        <Button onClick={() => setOpen(true)}>New Entry</Button>
      </div>

      <JournalEntryCreateDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          setOpen(false);
          refetch();
        }}
      />

      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!isLoading && entries.length === 0 && !error && (
        <p className="text-muted-foreground text-sm">
          No journal entries yet.
        </p>
      )}

      {entries.map((e) => (
        <JournalEntryCard key={e.id} entry={e} />
      ))}
    </div>
  );
}