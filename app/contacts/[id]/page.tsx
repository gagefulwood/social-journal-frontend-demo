"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ContactDetailPanel } from "@/components/contacts/ContactDetailPanel";
import { ContactOverviewSkeleton } from "@/components/contacts/overview/ContactOverviewSkeleton";
import { useContact } from "@/hooks/useContact";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    contact,
    facts,
    observations,
    loading,
    error,
    deleteContact,
    createFact,
    updateFact,
    deleteFact,
    createObservation,
    updateObservation,
    deleteObservation,
  } = useContact(params.id);

  async function confirmDelete() {
    await deleteContact();
    toast.success("Contact deleted.");
    router.push("/contacts");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[1760px] px-4 py-4 sm:px-5 lg:px-4">
        {loading && <ContactOverviewSkeleton />}

        {error && (
          <div className="rounded-lg border border-border p-6">
            <p className="font-medium">Unable to load contact</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}

        {!loading && !error && !contact && (
          <div className="rounded-lg border border-border p-6">
            Contact not found.
          </div>
        )}

        {contact && (
          <ContactDetailPanel
            contact={contact}
            facts={facts}
            headerStart={
              <Button asChild variant="outline">
                <Link href="/contacts">
                  <ArrowLeft className="size-4" />
                  Back
                </Link>
              </Button>
            }
            headerEnd={
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the contact and related contact facts and
                      observations. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => void confirmDelete()}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
            observations={observations}
            onCreateFact={async (data) => {
              await createFact(data);
              toast.success("Fact added.");
            }}
            onUpdateFact={async (factId, data) => {
              await updateFact(factId, data);
              toast.success("Fact updated.");
            }}
            onDeleteFact={async (factId) => {
              await deleteFact(factId);
              toast.success("Fact deleted.");
            }}
            onCreateObservation={async (data) => {
              await createObservation(data);
              toast.success("Observation added.");
            }}
            onUpdateObservation={async (observationId, data) => {
              await updateObservation(observationId, data);
              toast.success("Observation updated.");
            }}
            onDeleteObservation={async (observationId) => {
              await deleteObservation(observationId);
              toast.success("Observation deleted.");
            }}
          />
        )}
      </div>
    </main>
  );
}
