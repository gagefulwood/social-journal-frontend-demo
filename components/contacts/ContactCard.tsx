"use client";

import Link from "next/link";
import type { Contact } from "@/lib/api/contactsApi";

type Props = {
  contact: Contact;
};

export function ContactCard({ contact }: Props) {
  const initials = `${contact.first_name[0] ?? ""}${contact.last_name[0] ?? ""}`.toUpperCase();

  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
            {initials}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold">
              {contact.first_name} {contact.last_name}
            </h3>

            {contact.nickname && (
              <p className="text-sm text-gray-500">
                {contact.nickname}
              </p>
            )}

            {contact.email && (
              <p className="text-xs text-gray-400">
                {contact.email}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex justify-between text-sm text-gray-600">
          <span>Trust</span>
          <span>{contact.trust_score ?? 0}</span>
        </div>
      </div>
    </Link>
  );
}