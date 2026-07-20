"use client";

import { useState, type FormEvent } from "react";
import { BookOpen } from "lucide-react";

import { contactName } from "@/components/contacts/contact-utils";
import { EventParticipantAvatar } from "@/components/events/detail/EventParticipantAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  CreateEventChapterRequest,
  EventChapterDetail,
} from "@/types/events";
import type { ContactListItem } from "@/types/contacts";

type ChapterFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  chapter?: EventChapterDetail | null;
  eventParticipants: ContactListItem[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEventChapterRequest) => Promise<void>;
};

export function ChapterFormDialog({
  open,
  mode,
  chapter,
  eventParticipants,
  onOpenChange,
  onSubmit,
}: ChapterFormDialogProps) {
  const editing = mode === "edit";
  const [title, setTitle] = useState(() => {
    if (!editing) return "";
    const initialTitle = chapter?.title ?? "";
    return chapter?.is_projection ? initialTitle.slice(0, 120) : initialTitle;
  });
  const [start, setStart] = useState(() =>
    editing ? toDateTimeInput(chapter?.start_timestamp) : "",
  );
  const [end, setEnd] = useState(() =>
    editing ? toDateTimeInput(chapter?.end_timestamp) : "",
  );
  const [location, setLocation] = useState(() =>
    editing ? (chapter?.location_label ?? "") : "",
  );
  const [note, setNote] = useState(() =>
    editing ? (chapter?.note ?? chapter?.description ?? "") : "",
  );
  const [inheritsParticipants, setInheritsParticipants] = useState(
    () => chapter?.inherits_event_participants ?? true,
  );
  const [participantIds, setParticipantIds] = useState<string[]>(() =>
    chapter?.inherits_event_participants === false
      ? (chapter.effective_participants ?? []).map((contact) =>
          String(contact.id),
        )
      : [],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setError("Chapter title is required.");
      return;
    }
    if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
      setError("Chapter end must not be before its start.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: normalizedTitle,
        start_timestamp: toIsoOrNull(start),
        end_timestamp: toIsoOrNull(end),
        // Blank means "inherit the Event location". The chapter API models
        // that as an empty string; null is not a valid CharField value.
        location_label: location.trim(),
        note: note.trim(),
        inherits_event_participants: inheritsParticipants,
        participant_ids: inheritsParticipants ? undefined : participantIds,
      });
      onOpenChange(false);
    } catch (requestError) {
      setError(
        (requestError as { message?: string })?.message ||
          "The chapter could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <form onSubmit={(event) => void submit(event)}>
          <DialogHeader className="border-b border-border px-5 pt-5 pb-4 pr-14">
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" aria-hidden="true" />
              {mode === "create" ? "Add chapter" : "Edit chapter"}
            </DialogTitle>
            <DialogDescription>
              Chapters organize one Event without changing its original start
              time.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-4 px-5 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="chapter-title">Title</Label>
              <Input
                id="chapter-title"
                value={title}
                maxLength={120}
                aria-invalid={Boolean(error && !title.trim())}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="chapter-start">Starts (optional)</Label>
                <Input
                  id="chapter-start"
                  type="datetime-local"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="chapter-end">Ends (optional)</Label>
                <Input
                  id="chapter-end"
                  type="datetime-local"
                  value={end}
                  min={start || undefined}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="chapter-location">Location (optional)</Label>
              <Input
                id="chapter-location"
                value={location}
                placeholder="Inherits the Event location when blank"
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="chapter-note">Chapter note (optional)</Label>
              <textarea
                id="chapter-note"
                value={note}
                rows={5}
                className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
            <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-muted/20 p-3">
              <div>
                <Label htmlFor="chapter-inherit-participants">
                  Use Event participants
                </Label>
                <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                  Turn this off to choose an explicit subset of this
                  Event&apos;s participants.
                </p>
              </div>
              <Switch
                id="chapter-inherit-participants"
                checked={inheritsParticipants}
                onCheckedChange={(checked) => {
                  setInheritsParticipants(checked);
                  if (!checked && participantIds.length === 0) {
                    setParticipantIds(
                      eventParticipants.map((contact) => String(contact.id)),
                    );
                  }
                }}
              />
            </div>
            {!inheritsParticipants && (
              <fieldset className="grid gap-2 rounded-md border border-border p-3">
                <legend className="px-1 text-sm font-medium">
                  Chapter participants
                </legend>
                {eventParticipants.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    This Event has no participants to select.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {eventParticipants.map((contact) => {
                      const id = String(contact.id);
                      const selected = participantIds.includes(id);
                      return (
                        <label
                          key={id}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            className="size-4 rounded border-input accent-primary"
                            onChange={(event) =>
                              setParticipantIds((current) =>
                                event.target.checked
                                  ? [...current, id]
                                  : current.filter(
                                      (candidate) => candidate !== id,
                                    ),
                              )
                            }
                          />
                          <EventParticipantAvatar contact={contact} size="sm" />
                          <span className="min-w-0 truncate font-medium">
                            {contactName(contact)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </DialogBody>
          <DialogFooter className="border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving…"
                : mode === "create"
                  ? "Add chapter"
                  : "Save chapter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function toDateTimeInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
