"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfilePictureSelector } from "@/components/contacts/ProfilePictureSelector";
import { toDateInputValue } from "@/components/contacts/contact-utils";
import { useLookups } from "@/hooks/useLookups";
import type { ApiError } from "@/types/auth";
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from "@/types/contacts";

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  birthday: z.string().optional(),
  first_met_date: z.string().optional(),
  relation: z.string().optional(),
  occupation: z.string().optional(),
  custom_occupation: z.string().optional(),
  company: z.string().optional(),
  education_level: z.string().optional(),
  custom_education_level: z.string().optional(),
  school: z.string().optional(),
  profile_picture_id: z.union([z.string(), z.number()]).nullable().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type ContactFormProps = {
  contact?: Contact | null;
  onSubmit: (
    data: CreateContactRequest | UpdateContactRequest
  ) => Promise<void>;
  submitLabel: string;
};

const fieldNames: Array<keyof ContactFormValues> = [
  "first_name",
  "middle_name",
  "last_name",
  "email",
  "phone_number",
  "address",
  "birthday",
  "first_met_date",
  "relation",
  "occupation",
  "custom_occupation",
  "company",
  "education_level",
  "custom_education_level",
  "school",
  "profile_picture_id",
];

function emptyToUndefined(value?: string) {
  return value?.trim() ? value : undefined;
}

function emptyToNull(value?: string | number | null) {
  return value === "" || value === undefined ? null : value;
}

export function ContactForm({ contact, onSubmit, submitLabel }: ContactFormProps) {
  const { occupations, relations, educationLevels, isLoading } = useLookups();
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: contact?.first_name ?? "",
      middle_name: contact?.middle_name ?? "",
      last_name: contact?.last_name ?? "",
      email: contact?.email ?? "",
      phone_number: contact?.phone_number ?? "",
      address: contact?.address ?? "",
      birthday: toDateInputValue(contact?.birthday),
      first_met_date: toDateInputValue(contact?.first_met_date),
      relation: contact?.relation == null ? "" : String(contact.relation),
      occupation: contact?.occupation == null ? "" : String(contact.occupation),
      custom_occupation: contact?.custom_occupation ?? "",
      company: contact?.company ?? "",
      education_level:
        contact?.education_level == null ? "" : String(contact.education_level),
      custom_education_level: contact?.custom_education_level ?? "",
      school: contact?.school ?? "",
      profile_picture_id: contact?.profile_picture?.id ?? null,
    },
  });

  async function submit(values: ContactFormValues) {
    const payload: CreateContactRequest = {
      first_name: values.first_name,
      middle_name: emptyToUndefined(values.middle_name),
      last_name: values.last_name,
      email: emptyToUndefined(values.email),
      phone_number: emptyToUndefined(values.phone_number),
      address: emptyToUndefined(values.address),
      birthday: emptyToNull(values.birthday) as string | null,
      first_met_date: emptyToNull(values.first_met_date) as string | null,
      relation: emptyToNull(values.relation),
      occupation: emptyToNull(values.occupation),
      custom_occupation: emptyToUndefined(values.custom_occupation),
      company: emptyToUndefined(values.company),
      education_level: emptyToNull(values.education_level),
      custom_education_level: emptyToUndefined(values.custom_education_level),
      school: emptyToUndefined(values.school),
      profile_picture_id: emptyToNull(values.profile_picture_id),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.fieldErrors) {
        for (const fieldName of fieldNames) {
          const fieldError = apiError.fieldErrors[fieldName]?.[0];
          if (fieldError) {
            setError(fieldName, { message: fieldError });
          }
        }
      }

      if (!apiError.fieldErrors) {
        setError("root", {
          message: apiError.message || "Unable to save contact.",
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
        <h2 className="text-lg font-semibold">Identity</h2>
        <div className="mt-4">
          <Label>Profile Picture</Label>
          <div className="mt-2">
            <ProfilePictureSelector
              current={contact?.profile_picture}
              onChange={(mediaId) => setValue("profile_picture_id", mediaId)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="First Name" error={errors.first_name?.message}>
            <Input {...register("first_name")} />
          </Field>
          <Field label="Middle Name" error={errors.middle_name?.message}>
            <Input {...register("middle_name")} />
          </Field>
          <Field label="Last Name" error={errors.last_name?.message}>
            <Input {...register("last_name")} />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register("email")} />
          </Field>
          <Field label="Phone" error={errors.phone_number?.message}>
            <Input {...register("phone_number")} />
          </Field>
          <Field label="Address" error={errors.address?.message}>
            <Input {...register("address")} />
          </Field>
          <Field label="Birthday" error={errors.birthday?.message}>
            <Input type="date" {...register("birthday")} />
          </Field>
          <Field label="First Met" error={errors.first_met_date?.message}>
            <Input type="date" {...register("first_met_date")} />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Work and Education</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Relation" error={errors.relation?.message}>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={isLoading}
              {...register("relation")}
            >
              <option value="">No relation</option>
              {relations.map((relation) => (
                <option key={relation.id} value={String(relation.id)}>
                  {relation.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Occupation" error={errors.occupation?.message}>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={isLoading}
              {...register("occupation")}
            >
              <option value="">No occupation</option>
              {occupations.map((occupation) => (
                <option key={occupation.id} value={String(occupation.id)}>
                  {occupation.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Custom Occupation"
            error={errors.custom_occupation?.message}
          >
            <Input {...register("custom_occupation")} />
          </Field>
          <Field label="Company" error={errors.company?.message}>
            <Input {...register("company")} />
          </Field>
          <Field label="Education Level" error={errors.education_level?.message}>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              disabled={isLoading}
              {...register("education_level")}
            >
              <option value="">No education level</option>
              {educationLevels.map((level) => (
                <option key={level.id} value={String(level.id)}>
                  {level.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Custom Education"
            error={errors.custom_education_level?.message}
          >
            <Input {...register("custom_education_level")} />
          </Field>
          <Field label="School" error={errors.school?.message}>
            <Input {...register("school")} />
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
