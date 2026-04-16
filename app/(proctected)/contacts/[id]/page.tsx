"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { contactsApi, Contact } from "@/lib/api/contactsApi";

import TrustScoreSlider from "@/components/contacts/TrustScoreSlider";
import ClosenessBadge from "@/components/contacts/ClosenessBadge";
import PersonalDetailsPanel from "@/components/contacts/PersonalDetailsPanel";
import LooseNotesPanel from "@/components/contacts/LooseNotesPanel";

type Event = {
  id: number;
  title: string;
  date: string;
};

export default function ContactProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const contactData = await contactsApi.getById(id);
      const eventData = await contactsApi.getRecentEvents(id);

      setContact(contactData);
      setEvents(eventData);
    };

    load();
  }, [id]);


  if (!contact) return <div>Loading...</div>;

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{contact.name}</h1>
          <p className="text-gray-500">{contact.role}</p>
        </div>

        <ClosenessBadge value={contact.closeness ?? "Unknown"} />
      </div>


      <TrustScoreSlider
        contactId={id}
        value={contact.trustScore ?? 50}
      />


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalDetailsPanel contactId={id} />
        <LooseNotesPanel contactId={id} />
      </div>


      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Events</h2>

        {events.length === 0 ? (
          <p className="text-gray-500">No recent events</p>
        ) : (
          events.slice(0, 5).map((e) => (
            <div key={e.id} className="bg-white p-3 rounded shadow mb-2">
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-gray-500">{e.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}