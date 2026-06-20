"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { ApiError } from "@/types/auth";
import { useEffect, useState } from "react";
import { eventsApi } from "@/lib/api/eventsApi";
import type { EventListItem } from "@/types/events";
import type {
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/journals";
import type { SubmitHandler } from "react-hook-form";

const exerciseSchema = z.object({
  event: z.string().min(1, "Event is required"),
  exercise_type: z.string().min(1, "Exercise type is required"),
  steps: z.string().min(1, "Steps are required"),
  pre_measurement: z.number().min(0).max(10),
  post_measurement: z.number().min(0).max(10),
});

export type ExerciseFormValues = z.output<typeof exerciseSchema>;

export type ExerciseFormProps = {
  exercise?: Exercise | null;
  onSubmit: (
    data: CreateExerciseRequest | UpdateExerciseRequest,
  ) => Promise<void>;
  submitLabel: string;
};

const exerciseFieldNames: Array<keyof ExerciseFormValues> = [
  "event",
  "exercise_type",
  "steps",
  "pre_measurement",
  "post_measurement",
];

function emptyToUndefined(value?: string) {
  return value?.trim() ? value : undefined;
}

function emptyToNull(value?: string | number | null) {
  return value === "" || value === undefined ? null : value;
}

export function ExerciseForm({
  exercise,
  onSubmit,
  submitLabel,
}: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      event: exercise?.event ? String(exercise.event) : "",
      exercise_type: exercise?.subtype ?? "",
      steps: exercise?.steps?.[0]?.response ?? "",
      pre_measurement: exercise?.pre_measurement ?? 5,
      post_measurement: exercise?.post_measurement ?? 5,
    },
  });

  const [events, setEvents] = useState<EventListItem[]>([]);

  useEffect(() => {
    async function load() {
      const res = await eventsApi.list();
      setEvents(res.results);
    }

    load();
  }, []);
  const preValue = watch("pre_measurement");
  const postValue = watch("post_measurement");

  const difference = (postValue ?? 0) - (preValue ?? 0);

  const submit: SubmitHandler<ExerciseFormValues> = async (values) => {
    const payload: CreateExerciseRequest = {
      event: values.event,
      subtype: values.exercise_type,
      pre_measurement: values.pre_measurement,
      post_measurement: values.post_measurement,
      steps: [
        {
          display_order: Number(values.steps),
          prompt: values.steps,
          response: values.steps,
        },
      ],
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.fieldErrors) {
        for (const fieldName of exerciseFieldNames) {
          const fieldError = apiError.fieldErrors[fieldName]?.[0];
          if (fieldError) {
            setError(fieldName, { message: fieldError });
          }
        }
      }

      if (!apiError.fieldErrors) {
        setError("root", {
          message: apiError.message || "Unable to save exercise.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {errors.root?.message && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </p>
      )}

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Exercise Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Exercise Type" error={errors.exercise_type?.message}>
            <select
              className="w-full rounded-md border p-2"
              {...register("exercise_type")}
            >
              <option value="">Select exercise type</option>
              <option value="cbt">CBT</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="grounding">Grounding</option>
              <option value="meditation">Meditation</option>
            </select>
          </Field>
          <Field label="Event" error={errors.event?.message}>
            <select
              {...register("event")}
              className="w-full rounded-md border p-2"
              defaultValue=""
            >
              <option value="">No event</option>

              {events.map((event) => (
                <option key={event.id} value={String(event.id)}>
                  {event.title}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* This section is for the distress sliders and difference indicator */}

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-3 items-center gap-8">
          {/* Distress before slider for recording successfulness of the exercise*/}
          <div>
            <Label className="text-lg font-semibold">Distress Before</Label>

            <div className="mt-6">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[preValue ?? 0]}
                onValueChange={(value) => setValue("pre_measurement", value[0])}
              />
            </div>

            <div className="mt-2 flex justify-between text-muted-foreground text-sm">
              <span>0</span>
              <span>10</span>
            </div>

            <div className="mt-4 text-center text-5xl font-bold">
              {preValue}
            </div>
          </div>

          {/* Difference indicator*/}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl">▲</div>

            <div
              className={`mt-2 text-5xl font-bold ${
                difference <= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {difference}
            </div>
          </div>

          {/* Distress after slider for recording successfulness of the exercise*/}
          <div>
            <Label className="text-lg font-semibold">Distress after</Label>

            <div className="mt-6">
              <Slider
                min={0}
                max={10}
                step={1}
                value={[postValue ?? 0]}
                onValueChange={(value) =>
                  setValue("post_measurement", value[0])
                }
              />
            </div>

            <div className="mt-2 flex justify-between text-muted-foreground text-sm">
              <span>0</span>
              <span>10</span>
            </div>

            <div className="mt-4 text-center text-5xl font-bold">
              {postValue}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Content</h2>
        <div className="mt-4 space-y-4">
          <Field label="Steps" error={errors.steps?.message}>
            <textarea
              {...register("steps")}
              placeholder="Write your exercise steps here..."
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
