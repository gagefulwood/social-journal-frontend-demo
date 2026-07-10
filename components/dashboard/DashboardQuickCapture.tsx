"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, PenLine, UserRound } from "lucide-react";
import { toast } from "sonner";
import { ContactPicker } from "@/components/contacts/ContactPicker";
import { contactName } from "@/components/contacts/contact-utils";
import { IconBadge } from "@/components/ui/icon-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { eventsApi } from "@/lib/api/eventsApi";
import type { ApiId } from "@/types/api";
import type { ContactListItem } from "@/types/contacts";

type DashboardQuickCaptureProps = {
  onCreated: () => Promise<void>;
};

function localDateTimeValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function DashboardQuickCapture({
  onCreated,
}: DashboardQuickCaptureProps) {
  const [title, setTitle] = useState("");
  const [eventTimestamp, setEventTimestamp] = useState(localDateTimeValue);
  const [contactId, setContactId] = useState<ApiId | null>(null);
  const [contactLabel, setContactLabel] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectContact(contact: ContactListItem | null) {
    setContactLabel(contact ? contactName(contact) : null);
    setPickerOpen(false);
  }

  async function saveMoment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await eventsApi.create({
        title: trimmedTitle,
        event_timestamp: new Date(eventTimestamp).toISOString(),
        participants: contactId == null ? [] : [contactId],
      });
      setTitle("");
      setEventTimestamp(localDateTimeValue());
      setContactId(null);
      setContactLabel(null);
      await onCreated();
      toast.success("Moment saved.");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save this moment.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-border/80 bg-card p-3 shadow-sm sm:p-4"
      onSubmit={(event) => void saveMoment(event)}
    >
      <div className="grid gap-2.5 lg:grid-cols-[auto_minmax(0,1.25fr)_minmax(180px,.7fr)_minmax(180px,.65fr)_auto] lg:items-center">
        <IconBadge tone="violet" size="md">
          <PenLine aria-hidden="true" />
        </IconBadge>

        <label className="min-w-0">
          <span className="sr-only">What happened?</span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What happened?"
            aria-describedby={error ? "dashboard-capture-error" : undefined}
            className="h-11 bg-background"
            disabled={submitting}
          />
        </label>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start font-normal text-muted-foreground"
              disabled={submitting}
            >
              <UserRound className="size-4" />
              <span className="truncate">{contactLabel ?? "With whom?"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))]">
            <p className="font-medium">With whom?</p>
            <ContactPicker
              value={contactId ?? undefined}
              onChange={(value) => {
                setContactId(Array.isArray(value) ? value[0] ?? null : value);
                if (value == null) {
                  setContactLabel(null);
                }
              }}
              onContactSelect={selectContact}
            />
          </PopoverContent>
        </Popover>

        <label className="relative min-w-0">
          <span className="sr-only">When?</span>
          <CalendarDays
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="datetime-local"
            value={eventTimestamp}
            onChange={(event) => setEventTimestamp(event.target.value)}
            className="h-11 bg-background pl-9"
            disabled={submitting}
          />
        </label>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full lg:w-auto"
          disabled={!title.trim() || !eventTimestamp || submitting}
        >
          {submitting ? "Saving..." : "Save moment"}
        </Button>
      </div>

      {error && (
        <p id="dashboard-capture-error" role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
