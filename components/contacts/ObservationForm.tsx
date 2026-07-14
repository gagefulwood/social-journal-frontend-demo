"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLookups } from "@/hooks/useLookups";
import type {
  CreateObservationRequest,
  Observation,
} from "@/types/contacts";

const observationSchema = z.object({
  marker: z.string().optional(),
  body: z.string().min(1, "Observation is required"),
  status: z.enum(["current", "revisit_later", "archived"]),
});

type ObservationFormValues = z.infer<typeof observationSchema>;

type ObservationFormProps = {
  observation?: Observation | null;
  onSubmit: (data: CreateObservationRequest) => Promise<void>;
  onCancel?: () => void;
};

export function ObservationForm({
  observation,
  onSubmit,
  onCancel,
}: ObservationFormProps) {
  const { observationMarkers } = useLookups();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ObservationFormValues>({
    resolver: zodResolver(observationSchema),
    defaultValues: {
      marker: observation?.marker == null ? "" : String(observation.marker),
      body: observation?.body ?? "",
      status: observation?.status ?? "current",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          marker: values.marker || null,
          body: values.body,
          status: values.status,
        });
      })}
    >
      <div>
        <Label htmlFor="observation-marker">Marker</Label>
        <select
          id="observation-marker"
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...register("marker")}
        >
          <option value="">No marker</option>
          {observationMarkers.map((marker) => (
            <option key={marker.id} value={String(marker.id)}>
              {marker.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="observation-body">Observation</Label>
        <textarea
          id="observation-body"
          rows={4}
          autoFocus={!observation}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register("body")}
        />
        {errors.body?.message && (
          <p className="mt-1 text-sm text-destructive">
            {errors.body.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="observation-status">Status</Label>
        <select
          id="observation-status"
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...register("status")}
        >
          <option value="current">Current</option>
          <option value="revisit_later">Revisit later</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {observation ? "Save Observation" : "Add Observation"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
