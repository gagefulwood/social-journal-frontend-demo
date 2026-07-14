"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Edit,
  Info,
  MoreHorizontal,
  PenLine,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContactMethodsCompact } from "./ContactMethodsCompact";
import {
  contactInitials,
  contactName,
  formatDate,
} from "@/components/contacts/contact-utils";
import type { Contact } from "@/types/contacts";
import type { EventListItem } from "@/types/events";
import type { ContactOverviewModel } from "./contact-overview-utils";

type ContactProfileRailProps = {
  contact: Contact;
  model: ContactOverviewModel;
  lastInteraction: EventListItem | null;
  lastInteractionLoading?: boolean;
  onAddNote: () => void;
  onDeleteContact?: () => Promise<void>;
  onViewProfileDetails: () => void;
};

export function ContactProfileRail({
  contact,
  model,
  lastInteraction,
  lastInteractionLoading = false,
  onAddNote,
  onDeleteContact,
  onViewProfileDetails,
}: ContactProfileRailProps) {
  const name = contactName(contact);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!onDeleteContact || deleting) {
      return;
    }
    setDeleting(true);
    try {
      await onDeleteContact();
    } finally {
      setDeleting(false);
    }
  }

  function handleProfileDetails() {
    onViewProfileDetails();
  }

  const identityMetadata = [
    contact.gender_identity?.trim(),
    contact.pronouns?.trim(),
    contact.age == null ? null : String(contact.age),
  ].filter(Boolean);
  const primaryEmail = contact.contact_methods?.find(
    (method) => method.kind === "email" && method.is_primary,
  )?.value;
  const primaryPhone = contact.contact_methods?.find(
    (method) => method.kind === "phone" && method.is_primary,
  )?.value;

  return (
    <section className="relative flex w-full min-w-0 max-w-full flex-col rounded-lg border border-border/80 bg-card p-4 shadow-sm xl:h-full xl:max-h-full xl:min-h-0 xl:self-stretch xl:overflow-y-auto xl:overscroll-y-contain xl:p-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 right-3 z-10 bg-card/90"
            aria-label={`Contact actions for ${name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem asChild>
            <Link href={`/contacts/${contact.id}/edit`}>
              <Edit className="size-4" />
              Edit contact
            </Link>
          </DropdownMenuItem>
          {onDeleteContact && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete contact
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-left xl:flex xl:flex-col xl:items-center xl:text-center">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted shadow-sm ring-4 ring-background xl:size-24 2xl:size-28">
          {contact.profile_picture?.url ? (
            <div
              role="img"
              aria-label={contact.profile_picture.alt_text || name}
              className="size-full object-cover"
              style={{
                backgroundImage: `url(${contact.profile_picture.url})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-accent text-lg font-semibold text-accent-foreground xl:text-2xl">
              {contactInitials(contact)}
            </div>
          )}
        </div>

        <div className="min-w-0 pr-8 xl:mt-4 xl:pr-0">
          <h1 className="max-w-full break-words text-lg font-semibold leading-6 [overflow-wrap:anywhere] xl:text-xl xl:leading-7">
            {model.displayName}
          </h1>
          <p className="mt-0.5 max-w-full break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere] xl:mx-auto xl:mt-1 xl:max-w-60">
            {model.relationshipLabel || "Saved contact"}
          </p>
          {identityMetadata.length > 0 && (
            <p className="mt-2 inline-flex min-w-0 max-w-full items-start gap-1.5 text-xs leading-4 text-muted-foreground">
              <UserRound
                className="mt-px size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span className="break-words [overflow-wrap:anywhere]">
                {identityMetadata.join(" · ")}
              </span>
            </p>
          )}
          {(contact.first_met_on || contact.first_met_date) && (
            <p className="mt-2 inline-flex min-w-0 max-w-full items-center gap-1.5 text-xs leading-4 text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="break-words [overflow-wrap:anywhere]">
                First met ·{" "}
                {formatDate(contact.first_met_on || contact.first_met_date)}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button asChild className="h-11 w-full sm:h-9">
          <Link href={`/events/new?contact=${contact.id}`}>
            <Plus className="size-4 shrink-0" />
            Log moment
          </Link>
        </Button>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-0 w-full bg-background/80 px-2.5 sm:h-9"
            onClick={onAddNote}
          >
            <PenLine className="size-4 shrink-0" />
            <span>Add observation</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-0 w-full bg-background/80 px-2.5 sm:h-9"
            onClick={handleProfileDetails}
          >
            <Info className="size-4 shrink-0" />
            <span>Profile details</span>
          </Button>
        </div>
      </div>

      <div className="mt-5 hidden border-t border-border pt-4 xl:block">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Last shared
            </p>
            {lastInteractionLoading ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Loading shared moment…
              </p>
            ) : lastInteraction ? (
              <>
                <p
                  title={lastInteraction.title || "Untitled event"}
                  className="mt-1 break-words text-sm font-medium [overflow-wrap:anywhere]"
                >
                  {lastInteraction.title || "Untitled event"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(lastInteraction.event_timestamp)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                No shared moments yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 hidden border-t border-border pt-4 xl:mt-auto xl:block">
        <ContactMethodsCompact
          email={primaryEmail || contact.email}
          phoneNumber={primaryPhone || contact.phone_number}
        />
      </div>

      {onDeleteContact && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete contact?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the contact and related contact facts and
                observations. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
}
