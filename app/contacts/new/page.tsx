"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "@/components/contacts/ContactForm";
import { contactsApi } from "@/lib/api/contactsApi";
import type { CreateContactRequest, UpdateContactRequest } from "@/types/contacts";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <main className="min-w-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header>
          <h1 className="font-display text-3xl sm:text-4xl">
            Create a person to remember
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Capture who they are, how to reach them, and what makes them important.
          </p>
        </header>

        <div className="mt-5">
          <ContactForm
            variant="create"
            submitLabel="Create contact"
            onSubmit={async (data: CreateContactRequest | UpdateContactRequest) => {
              const contact = await contactsApi.create(data as CreateContactRequest);
              toast.success("Contact created.");
              router.push(`/contacts/${contact.id}`);
            }}
          />
        </div>
      </div>
    </main>
  );
}
