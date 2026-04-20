"use client";

import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import { Contact } from "@/lib/api/contactsApi";

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
        const data = await contactsApi.get(Number(id));
        setContact(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message); 
        } else {
          setError("Failed to fetch contact");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  return { contact, isLoading, error };
}