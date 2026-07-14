import Link from "next/link";
import { Edit } from "lucide-react";
import { ProfileDetailsContent } from "@/components/contacts/ProfileDetailsContent";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Contact } from "@/types/contacts";

export function ProfileDetailsSheet({
  contact,
  open,
  onOpenChange,
}: {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Profile details</SheetTitle>
          <SheetDescription>
            Stable reference information for this contact.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ProfileDetailsContent contact={contact} />
        </div>
        <SheetFooter>
          <Button asChild className="w-full" variant="outline">
            <Link href={`/contacts/${contact.id}/edit`}>
              <Edit className="size-4" />
              Edit contact
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
