"use client";

import { useEffect, useState, useCallback } from "react";
import ContactCard from "@/components/contacts/ContactCard";
import ContactSearchBar from "@/components/contacts/ContactSearchBar";
import { contactsApi, Contact } from "@/lib/api/contactsApi";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = useCallback((q: string) => {
    contactsApi.getAll(q).then(setContacts);
  }, []);

  useEffect(() => {
    fetchContacts("");
  }, [fetchContacts]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Contacts</h1>


      <ContactSearchBar onSearch={fetchContacts} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} />
        ))}
      </div>
    </div>
  );
}