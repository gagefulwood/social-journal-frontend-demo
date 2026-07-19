"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";

export type JournalAutosaveStatus =
  | "idle"
  | "dirty"
  | "saving"
  | "saved"
  | "error";

type JournalAutosaveOptions<TDraft, TEntry> = {
  value: TDraft;
  existingEntry?: TEntry | null;
  isMeaningful: (value: TDraft) => boolean;
  getId: (entry: TEntry) => ApiId;
  getRevision: (entry: TEntry) => number;
  create: (value: TDraft) => Promise<TEntry>;
  update: (
    id: ApiId,
    value: TDraft,
    expectedRevision: number,
  ) => Promise<TEntry>;
  onCreated?: (entry: TEntry) => void;
  onSaved?: (entry: TEntry) => void;
  delay?: number;
};

export function useJournalAutosave<TDraft, TEntry>(
  options: JournalAutosaveOptions<TDraft, TEntry>,
) {
  const { value, existingEntry = null, delay = 700 } = options;
  const initialEntryId = existingEntry ? options.getId(existingEntry) : null;
  const initialRevision = existingEntry
    ? options.getRevision(existingEntry)
    : 0;
  const optionsRef = useRef(options);
  const latestValueRef = useRef(value);
  const entryIdRef = useRef<ApiId | null>(initialEntryId);
  const revisionRef = useRef(initialRevision);
  const changeVersionRef = useRef(0);
  const savedVersionRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastSaveFailedRef = useRef(false);
  const errorRef = useRef<ApiError | null>(null);
  const didObserveValueRef = useRef(false);
  const hadInitialEntryRef = useRef(existingEntry != null);
  const [entryId, setEntryId] = useState<ApiId | null>(initialEntryId);
  const [revision, setRevision] = useState(initialRevision);
  const [status, setStatus] = useState<JournalAutosaveStatus>(
    existingEntry ? "saved" : "idle",
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    optionsRef.current = options;
    latestValueRef.current = value;
  });

  useEffect(() => {
    if (!existingEntry) {
      return;
    }

    const nextId = optionsRef.current.getId(existingEntry);
    const nextRevision = optionsRef.current.getRevision(existingEntry);
    entryIdRef.current = nextId;
    revisionRef.current = nextRevision;
    setEntryId(nextId);
    setRevision(nextRevision);
    savedVersionRef.current = changeVersionRef.current;
    setStatus("saved");
  }, [existingEntry]);

  const runSave = useCallback(async function saveLatest() {
    if (inFlightRef.current) {
      await inFlightRef.current;
      return;
    }

    const currentOptions = optionsRef.current;
    const snapshot = latestValueRef.current;
    const savingVersion = changeVersionRef.current;

    if (entryIdRef.current == null && !currentOptions.isMeaningful(snapshot)) {
      return;
    }

    const request = (async () => {
      setStatus("saving");
      setError(null);
      errorRef.current = null;

      try {
        const savedEntry =
          entryIdRef.current == null
            ? await currentOptions.create(snapshot)
            : await currentOptions.update(
                entryIdRef.current,
                snapshot,
                revisionRef.current,
              );

        const nextId = currentOptions.getId(savedEntry);
        const nextRevision = currentOptions.getRevision(savedEntry);
        const wasCreated = entryIdRef.current == null;

        entryIdRef.current = nextId;
        revisionRef.current = nextRevision;
        savedVersionRef.current = savingVersion;
        lastSaveFailedRef.current = false;
        setEntryId(nextId);
        setRevision(nextRevision);
        setSavedAt(new Date());
        currentOptions.onSaved?.(savedEntry);

        if (wasCreated) {
          currentOptions.onCreated?.(savedEntry);
        }

        setStatus(
          changeVersionRef.current === savingVersion ? "saved" : "dirty",
        );
      } catch (caught) {
        lastSaveFailedRef.current = true;
        errorRef.current = caught as ApiError;
        setError(caught as ApiError);
        setStatus("error");
      }
    })();

    inFlightRef.current = request;
    await request;
    inFlightRef.current = null;

    if (
      savedVersionRef.current < changeVersionRef.current &&
      (entryIdRef.current != null ||
        optionsRef.current.isMeaningful(latestValueRef.current)) &&
      !lastSaveFailedRef.current
    ) {
      await saveLatest();
    }
  }, []);

  useEffect(() => {
    if (!didObserveValueRef.current) {
      didObserveValueRef.current = true;
      if (hadInitialEntryRef.current) {
        savedVersionRef.current = changeVersionRef.current;
        return;
      }
    }

    changeVersionRef.current += 1;

    if (entryIdRef.current == null && !optionsRef.current.isMeaningful(value)) {
      setStatus("idle");
      return;
    }

    setStatus("dirty");
    setError(null);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void runSave();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [delay, runSave, value]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (inFlightRef.current) {
      await inFlightRef.current;
    }

    if (
      savedVersionRef.current < changeVersionRef.current &&
      (entryIdRef.current != null ||
        optionsRef.current.isMeaningful(latestValueRef.current))
    ) {
      await runSave();
    }

    if (errorRef.current) {
      throw errorRef.current;
    }
  }, [runSave]);

  const retry = useCallback(() => {
    setError(null);
    errorRef.current = null;
    setStatus("dirty");
    void runSave();
  }, [runSave]);

  useEffect(() => {
    const handlePageHide = () => {
      void flush().catch(() => undefined);
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, [flush]);

  useEffect(
    () => () => {
      void flush().catch(() => undefined);
    },
    [flush],
  );

  return {
    entryId,
    revision,
    status,
    error,
    savedAt,
    hasMeaningfulDraft: options.isMeaningful(value),
    flush,
    getCurrentEntryId: () => entryIdRef.current,
    getCurrentRevision: () => revisionRef.current,
    retry,
  };
}
