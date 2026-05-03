"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  contactsApi,
  type ContactListParams,
} from "@/lib/api/contactsApi";
import type { ApiError } from "@/types/auth";
import type { ContactListResponse } from "@/types/contacts";

export function useContacts(params: ContactListParams = {}) {
  const [data, setData] = useState<ContactListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const requestParams = useMemo(
    () => ({
      page: params.page,
      page_size: params.page_size,
      name: params.name?.trim() || undefined,
      occupation: params.occupation || undefined,
    }),
    [params.name, params.occupation, params.page, params.page_size]
  );

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await contactsApi.list(requestParams);
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    let isActive = true;

    async function loadContacts() {
      setLoading(true);
      setError(null);

      try {
        const response = await contactsApi.list(requestParams);
        if (isActive) {
          setData(response);
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

    void loadContacts();

    return () => {
      isActive = false;
    };
  }, [requestParams]);

  return {
    data,
    contacts: data?.results ?? [],
    loading,
    error,
    refetch: fetchContacts,
  };
}
