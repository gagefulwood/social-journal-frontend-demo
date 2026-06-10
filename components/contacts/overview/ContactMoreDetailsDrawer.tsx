import Link from "next/link";
import { Edit } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDate } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { Contact } from "@/types/contacts";

type ContactMoreDetailsDrawerProps = {
  contact: Contact;
  trigger: ReactNode;
};

export function ContactMoreDetailsDrawer({
  contact,
  trigger,
}: ContactMoreDetailsDrawerProps) {
  const { getEducationLevelById, getOccupationById } = useLookups();
  const occupation = contact.occupation
    ? getOccupationById(contact.occupation)?.name
    : null;
  const education = contact.education_level
    ? getEducationLevelById(contact.education_level)?.name
    : null;

  const details = [
    ["Email", contact.email || "Not set"],
    ["Phone", contact.phone_number || "Not set"],
    ["Birthday", formatDate(contact.birthday)],
    ["Address", contact.address || "Not set"],
    ["First met", formatDate(contact.first_met_date)],
    ["Relationship", contact.relation_name || "Not set"],
    ["Occupation", contact.custom_occupation || occupation || "Not set"],
    ["Company", contact.company || "Not set"],
    ["Education", contact.custom_education_level || education || "Not set"],
    ["School", contact.school || "Not set"],
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>More Details</SheetTitle>
          <SheetDescription>
            Recorded contact fields kept out of the first-glance profile.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4">
          <dl className="divide-y divide-border rounded-md border border-border">
            {details.map(([label, value]) => (
              <div key={label} className="grid gap-1 p-3">
                <dt className="text-xs font-medium uppercase text-muted-foreground">
                  {label}
                </dt>
                <dd className="break-words text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <Button asChild className="mt-4 w-full" variant="outline">
            <Link href={`/contacts/${contact.id}/edit`}>
              <Edit className="size-4" />
              Edit contact
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
