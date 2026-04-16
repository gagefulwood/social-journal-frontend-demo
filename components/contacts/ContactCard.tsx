import Link from "next/link";
import { Contact } from "@/lib/api/contactsApi";

export default function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="bg-white p-4 rounded shadow hover:shadow-md cursor-pointer">
        <h3 className="font-semibold">{contact.name}</h3>
        <p className="text-sm text-gray-500">{contact.role}</p>
      </div>
    </Link>
  );
}