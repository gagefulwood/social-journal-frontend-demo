"use client";

import { useEffect } from "react";
import { useContactsStore } from "@/store/useContactStore";

export function useContacts() {
  const { contacts, isLoading, error, fetchContacts } = useContactsStore();

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, isLoading, error };
}