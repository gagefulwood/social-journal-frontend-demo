import { useEffect, useState, useCallback } from "react";
import { journalApi } from "@/lib/api/journalApi";
import type { JournalEntryPreview } from "@/models/events";

export function useJournal(filters?: {
  mood_id?: number;
  entry_timestamp_after?: string;
  entry_timestamp_before?: string;
}) {
  const [entries, setEntries] = useState<JournalEntryPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await journalApi.list(filters);
      setEntries(res.results);
    } catch {
      setError("Failed to load journal entries.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, isLoading, error, refetch: fetchEntries };
}