"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contacts/ContactForm";
import { useContact } from "@/hooks/useContact";

export default function EditContactPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { contact, loading, error, updateContact } = useContact(params.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Edit Contact</h1>
          <p className="text-sm text-muted-foreground">
            Update this contact profile.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/contacts/${params.id}`}>Cancel</Link>
        </Button>
      </div>

      {loading && (
        <div className="h-96 animate-pulse rounded-lg border border-border bg-muted" />
      )}

      {error && (
        <div className="rounded-lg border border-border p-6">
          <p className="font-medium">Unable to load contact</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {contact && (
        <ContactForm
          contact={contact}
          submitLabel="Save Contact"
          onSubmit={async (data) => {
            const updated = await updateContact(data);
            toast.success("Contact updated.");
            router.push(`/contacts/${updated.id}`);
          }}
        />
      )}
    </main>
  );
}
