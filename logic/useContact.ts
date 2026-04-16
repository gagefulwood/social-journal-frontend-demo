"use client";

import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import { Contact } from "@/models";

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchContact = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await contactsApi.get(id);
        setContact(data);
      } catch (err: unknown) {
        setError(err.message || "Failed to fetch contact");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  return { contact, isLoading, error };
}