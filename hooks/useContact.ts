"use client";

import { useCallback, useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import type { ApiId } from "@/types/api";
import type { ApiError } from "@/types/auth";
import type {
  Contact,
  CreateFactRequest,
  CreateObservationRequest,
  Fact,
  Observation,
  UpdateContactRequest,
  UpdateFactRequest,
  UpdateObservationRequest,
} from "@/types/contacts";

export function useContact(contactId: ApiId | null | undefined) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(Boolean(contactId));
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const refreshFacts = useCallback(async () => {
    if (!contactId) {
      return;
    }

    const nextFacts = await contactsApi.listFacts(contactId);
    setFacts(nextFacts);
  }, [contactId]);

  const refreshObservations = useCallback(async () => {
    if (!contactId) {
      return;
    }

    const nextObservations = await contactsApi.listObservations(contactId);
    setObservations(nextObservations);
  }, [contactId]);

  const refetch = useCallback(async () => {
    if (!contactId) {
      setContact(null);
      setFacts([]);
      setObservations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextContact, nextFacts, nextObservations] = await Promise.all([
        contactsApi.get(contactId),
        contactsApi.listFacts(contactId),
        contactsApi.listObservations(contactId),
      ]);

      setContact(nextContact);
      setFacts(nextFacts);
      setObservations(nextObservations);
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
        setFacts([]);
        setObservations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [nextContact, nextFacts, nextObservations] = await Promise.all([
          contactsApi.get(contactId),
          contactsApi.listFacts(contactId),
          contactsApi.listObservations(contactId),
        ]);

        if (isActive) {
          setContact(nextContact);
          setFacts(nextFacts);
          setObservations(nextObservations);
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
    [contactId]
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
    [contactId, refreshFacts]
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
    [contactId, refreshFacts]
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
    [contactId, refreshFacts]
  );

  const createObservation = useCallback(
    async (data: CreateObservationRequest) => {
      if (!contactId) {
        throw new Error("Contact id is required.");
      }

      setMutating(true);
      setError(null);

      try {
        const observation = await contactsApi.createObservation(contactId, data);
        await refreshObservations();
        return observation;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [contactId, refreshObservations]
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
          data
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
    [contactId, refreshObservations]
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
    [contactId, refreshObservations]
  );

  return {
    contact,
    facts,
    observations,
    loading,
    mutating,
    error,
    refetch,
    updateContact,
    deleteContact,
    createFact,
    updateFact,
    deleteFact,
    createObservation,
    updateObservation,
    deleteObservation,
  };
}
