"use client";

import { use, useEffect, useState } from "react";
import { journalApi } from "@/lib/api/journalApi";
import type { JournalEntry } from "@/models/events";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    journalApi
      .get(Number(id))
      .then((entry) => setEntry(entry))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!entry) {
    return <p className="text-destructive text-sm">Entry not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">{entry.title}</h2>
        {entry.is_immutable && <Badge>Locked</Badge>}
      </div>

      <p className="text-xs text-muted-foreground">
        {new Date(entry.created_at).toLocaleDateString()}
      </p>

      <div className="whitespace-pre-wrap">{entry.body}</div>
    </div>
  );
}