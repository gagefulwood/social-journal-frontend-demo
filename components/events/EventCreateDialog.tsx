"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { eventsApi } from "@/lib/api/eventsApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EventCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !scheduledAt) return;

    try {
      setLoading(true);

      await eventsApi.create({
        title,
        scheduled_at: scheduledAt,
        notes,
      });

      onSuccess();
      setTitle("");
      setScheduledAt("");
      setNotes("");
    } catch {
      console.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="datetime-local"
            className="border rounded px-3 py-2 w-full"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <Textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}