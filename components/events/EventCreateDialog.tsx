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
import { eventsApi } from "@/lib/api/eventsApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EventCreateDialog({ open, onOpenChange, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [eventTimestamp, setEventTimestamp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !eventTimestamp) return;

    try {
      setLoading(true);
      setError(null);

      await eventsApi.create({
        title,
        event_timestamp: new Date(eventTimestamp).toISOString(),
      });

      onSuccess();
      setTitle("");
      setEventTimestamp("");
    } catch {
      setError("Failed to create event. Please try again.");
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
            value={eventTimestamp}
            onChange={(e) => setEventTimestamp(e.target.value)}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={loading || !title || !eventTimestamp}>
            {loading ? "Saving..." : "Save Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}