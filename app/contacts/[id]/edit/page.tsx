"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "@/components/contacts/ContactForm";
import {
  ContactFormLayout,
  ContactFormMain,
  ContactFormRail,
} from "@/components/contacts/form/ContactFormLayout";
import { useContact } from "@/hooks/useContact";

export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { contact, loading, error, updateContact } = useContact(params.id);

  return (
    <main className="min-w-0">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header>
          <h1 className="font-sans text-3xl leading-tight font-semibold sm:text-[2rem]">
            Edit a person you remember
          </h1>
          <p className="mt-1 text-[0.9375rem] leading-6 text-muted-foreground sm:text-base">
            Update who they are, how to reach them, and the details that matter.
          </p>
        </header>

        <div className="mt-4">
          {loading && <EditContactFormSkeleton />}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/5 p-6"
            >
              <p className="font-medium">Unable to load contact</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}

          {contact && (
            <ContactForm
              contact={contact}
              submitLabel="Save contact"
              onSubmit={async (data) => {
                const updated = await updateContact(data);
                toast.success("Contact updated.");
                router.push(`/contacts/${updated.id}`);
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function EditContactFormSkeleton() {
  return (
    <ContactFormLayout aria-label="Loading contact form" aria-busy="true">
      <ContactFormMain>
        <div className="h-56 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none" />
      </ContactFormMain>
      <ContactFormRail className="hidden xl:grid">
        <div className="h-72 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none" />
        <div className="h-56 animate-pulse rounded-xl border border-border bg-muted motion-reduce:animate-none" />
      </ContactFormRail>
    </ContactFormLayout>
  );
}
