"use client";

import { useParams } from "next/navigation";
import { useContact } from "@/lib/hooks/useContact";
import { ContactForm } from "@/components/contacts/ContactForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditContactPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { contact, isLoading } = useContact(id as string);

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (!contact) {
    return <p className="text-sm text-destructive">Contact not found</p>;
  }

  const mappedContact = {
    id: contact.id,
    first_name: contact.first_name ?? "",
    last_name: contact.last_name ?? "",
    email: contact.email ?? "",
    nickname: contact.nickname ?? "",
    phone_number: contact.phone_number ?? "",
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6">Edit Contact</h2>
      <ContactForm existingContact={mappedContact} />
    </div>
  );
}
