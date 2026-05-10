"use client";

import { useState } from "react";
import { eventsApi } from "@/lib/api/eventsApi";
import type { ApiId } from "@/types/api";

type EventFormProps = {
  submitLabel: string;
  onSubmit: (data: any) => Promise<void>;
};

type EventFormValues = {
  title: string;
  event_timestamp: string;
  end_timestamp?: string | null;
  location_label?: string;
  tier?: "routine" | "milestone";
  context_category?: ApiId | null;
  participants?: ApiId[];
};

export function EventsForm({ submitLabel, onSubmit }: EventFormProps) {
  const [form, setForm] = useState<EventFormValues>({
    title: "",
    event_timestamp: "",
    end_timestamp: null,
    location_label: "",
    tier: "routine",
    context_category: null,
    participants: [],
  });

  const update = (key: keyof EventFormValues, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  return (
    <div className="space-y-4 max-w-md">
      <input
        className="border p-2 w-full"
        placeholder="Title"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
      />

      <input
        className="border p-2 w-full"
        type="datetime-local"
        value={form.event_timestamp?.slice(0, 16)}
        onChange={(e) => update("event_timestamp", e.target.value)}
      />

      <input
        className="border p-2 w-full"
        placeholder="Location"
        value={form.location_label}
        onChange={(e) => update("location_label", e.target.value)}
      />

      <select
        className="border p-2 w-full"
        value={form.tier}
        onChange={(e) => update("tier", e.target.value)}
      >
        <option value="routine">Routine</option>
        <option value="milestone">Milestone</option>
      </select>

      <button
        className="bg-black text-white px-4 py-2"
        onClick={handleSubmit}
      >
        {submitLabel}
      </button>
    </div>
  );
}