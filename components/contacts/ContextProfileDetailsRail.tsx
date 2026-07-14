"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { Edit, Info } from "lucide-react";
import { ProfileDetailsContent } from "@/components/contacts/ProfileDetailsContent";
import { ContactHelperStack } from "@/components/contacts/surfaces/ContactHelperStack";
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contacts";

type ContextProfileDetailsRailProps = {
  contact: Contact;
  highlighted?: boolean;
};

export const ContextProfileDetailsRail = forwardRef<
  HTMLElement,
  ContextProfileDetailsRailProps
>(function ContextProfileDetailsRail({ contact, highlighted = false }, ref) {
  return (
    <ContactHelperStack
      asChild
      className="hidden xl:flex xl:h-full xl:min-h-0 xl:self-stretch xl:overflow-y-auto xl:overscroll-y-contain"
    >
      <aside
        ref={ref}
        tabIndex={-1}
        aria-labelledby="context-profile-details-title"
        className="scroll-mt-4 outline-none"
      >
        <ContactSectionCard
          density="standard"
          className={cn(
            "min-h-full transition-[box-shadow] motion-reduce:transition-none",
            highlighted && "ring-2 ring-primary/30",
          )}
        >
          <ContactSectionHeader
            headingId="context-profile-details-title"
            icon={Info}
            iconTone="violet"
            title="Profile details"
            action={
              <Button asChild variant="ghost" size="sm" className="-mr-2">
                <Link href={`/contacts/${contact.id}/edit`}>
                  <Edit className="size-3.5" />
                  Edit
                </Link>
              </Button>
            }
          />
          <div className="mt-4">
            <ProfileDetailsContent contact={contact} />
          </div>
        </ContactSectionCard>
      </aside>
    </ContactHelperStack>
  );
});

ContextProfileDetailsRail.displayName = "ContextProfileDetailsRail";
