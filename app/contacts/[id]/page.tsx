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
    factsPage,
    observations,
    loading,
    error,
    factsError,
    observationsError,
    deleteContact,
    createFact,
    updateFact,
    deleteFact,
    pinFact,
    unpinFact,
    createObservation,
    updateObservation,
    deleteObservation,
    pinObservation,
    unpinObservation,
  } = useContact(params.id);

  async function confirmDelete() {
    await deleteContact();
    toast.success("Contact deleted.");
    router.push("/contacts");
  }

  return (
    <main className="min-h-screen min-w-0 bg-background xl:h-full xl:min-h-0">
      <div className="mx-auto w-full max-w-[1760px] px-4 py-4 sm:px-5 lg:px-4 xl:flex xl:h-full xl:min-h-0 xl:flex-col">
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
            factsCount={factsPage?.count}
            factsError={factsError}
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
            observationsError={observationsError}
            onDeleteContact={confirmDelete}
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
            onPinFact={async (factId) => {
              try {
                await pinFact(factId);
                toast.success("Fact pinned.");
              } catch {
                toast.error("Unable to pin fact.");
              }
            }}
            onUnpinFact={async (factId) => {
              try {
                await unpinFact(factId);
                toast.success("Fact unpinned.");
              } catch {
                toast.error("Unable to unpin fact.");
              }
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
            onPinObservation={async (observationId) => {
              try {
                await pinObservation(observationId);
                toast.success("Observation pinned.");
              } catch {
                toast.error("Unable to pin observation.");
              }
            }}
            onUnpinObservation={async (observationId) => {
              try {
                await unpinObservation(observationId);
                toast.success("Observation unpinned.");
              } catch {
                toast.error("Unable to unpin observation.");
              }
            }}
          />
        )}
      </div>
    </main>
  );
}
