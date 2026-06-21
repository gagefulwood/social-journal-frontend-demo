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
    <section className="sticky top-2 z-20 w-full self-start rounded-lg border border-border/80 bg-card/95 p-3 shadow-sm backdrop-blur md:static md:flex md:h-full md:flex-col md:self-stretch md:bg-card md:p-5 md:backdrop-blur-none">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-left md:flex md:flex-col md:items-center md:text-center">
        <div className="relative size-12 overflow-hidden rounded-full bg-muted shadow-sm ring-4 ring-background md:size-24">
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
            <div className="flex size-full items-center justify-center bg-accent text-base font-semibold text-accent-foreground md:text-2xl">
              {contactInitials(contact)}
            </div>
          )}
        </div>

        <div className="min-w-0 md:mt-4">
          <h1 className="max-w-full truncate text-base font-semibold leading-6 md:break-words md:text-xl md:leading-7">
            {model.displayName}
          </h1>
          <p className="mt-0.5 max-w-full truncate text-sm leading-5 text-muted-foreground md:mx-auto md:mt-1 md:max-w-60 md:whitespace-normal">
            {model.contextLine}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2 md:mt-4">
        <Button
          asChild
          className="h-10 w-full bg-primary-strong text-primary-foreground shadow-sm hover:bg-primary md:h-11"
        >
          <Link href={`/events/new?contact=${contact.id}`}>
            <Plus className="size-4" />
            Log Moment
          </Link>
        </Button>
        <div className="hidden grid-cols-[1fr_auto] gap-2 md:grid">
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

      <div className="mt-5 hidden border-t border-border pt-4 md:block">
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

      <div className="mt-5 hidden border-t border-border pt-4 md:block">
        <div className="mb-3">
          <h2 className="text-xs font-medium uppercase text-muted-foreground">
            Remember next time
          </h2>
        </div>
        <RememberNextTimeList model={model} />
      </div>

      <div className="mt-5 hidden border-t border-border pt-4 md:mt-auto md:block">
        <p className="mb-3 text-xs font-medium uppercase text-muted-foreground">
          Contact
        </p>
        <ContactMethodsCompact
          email={contact.email}
          phoneNumber={contact.phone_number}
        />
      </div>
    </section>
  );
}
