"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/types/auth";
import { ContextCategory } from "@/types/lookups";
import type { Contact, ContactListItem } from "@/types/contacts";
import { contactsApi } from "@/lib/api/contactsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
} from "@/types/events";

const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  event_timestamp: z.string().min(1, "Date is required"),
  location_label: z.string().optional(),
  tier: z.enum(["routine", "milestone"]),
  context_category: z.union([z.string(), z.number()]).nullable().optional(),
  participants: z.array(z.string()),
  journal_type: z.string().optional(),
});

const journalTypes = [
  { label: "Log", value: "reflection", route: "/journals/new" },
  {
    label: "Reflection",
    value: "incident",
    route: "/journals/reflections/new",
  },
  { label: "Exercise", value: "exercise", route: "/journals/exercises/new" },
];

type EventFormValues = z.infer<typeof eventFormSchema>;

type EventFormProps = {
  initialData?: Event;
  initialContactId?: string | null;
  submitLabel: string;
  categories: ContextCategory[];
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>;
};

export function EventsForm({
  initialData,
  initialContactId,
  submitLabel,
  categories,
  onSubmit,
}: EventFormProps) {
  const router = useRouter();

  const [error, setError] = useState<ApiError | null>(null);
  const [contacts, setContacts] = useState<ContactListItem[]>([]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      event_timestamp: initialData?.event_timestamp?.slice(0, 16) ?? "",
      location_label: initialData?.location_label ?? "",
      tier: initialData?.tier ?? "routine",
      context_category: initialData?.context_category ?? null,
      participants:
        initialData?.participants?.map((p) => String(p.contact.id)) ?? [],
      journal_type: undefined,
    },
  });
  const selectedParticipants =
    useWatch({
      control: form.control,
      name: "participants",
    }) ?? [];

  useEffect(() => {
    async function load() {
      const res = await contactsApi.list();
      let nextContacts = res.results;

      if (
        initialContactId &&
        !nextContacts.some((contact) => String(contact.id) === initialContactId)
      ) {
        try {
          const contact = await contactsApi.get(initialContactId);
          nextContacts = [toContactListItem(contact), ...nextContacts];
        } catch {
          // Ignore invalid contact query params; the form remains usable.
        }
      }

      setContacts(nextContacts);
    }

    load();
  }, [initialContactId]);

  useEffect(() => {
    if (!initialContactId || initialData) {
      return;
    }

    const contactExists = contacts.some(
      (contact) => String(contact.id) === initialContactId,
    );

    if (!contactExists) {
      return;
    }

    const currentParticipants = form.getValues("participants");

    if (!currentParticipants.includes(initialContactId)) {
      form.setValue("participants", [...currentParticipants, initialContactId]);
    }
  }, [contacts, form, initialContactId, initialData]);

  async function handleSubmit(values: EventFormValues) {
    setError(null);

    try {
      await onSubmit({
        ...values,
        context_category: values.context_category || null,
      });
    } catch (err) {
      setError(err as ApiError);
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="rounded-xl border border-border bg-card p-8"
    >
      <h1 className="mb-8 text-3xl font-semibold">{submitLabel}</h1>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            <p className="text-sm text-destructive">
              {form.formState.errors.title?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_timestamp">Date</Label>
            <Input
              id="event_timestamp"
              type="datetime-local"
              {...form.register("event_timestamp")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_label">Location</Label>
            <Input id="location_label" {...form.register("location_label")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <select
              id="tier"
              className="w-full rounded-md border border-input bg-background p-3"
              {...form.register("tier")}
            >
              <option value="routine">Routine</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="context_category">Category</Label>
            <select
              id="context_category"
              className="w-full rounded-md border border-input bg-background p-3"
              {...form.register("context_category")}
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-5">
          {/* This is the part where I'm adding contacts to all of this... though I'm not sure how to make this display on the contacts' pages*/}
          <div>
            <p className="mb-4 text-xl font-medium">Participants</p>

            <div className="flex flex-wrap gap-4">
              {selectedParticipants.map((id) => {
                const contact = contacts.find(
                  (c) => String(c.id) === String(id),
                );

                return (
                  <div
                    key={id}
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-full border bg-muted text-xs text-center p-2"
                  >
                    <span className="font-medium leading-tight">
                      {contact
                        ? `${contact.first_name} ${contact.last_name}`
                        : "Unknown"}
                    </span>
                  </div>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-20 w-20 items-center justify-center rounded-full border text-3xl transition hover:bg-muted"
                  >
                    +
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="max-h-64 overflow-auto"
                >
                  {contacts
                    .filter((c) => !selectedParticipants.includes(String(c.id)))
                    .map((contact) => (
                      <DropdownMenuItem
                        key={contact.id}
                        onClick={() => {
                          const current = form.getValues("participants");

                          form.setValue("participants", [
                            ...current,
                            String(contact.id),
                          ]);
                        }}
                      >
                        {contact.first_name} {contact.last_name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* holy crap this was hard to implement but i got it i think*/}
      {/* ALSO README: NEED TO ADD CONNECT CURRENT JOURNALS FUNCTION */}
      <div className="mt-10">
        <p className="mb-3 text-xl font-medium">Journals</p>

        <div className="relative flex h-20 items-center rounded-md border border-input bg-background px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border bg-muted text-2xl transition hover:bg-accent"
              >
                +
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {journalTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => {
                    form.setValue("journal_type", type.value);

                    const route = initialData?.id
                      ? `${type.route}?event=${initialData.id}`
                      : type.route;
                    router.push(route);
                  }}
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive">{error.message}</p>
      )}
      <div className="mt-8 flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

function toContactListItem(contact: Contact): ContactListItem {
  return {
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone_number: contact.phone_number,
    relation: contact.relation,
    relation_name: contact.relation_name,
    occupation: contact.occupation,
    occupation_name: contact.occupation_name,
    profile_picture: contact.profile_picture,
    interaction_frequency_score: contact.interaction_frequency_score,
    relationship_trend: contact.relationship_trend,
    connection_strength: contact.connection_strength,
  };
}
