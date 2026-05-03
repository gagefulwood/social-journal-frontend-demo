"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contacts/ContactForm";
import { contactsApi } from "@/lib/api/contactsApi";
import type { CreateContactRequest, UpdateContactRequest } from "@/types/contacts";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">New Contact</h1>
          <p className="text-sm text-muted-foreground">
            Add identity, contact, and background details.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/contacts">Cancel</Link>
        </Button>
      </div>

      <ContactForm
        submitLabel="Create Contact"
        onSubmit={async (data: CreateContactRequest | UpdateContactRequest) => {
          const contact = await contactsApi.create(data as CreateContactRequest);
          toast.success("Contact created.");
          router.push(`/contacts/${contact.id}`);
        }}
      />
    </main>
  );
}
