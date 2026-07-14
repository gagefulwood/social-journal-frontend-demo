"use client";

import { useCallback, useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  Contact,
  CreateFactRequest,
  CreateObservationRequest,
  FactListResponse,
  ObservationListResponse,
  UpdateContactRequest,
  UpdateFactRequest,
  UpdateObservationRequest,
} from "@/types/contacts";

export function useContact(contactId: ApiId | null | undefined) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [factsPage, setFactsPage] = useState<FactListResponse | null>(null);
  const [observationsPage, setObservationsPage] =
    useState<ObservationListResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(contactId));
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [factsError, setFactsError] = useState<ApiError | null>(null);
  const [observationsError, setObservationsError] = useState<ApiError | null>(
    null,
  );

  const refreshFacts = useCallback(async () => {
    if (!contactId) {
      return;
    }

    setFactsError(null);
    try {
      const nextFactsPage = await contactsApi.listFacts(contactId);
      setFactsPage(nextFactsPage);
    } catch (err) {
      setFactsError(err as ApiError);
      throw err;
    }
  }, [contactId]);

  const refreshObservations = useCallback(async () => {
    if (!contactId) {
      return;
    }

    setObservationsError(null);
    try {
      const nextObservationsPage =
        await contactsApi.listObservations(contactId);
      setObservationsPage(nextObservationsPage);
    } catch (err) {
      setObservationsError(err as ApiError);
      throw err;
    }
  }, [contactId]);

  const refetch = useCallback(async () => {
    if (!contactId) {
      setContact(null);
      setFactsPage(null);
      setObservationsPage(null);
      setFactsError(null);
      setObservationsError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setFactsError(null);
    setObservationsError(null);

    try {
      const bundle = await loadContactBundle(contactId);
      setContact(bundle.contact);
      setFactsPage(bundle.factsPage);
      setObservationsPage(bundle.observationsPage);
      setFactsError(bundle.factsError);
      setObservationsError(bundle.observationsError);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    let isActive = true;

    async function loadContact() {
      if (!contactId) {
        setContact(null);
        setFactsPage(null);
        setObservationsPage(null);
        setFactsError(null);
        setObservationsError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setFactsError(null);
      setObservationsError(null);

      try {
        const bundle = await loadContactBundle(contactId);

        if (isActive) {
          setContact(bundle.contact);
          setFactsPage(bundle.factsPage);
          setObservationsPage(bundle.observationsPage);
          setFactsError(bundle.factsError);
          setObservationsError(bundle.observationsError);
        }
      } catch (err) {
        if (isActive) {
          setError(err as ApiError);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadContact();

    return () => {
      isActive = false;
    };
  }, [contactId]);

  const updateContact = useCallback(
    async (data: UpdateContactRequest) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const updated = await contactsApi.patch(contactId, data);
        setContact(updated);
        return updated;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId],
  );

  const deleteContact = useCallback(async () => {
    if (!contactId) {
      throw new Error("Contact id is required.");
    }

    setMutating(true);
    setError(null);

    try {
      await contactsApi.remove(contactId);
      setContact(null);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [contactId]);

  const createFact = useCallback(
    async (data: CreateFactRequest) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const fact = await contactsApi.createFact(contactId, data);
        await refreshFacts();
        return fact;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshFacts],
  );

  const updateFact = useCallback(
    async (factId: ApiId, data: UpdateFactRequest) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const fact = await contactsApi.patchFact(contactId, factId, data);
        await refreshFacts();
        return fact;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshFacts],
  );

  const deleteFact = useCallback(
    async (factId: ApiId) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        await contactsApi.removeFact(contactId, factId);
        await refreshFacts();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshFacts],
  );

  const pinFact = useCallback(
    async (factId: ApiId) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const fact = await contactsApi.pinFact(contactId, factId);
        await refreshFacts();
        return fact;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshFacts],
  );

  const unpinFact = useCallback(
    async (factId: ApiId) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const fact = await contactsApi.unpinFact(contactId, factId);
        await refreshFacts();
        return fact;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshFacts],
  );

  const createObservation = useCallback(
    async (data: CreateObservationRequest) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const observation = await contactsApi.createObservation(
          contactId,
          data,
        );
        await refreshObservations();
        return observation;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshObservations],
  );

  const updateObservation = useCallback(
    async (observationId: ApiId, data: UpdateObservationRequest) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const observation = await contactsApi.patchObservation(
          contactId,
          observationId,
          data,
        );
        await refreshObservations();
        return observation;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshObservations],
  );

  const deleteObservation = useCallback(
    async (observationId: ApiId) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        await contactsApi.removeObservation(contactId, observationId);
        await refreshObservations();
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshObservations],
  );

  const pinObservation = useCallback(
    async (observationId: ApiId) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const observation = await contactsApi.pinObservation(
          contactId,
          observationId,
        );
        await refreshObservations();
        return observation;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshObservations],
  );

  const unpinObservation = useCallback(
    async (observationId: ApiId) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const observation = await contactsApi.unpinObservation(
          contactId,
          observationId,
        );
        await refreshObservations();
        return observation;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshObservations],
  );

  return {
    contact,
    facts: factsPage?.results ?? [],
    factsPage,
    observations: observationsPage?.results ?? [],
    observationsPage,
    loading,
    mutating,
    error,
    factsError,
    observationsError,
    refetch,
    refreshFacts,
    refreshObservations,
    updateContact,
    deleteContact,
    createFact,
    updateFact,
    deleteFact,
    pinFact,
    unpinFact,
    createObservation,
    updateObservation,
    deleteObservation,
    pinObservation,
    unpinObservation,
  };
}

async function loadContactBundle(contactId: ApiId) {
  const [contactResult, factsResult, observationsResult] =
    await Promise.allSettled([
      contactsApi.get(contactId),
      contactsApi.listFacts(contactId),
      contactsApi.listObservations(contactId),
    ]);

  if (contactResult.status === "rejected") {
    throw contactResult.reason;
  }

  return {
    contact: contactResult.value,
    factsPage: factsResult.status === "fulfilled" ? factsResult.value : null,
    observationsPage:
      observationsResult.status === "fulfilled"
        ? observationsResult.value
        : null,
    factsError:
      factsResult.status === "rejected"
        ? (factsResult.reason as ApiError)
        : null,
    observationsError:
      observationsResult.status === "rejected"
        ? (observationsResult.reason as ApiError)
        : null,
  };
}
