"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useContact } from "@/lib/hooks/useContact";
import { eventsApi } from "@/lib/api/eventsApi";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { TrustScoreSlider } from "@/components/contacts/TrustScoreSlider";
import PersonalDetailsPanel from "@/components/contacts/PersonalDetailsPanel";
import LooseNotesPanel from "@/components/contacts/LooseNotesPanel";

import Link from "next/link";

type Event = {
  id: number;
  title: string;
  scheduled_at: string;
};

export default function ContactProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { contact, isLoading, error } = useContact(id);

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!id) return;

    eventsApi.list({ contact: Number(id), limit: 5 }).then(setEvents);
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error || !contact) {
    return <p className="text-red-500 text-sm">Contact not found.</p>;
  }

  const initials = `${contact.first_name?.[0] ?? ""}${contact.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
    
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 text-xl">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold">
            {contact.first_name} {contact.last_name}
          </h2>

          {contact.nickname && (
            <p className="text-gray-500">{contact.nickname}</p>
          )}

          {contact.email && (
            <p className="text-sm text-gray-500">{contact.email}</p>
          )}
        </div>

        <Button asChild>
          <Link href={`/contacts/${contact.id}/edit`}>Edit</Link>
        </Button>
      </div>

    
      <TrustScoreSlider
        contactId={contact.id}
        value={contact.trust_score ?? 50}
      />

    
      <PersonalDetailsPanel contactId={contact.id} />

    
      <LooseNotesPanel contactId={contact.id} />


      <div className="space-y-2">
        <h3 className="font-semibold">Recent Events</h3>

        {events.length === 0 && (
          <p className="text-sm text-gray-500">No recent events.</p>
        )}

        {events.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-4">
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(e.scheduled_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}