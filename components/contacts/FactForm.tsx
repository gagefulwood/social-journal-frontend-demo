"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { flattenFactCategories } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { Fact, CreateFactRequest } from "@/types/contacts";

const factSchema = z.object({
  category: z.string().optional(),
  label: z.string().max(120).optional(),
  detail_value: z.string().min(1, "Fact detail is required"),
});

type FactFormValues = z.infer<typeof factSchema>;

type FactFormProps = {
  fact?: Fact | null;
  onSubmit: (data: CreateFactRequest) => Promise<void>;
  onCancel?: () => void;
};

export function FactForm({ fact, onSubmit, onCancel }: FactFormProps) {
  const { factCategories } = useLookups();
  const categories = flattenFactCategories(factCategories);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FactFormValues>({
    resolver: zodResolver(factSchema),
    defaultValues: {
      category: fact?.category == null ? "" : String(fact.category),
      label: fact?.label ?? "",
      detail_value: fact?.detail_value ?? "",
    },
  });

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          category: values.category || null,
          label: values.label?.trim() || null,
          detail_value: values.detail_value,
        });
      })}
    >
      <div>
        <Label htmlFor="fact-category">Category</Label>
        <select
          id="fact-category"
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          {...register("category")}
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="fact-label">Label</Label>
        <Input id="fact-label" placeholder="Coffee" {...register("label")} />
        {errors.label?.message && (
          <p className="mt-1 text-sm text-destructive">{errors.label.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="fact-detail">Value</Label>
        <Input id="fact-detail" placeholder="Oat milk" {...register("detail_value")} />
        {errors.detail_value?.message && (
          <p className="mt-1 text-sm text-destructive">
            {errors.detail_value.message}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {fact ? "Save Fact" : "Add Fact"}
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
