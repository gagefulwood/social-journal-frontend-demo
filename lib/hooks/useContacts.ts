import { useEffect, useState } from "react";
import { contactsApi } from "@/lib/api/contactsApi";
import type { Contact } from "@/lib/api/contactsApi";


export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await contactsApi.getAll();
        setContacts(res);
      } catch {
        setError("Failed to load contacts.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return { contacts, isLoading, error };
}
