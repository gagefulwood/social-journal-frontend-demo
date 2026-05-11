"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLookups } from "@/hooks/useLookups";
import type { ApiError } from "@/types/auth";
import { useEffect, useState } from "react";
import { eventsApi } from "@/lib/api/eventsApi";
import type { EventListItem } from "@/types/events";
import type {
  Log,
  CreateLogRequest,
  UpdateLogRequest,
} from "@/types/journals";


const logSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  mood: z.string().optional(),
  event: z.string().min(1, "Event is required"),
  entry_tags: z.array(z.string()).optional(),
  episode_type: z.string().optional(),
});

export type LogFormValues = z.infer<typeof logSchema>;

export type LogFormProps = {
    log?: Log | null;
    onSubmit: (
        data: CreateLogRequest | UpdateLogRequest
    ) => Promise<void>;
    submitLabel: string;
};

const logFieldNames: Array<keyof LogFormValues> = [
  "title",
  "body",
  "mood",
  "event",
  "entry_tags",
  "episode_type",
];

function emptyToUndefined(value?: string) {
  return value?.trim() ? value : undefined;
}

function emptyToNull(value?: string | number | null) {
  return value === "" || value === undefined ? null : value;
}

export function LogForm({ log, onSubmit, submitLabel }: LogFormProps) {
    const [events, setEvents] = useState<EventListItem[]>([]);

    useEffect(() => {
      async function load() {
      const res = await eventsApi.list();
      setEvents(res.results);
      }

      load();
    }, []);
    const { moods, entryTags } = useLookups();
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LogFormValues>({
        resolver: zodResolver(logSchema),
        defaultValues: {
            title: log?.title ?? "",
            body: log?.body ?? "",
            mood: log?.mood?.id ? String(log.mood.id) : "",
            event: log?.event ? String(log.event) : "",
            entry_tags: log?.tags?.map(tag => String(tag.id)) ?? [],
            episode_type: log?.subtype ?? "",
        },
    });

    async function submit(values: LogFormValues) {
        const payload: CreateLogRequest = {
            title: values.title,
            body: values.body,
            mood_id: emptyToNull(values.mood),
            tag_ids: values.entry_tags?.length ? values.entry_tags.map(id => Number(id)) : undefined,
            subtype: emptyToUndefined(values.episode_type),
            event: values.event,
        };

        try {
            await onSubmit(payload);
        } catch (err) {
            const apiError = err as ApiError;

            if (apiError.fieldErrors) {
                for (const fieldName of logFieldNames) {
                const fieldError = apiError.fieldErrors[fieldName]?.[0];
                if (fieldError) {
                    setError(fieldName, { message: fieldError });
                }
                }
            }

            if (!apiError.fieldErrors) {
                setError("root", {
                    message: apiError.message || "Unable to save log.",
                });
            }
        }
    }

    return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {errors.root?.message && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Episode Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Title" error={errors.title?.message}>
            <Input {...register("title")} placeholder="Log title" />
          </Field>
          <Field label="Event ID" error={errors.event?.message}>
            <select
                {...register("event")}
                className="w-full rounded-md border p-2"
                defaultValue=""
                >
                <option value="">No event</option>

                {events?.map((event) => (
                    <option key={event.id} value={event.id}>
                    {event.title}
                    </option>
                ))}
            </select>
          </Field>
          <Field label="Episode Type" error={errors.episode_type?.message}>
            <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("episode_type")}
                >
                <option value="">No Type</option>
                <option value="depressive">Depressive</option>
                <option value="manic">Manic</option>
                <option value="panic attack">Panic Attack</option>
                <option value="mixed">Mixed</option>
                <option value="flashback">Flashback</option>
                <option value="other">Other</option>
              </select>
          </Field>
          <Field label="Mood" error={errors.mood?.message}>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("mood")}
            >
              <option value="">No mood</option>
              {moods.map((mood) => (
                <option key={mood.id} value={String(mood.id)}>
                  {mood.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Content</h2>
        <div className="mt-4 space-y-4">
          <Field label="Body" error={errors.body?.message}>
            <textarea
              {...register("body")}
              placeholder="Write your log entry here..."
              className="h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <Label asChild>
        <span>{label}</span>
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </label>
  );
}
