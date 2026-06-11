import Link from "next/link";
import { Edit } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDate } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contacts";

type ContactMoreDetailsDrawerProps = {
  contact: Contact;
  trigger: ReactNode;
};

type DetailItem = {
  label: string;
  value: string | null | undefined;
};

type DetailGroup = {
  title: string;
  items: DetailItem[];
};

function normalizeDetailValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not set";
}

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

  const detailGroups: DetailGroup[] = [
    {
      title: "Contact",
      items: [
        { label: "Email", value: contact.email },
        { label: "Phone", value: contact.phone_number },
        { label: "Address", value: contact.address },
      ],
    },
    {
      title: "Personal Context",
      items: [
        { label: "Birthday", value: formatDate(contact.birthday) },
        { label: "First met", value: formatDate(contact.first_met_date) },
        { label: "Relationship", value: contact.relation_name },
      ],
    },
    {
      title: "Work & School",
      items: [
        { label: "Company", value: contact.company },
        { label: "Occupation", value: contact.custom_occupation || occupation },
        {
          label: "Education",
          value: contact.custom_education_level || education,
        },
        { label: "School", value: contact.school },
      ],
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>More Details</SheetTitle>
          <SheetDescription>
            Recorded contact fields kept out of the first-glance profile.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-2">
          {detailGroups.map((group) => (
            <section key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <dl className="divide-y divide-border rounded-md border border-border bg-background/60">
                {group.items.map((item) => {
                  const value = normalizeDetailValue(item.value);
                  const isMissing = value === "Not set";

                  return (
                    <div key={item.label} className="grid gap-1 p-3">
                      <dt className="text-xs font-medium uppercase text-muted-foreground">
                        {item.label}
                      </dt>
                      <dd
                        className={cn(
                          "break-words text-sm",
                          isMissing && "text-muted-foreground",
                        )}
                      >
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}
        </div>
        <SheetFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href={`/contacts/${contact.id}/edit`}>
              <Edit className="size-4" />
              Edit Contact
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
