"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, PenLine, UserRound } from "lucide-react";
import { toast } from "sonner";
import { ContactPicker } from "@/components/contacts/ContactPicker";
import { contactName } from "@/components/contacts/contact-utils";
import {
  NewJournalChooser,
  type NewJournalChooserOption,
} from "@/components/journals/chooser/NewJournalChooser";
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

type SubmitIntent = "save" | "journal";

type SavedJournalContext = {
  eventId: ApiId;
  contactId: ApiId | null;
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
  const [submitIntent, setSubmitIntent] = useState<SubmitIntent | null>(null);
  const [journalContext, setJournalContext] =
    useState<SavedJournalContext | null>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const submitting = submitIntent != null;
  const [error, setError] = useState<string | null>(null);

  function selectContact(contact: ContactListItem | null) {
    setContactLabel(contact ? contactName(contact) : null);
    setPickerOpen(false);
  }

  function clearSavedJournalContext() {
    if (!journalContext) {
      return;
    }

    setJournalContext(null);
    setChooserOpen(false);
  }

  async function createMoment(intent: SubmitIntent) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || !eventTimestamp || submitting) {
      return;
    }

    const savedContactId = contactId;
    setSubmitIntent(intent);
    setError(null);

    try {
      const created = await eventsApi.create({
        title: trimmedTitle,
        event_timestamp: new Date(eventTimestamp).toISOString(),
        participants: savedContactId == null ? [] : [savedContactId],
      });
      setSubmitIntent(null);

      setTitle("");
      setEventTimestamp(localDateTimeValue());
      setContactId(null);
      setContactLabel(null);

      if (intent === "journal") {
        setJournalContext({
          eventId: created.id,
          contactId: savedContactId,
        });
        setChooserOpen(true);
      } else {
        setJournalContext(null);
        setChooserOpen(false);
      }

      toast.success(
        intent === "journal"
          ? "Moment saved. Choose a journal."
          : "Moment saved.",
      );

      try {
        await onCreated();
      } catch {
        toast.error("Moment saved, but the dashboard could not refresh.");
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save this moment.";
      setError(message);
    } finally {
      setSubmitIntent(null);
    }
  }

  function saveMoment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void createMoment("save");
  }

  function getJournalOptionHref(option: NewJournalChooserOption) {
    if (!journalContext) {
      return option.href;
    }

    const context = new URLSearchParams({
      event: String(journalContext.eventId),
    });
    if (journalContext.contactId != null) {
      context.set("contact", String(journalContext.contactId));
    }

    return `${option.href}?${context.toString()}`;
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
            onChange={(event) => {
              clearSavedJournalContext();
              setTitle(event.target.value);
            }}
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
          <PopoverContent
            align="start"
            className="w-[min(22rem,calc(100vw-2rem))]"
          >
            <p className="font-medium">With whom?</p>
            <ContactPicker
              value={contactId ?? undefined}
              onChange={(value) => {
                clearSavedJournalContext();
                setContactId(Array.isArray(value) ? (value[0] ?? null) : value);
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
            onChange={(event) => {
              clearSavedJournalContext();
              setEventTimestamp(event.target.value);
            }}
            className="h-11 bg-background pl-9"
            disabled={submitting}
          />
        </label>

        <div className="flex flex-wrap gap-2 lg:flex-nowrap">
          <Button
            type="submit"
            size="lg"
            className="h-11 flex-1 whitespace-nowrap lg:flex-none"
            disabled={!title.trim() || !eventTimestamp || submitting}
          >
            {submitIntent === "save" ? "Saving..." : "Save moment"}
          </Button>
          <NewJournalChooser
            open={chooserOpen}
            onOpenChange={(nextOpen) => {
              if (journalContext) {
                setChooserOpen(nextOpen);
              }
            }}
            getOptionHref={getJournalOptionHref}
            onOptionSelect={() => setChooserOpen(false)}
            trigger={
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-11 flex-1 whitespace-nowrap lg:flex-none"
                disabled={
                  submitting ||
                  (!journalContext && (!title.trim() || !eventTimestamp))
                }
                onClick={(event) => {
                  if (journalContext) {
                    return;
                  }

                  event.preventDefault();
                  void createMoment("journal");
                }}
              >
                {submitIntent === "journal"
                  ? "Saving..."
                  : journalContext
                    ? "Choose journal"
                    : "Save & journal"}
              </Button>
            }
          />
        </div>
      </div>

      {error && (
        <p
          id="dashboard-capture-error"
          role="alert"
          className="mt-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </form>
  );
}
