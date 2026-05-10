"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLookups } from "@/hooks/useLookups";
import type { ApiError } from "@/types/auth";
import type {
  Exercise,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/journals";
import type { Event } from "@/types/events";

const events = [
  { id: 1, title: "Storm at Sea" },
  { id: 2, title: "Haunting" },
];

const exerciseSchema = z.object({
  event: z.string().min(1, "Event is required"),
  exercise_type: z.string().min(1, "Exercise type is required"),
  steps: z.string().min(1, "Steps are required"),
  pre_measurement: z.string().optional(),
  post_measurement: z.string().optional(),
});

export type ExerciseFormValues = z.infer<typeof exerciseSchema>;

export type ExerciseFormProps = {
    exercise?: Exercise | null;
    onSubmit: (
        data: CreateExerciseRequest | UpdateExerciseRequest
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

export function ExerciseForm({ exercise, onSubmit, submitLabel }: ExerciseFormProps) {
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ExerciseFormValues>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            event: exercise?.event ? String(exercise.event) : "",
            exercise_type: exercise?.subtype ?? "",
            steps: exercise?.steps ? String(exercise.steps) : "",
            pre_measurement: exercise?.pre_measurement ? String(exercise.pre_measurement) : "",
            post_measurement: exercise?.post_measurement ? String(exercise.post_measurement) : "",
        },
    });

    async function submit(values: ExerciseFormValues) {
        const payload: CreateExerciseRequest = {
            event: values.event,
            subtype: values.exercise_type,
            pre_measurement: Number(values.pre_measurement),
            post_measurement: Number(values.post_measurement),
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
    }

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