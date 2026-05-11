"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/types/auth";
import { ContextCategory } from "@/types/lookups";
import type { ContactListItem } from "@/types/contacts";
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
  { label: "Log", value: "reflection", route: "/journals/logs/new" },
  { label: "Reflection", value: "incident", route: "/journals/reflections/new" },
  { label: "Exercise", value: "exercise", route: "/journals/exercises/new" },
];

type EventFormValues = z.infer<typeof eventFormSchema>;

type EventFormProps = {
  initialData?: Event;
  submitLabel: string;
  categories: ContextCategory[];
  onSubmit: (
    data: CreateEventRequest | UpdateEventRequest
  ) => Promise<void>;
};

export function EventsForm({
  initialData,
  submitLabel,
  categories,
  onSubmit,
}: EventFormProps) {
  const router = useRouter();

  const [error, setError] = useState<ApiError | null>(null);
  const [contacts, setContacts] = useState<ContactListItem[]>([]);

  useEffect(() => {
    async function load() {
      const res = await contactsApi.list();
      setContacts(res.results);
    }

    load();
  }, []);

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
      <h1 className="mb-8 text-3xl font-semibold">
        {submitLabel}
      </h1>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            <p className="text-sm text-red-500">
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
            <Input
              id="location_label"
              {...form.register("location_label")}
            />
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
            <p className="mb-4 text-xl font-medium">
              Participants
            </p>

            <div className="flex flex-wrap gap-4">
              {form.watch("participants").map((id) => {
                const contact = contacts.find((c) => c.id === id);

                {/* This I need help with bc i need it to display contact avatar OR initials? rn i just have the dots... */}
                return (

                  <div
                    key={id}
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-grey-300 bg-grey-100 text-xs"
                  >
                    <span className="font-medium">
                      {`${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`.trim()}
                    </span>
                  </div>
                );
              })}

              <button
                type="button"
                className="flex h-20 w-20 items-center justify-center rounded-full border text-3xl transition hover:bg-muted"
                onClick={() => {
                  const current = form.getValues("participants");

                  const available = contacts.filter(
                    (c) => !current.includes(String(c.id))
                  );

                  if (!available.length) return;

                  form.setValue("participants", [
                    ...current,
                    String(available[0].id),
                  ]);
                }}
              >
                +
              </button>
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

                    router.push(type.route);
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
        <p className="mt-4 text-sm text-red-500">
          {error.message}
        </p>
      )}
      <div className="mt-8 flex justify-end">
        <Button type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}