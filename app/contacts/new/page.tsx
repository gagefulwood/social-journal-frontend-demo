"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "@/components/contacts/ContactForm";
import { contactsApi } from "@/lib/api/contactsApi";
import type {
  CreateContactRequest,
  UpdateContactRequest,
} from "@/types/contacts";

export default function NewContactPage() {
  const router = useRouter();

  return (
    <main className="min-w-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header>
          <h1 className="font-sans text-3xl leading-tight font-semibold sm:text-[2rem]">
            Create a person to remember
          </h1>
          <p className="mt-1 text-[0.9375rem] leading-6 text-muted-foreground sm:text-base">
            Start with what matters. Add the rest whenever it is useful.
          </p>
        </header>

        <div className="mt-4">
          <ContactForm
            submitLabel="Create contact"
            onSubmit={async (
              data: CreateContactRequest | UpdateContactRequest,
            ) => {
              const contact = await contactsApi.create(
                data as CreateContactRequest,
              );
              toast.success("Contact created.");
              router.push(`/contacts/${contact.id}`);
            }}
          />
        </div>
      </div>
    </main>
  );
}
