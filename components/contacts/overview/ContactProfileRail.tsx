import Link from "next/link";
import { CalendarClock, MoreHorizontal, PenLine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactMethodsCompact } from "./ContactMethodsCompact";
import { ContactMoreDetailsDrawer } from "./ContactMoreDetailsDrawer";
import { RememberNextTimeList } from "./RememberNextTimeList";
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
  onAddNote: () => void;
};

export function ContactProfileRail({
  contact,
  model,
  lastInteraction,
  onAddNote,
}: ContactProfileRailProps) {
  const name = contactName(contact);

  return (
    <section className="flex h-full w-full flex-col rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative size-28 overflow-hidden rounded-full bg-muted shadow-sm ring-4 ring-background">
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
            <div className="flex size-full items-center justify-center bg-accent text-2xl font-semibold text-accent-foreground">
              {contactInitials(contact)}
            </div>
          )}
        </div>

        <h1 className="mt-5 max-w-full break-words text-2xl font-semibold leading-8">
          {model.displayName}
        </h1>
        <p className="mt-2 max-w-64 text-sm leading-6 text-muted-foreground">
          {model.contextLine}
        </p>
      </div>

      <div className="mt-5 space-y-2">
        <Button
          asChild
          className="h-11 w-full bg-primary-strong text-primary-foreground shadow-sm hover:bg-primary"
        >
          <Link href={`/events/new?contact=${contact.id}`}>
            <Plus className="size-4" />
            Log Moment
          </Link>
        </Button>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full bg-background/80"
            onClick={onAddNote}
          >
            <PenLine className="size-4" />
            Add Note
          </Button>
          <ContactMoreDetailsDrawer
            contact={contact}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full bg-background/80"
                aria-label="More contact details"
              >
                <MoreHorizontal className="size-4" />
                <span>More</span>
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 size-4 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Last interaction
            </p>
            {lastInteraction ? (
              <>
                <p className="mt-1 line-clamp-2 text-sm font-medium">
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

      <div className="mt-7">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Remember next time</h2>
        </div>
        <RememberNextTimeList model={model} />
      </div>

      <div className="mt-auto border-t border-border pt-6">
        <p className="mb-3 text-sm font-semibold">Contact</p>
        <ContactMethodsCompact
          email={contact.email}
          phoneNumber={contact.phone_number}
        />
      </div>
    </section>
  );
}
