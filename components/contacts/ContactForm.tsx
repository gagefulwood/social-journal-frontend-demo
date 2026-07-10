"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Circle,
  Eye,
  Heart,
  Info,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { z } from "zod";
import { ProfilePictureSelector } from "@/components/contacts/ProfilePictureSelector";
import { toDateInputValue } from "@/components/contacts/contact-utils";
import { Button } from "@/components/ui/button";
import { IconBadge } from "@/components/ui/icon-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLookups } from "@/hooks/useLookups";
import type { ApiError } from "@/types/auth";
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from "@/types/contacts";
import type { MediaAssetListItem } from "@/types/media";

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
type ContactFormVariant = "default" | "create";
type DetailStatus = "Not set" | "Partial" | "Complete";

type ContactFormProps = {
  contact?: Contact | null;
  onSubmit: (
    data: CreateContactRequest | UpdateContactRequest,
  ) => Promise<void>;
  submitLabel: string;
  variant?: ContactFormVariant;
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

const selectClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

function emptyToUndefined(value?: string) {
  return value?.trim() ? value : undefined;
}

function emptyToNull(value?: string | number | null) {
  return value === "" || value === undefined ? null : value;
}

export function ContactForm({
  contact,
  onSubmit,
  submitLabel,
  variant = "default",
}: ContactFormProps) {
  const { occupations, relations, educationLevels, isLoading } = useLookups();
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<MediaAssetListItem | null>(contact?.profile_picture ?? null);
  const {
    control,
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
  const values = useWatch({ control });

  async function submit(nextValues: ContactFormValues) {
    const payload: CreateContactRequest = {
      first_name: nextValues.first_name,
      middle_name: emptyToUndefined(nextValues.middle_name),
      last_name: nextValues.last_name,
      email: emptyToUndefined(nextValues.email),
      phone_number: emptyToUndefined(nextValues.phone_number),
      address: emptyToUndefined(nextValues.address),
      birthday: emptyToNull(nextValues.birthday) as string | null,
      first_met_date: emptyToNull(nextValues.first_met_date) as string | null,
      relation: emptyToNull(nextValues.relation),
      occupation: emptyToNull(nextValues.occupation),
      custom_occupation: emptyToUndefined(nextValues.custom_occupation),
      company: emptyToUndefined(nextValues.company),
      education_level: emptyToNull(nextValues.education_level),
      custom_education_level: emptyToUndefined(nextValues.custom_education_level),
      school: emptyToUndefined(nextValues.school),
      profile_picture_id: emptyToNull(nextValues.profile_picture_id),
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

  const isCreateExperience = variant === "create";
  const firstName = values?.first_name ?? "";
  const middleName = values?.middle_name ?? "";
  const lastName = values?.last_name ?? "";
  const displayName = [firstName, middleName, lastName]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");
  const initials = getInitials(firstName, lastName);
  const relationName =
    relations.find((relation) => String(relation.id) === values?.relation)
      ?.name ??
    (values?.relation && String(contact?.relation) === values.relation
      ? contact?.relation_name
      : null) ??
    "No relation";
  const statuses = {
    identity: getDetailStatus(
      [firstName, lastName, values?.relation ?? ""],
      hasValue(firstName) && hasValue(lastName),
    ),
    contact: getDetailStatus(
      [values?.email ?? "", values?.phone_number ?? "", values?.address ?? ""],
      hasValue(values?.email) &&
        hasValue(values?.phone_number) &&
        hasValue(values?.address),
    ),
    dates: getDetailStatus(
      [values?.birthday ?? "", values?.first_met_date ?? ""],
      hasValue(values?.birthday) && hasValue(values?.first_met_date),
    ),
    background: getDetailStatus(
      [
        values?.occupation ?? "",
        values?.custom_occupation ?? "",
        values?.company ?? "",
        values?.education_level ?? "",
        values?.custom_education_level ?? "",
        values?.school ?? "",
      ],
      (hasValue(values?.occupation) || hasValue(values?.custom_occupation)) &&
        hasValue(values?.company) &&
        (hasValue(values?.education_level) ||
          hasValue(values?.custom_education_level)) &&
        hasValue(values?.school),
    ),
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className={isCreateExperience ? "space-y-4 pb-24" : "space-y-6"}
    >
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      {isCreateExperience ? (
        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-start">
          <div className="min-w-0 space-y-4">
            <CreateSection
              title="Who they are"
              description=""
              icon={<UserRound className="size-5" />}
            >
              <div className="mt-4 grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)] lg:items-center">
                <div className="flex flex-col items-center text-center">
                  <ProfilePictureSelector
                    current={contact?.profile_picture}
                    error={errors.profile_picture_id?.message}
                    fallbackInitials={initials}
                    variant="create"
                    onChange={(mediaId, asset) => {
                      setValue("profile_picture_id", mediaId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setSelectedProfilePicture(asset ?? null);
                    }}
                  />
                  <p className="mt-2 max-w-32 text-xs leading-5 text-muted-foreground">
                    A friendly photo helps you remember.
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <FormField
                      id="first_name"
                      label="First Name"
                      required
                      error={errors.first_name?.message}
                    >
                      <Input
                        id="first_name"
                        placeholder="Enter first name"
                        required
                        aria-describedby={errorId("first_name", errors.first_name?.message)}
                        aria-invalid={Boolean(errors.first_name)}
                        {...register("first_name")}
                      />
                    </FormField>
                    <FormField
                      id="middle_name"
                      label="Middle Name"
                      error={errors.middle_name?.message}
                    >
                      <Input
                        id="middle_name"
                        placeholder="Enter middle name"
                        aria-describedby={errorId("middle_name", errors.middle_name?.message)}
                        aria-invalid={Boolean(errors.middle_name)}
                        {...register("middle_name")}
                      />
                    </FormField>
                    <FormField
                      id="last_name"
                      label="Last Name"
                      required
                      error={errors.last_name?.message}
                    >
                      <Input
                        id="last_name"
                        placeholder="Enter last name"
                        required
                        aria-describedby={errorId("last_name", errors.last_name?.message)}
                        aria-invalid={Boolean(errors.last_name)}
                        {...register("last_name")}
                      />
                    </FormField>
                    <FormField
                      id="relation"
                      label="Relation"
                      error={errors.relation?.message}
                    >
                      <select
                        id="relation"
                        className={selectClassName}
                        disabled={isLoading}
                        aria-describedby={errorId("relation", errors.relation?.message)}
                        aria-invalid={Boolean(errors.relation)}
                        {...register("relation")}
                      >
                        <option value="">
                          {isLoading ? "Loading relations..." : "No relation"}
                        </option>
                        {relations.map((relation) => (
                          <option key={relation.id} value={String(relation.id)}>
                            {relation.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <HelperNotice
                    tone="accent"
                    icon={<Heart className="size-4" aria-hidden="true" />}
                    className="mt-4"
                  >
                    Names matter. Getting them right helps you honor the person and your relationship.
                  </HelperNotice>
                </div>
              </div>
            </CreateSection>

            <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
              <CreateSection
                title="Contact details"
                description="How to reach them."
                icon={<Mail className="size-5" />}
                className="h-full"
              >
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <FormField id="email" label="Email" error={errors.email?.message}>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      aria-describedby={errorId("email", errors.email?.message)}
                      aria-invalid={Boolean(errors.email)}
                      {...register("email")}
                    />
                  </FormField>
                  <FormField
                    id="phone_number"
                    label="Phone"
                    error={errors.phone_number?.message}
                  >
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="(555) 123-4567"
                      aria-describedby={errorId("phone_number", errors.phone_number?.message)}
                      aria-invalid={Boolean(errors.phone_number)}
                      {...register("phone_number")}
                    />
                  </FormField>
                  <FormField
                    id="address"
                    label="Address"
                    error={errors.address?.message}
                    className="sm:col-span-2"
                  >
                    <Input
                      id="address"
                      placeholder=""
                      aria-describedby={errorId("address", errors.address?.message)}
                      aria-invalid={Boolean(errors.address)}
                      {...register("address")}
                    />
                  </FormField>
                </div>
                <HelperNotice
                  tone="info"
                  icon={<Info className="size-4" aria-hidden="true" />}
                  className="mt-4"
                >
                  Add the best ways to reach them so you can stay in touch.
                </HelperNotice>
              </CreateSection>

              <CreateSection
                title="Important dates"
                description="Dates that help tell their story."
                icon={<CalendarDays className="size-5" />}
                className="h-full"
              >
                <div className="mt-4 grid gap-3">
                  <FormField
                    id="birthday"
                    label="Birthday"
                    error={errors.birthday?.message}
                  >
                    <Input
                      id="birthday"
                      type="date"
                      aria-describedby={errorId("birthday", errors.birthday?.message)}
                      aria-invalid={Boolean(errors.birthday)}
                      {...register("birthday")}
                    />
                  </FormField>
                  <FormField
                    id="first_met_date"
                    label="First Met"
                    error={errors.first_met_date?.message}
                  >
                    <Input
                      id="first_met_date"
                      type="date"
                      aria-describedby={errorId("first_met_date", errors.first_met_date?.message)}
                      aria-invalid={Boolean(errors.first_met_date)}
                      {...register("first_met_date")}
                    />
                  </FormField>
                </div>
                <HelperNotice
                  tone="warning"
                  icon={<Sparkles className="size-4" aria-hidden="true" />}
                  className="mt-4"
                >
                  These milestones help you celebrate what matters.
                </HelperNotice>
              </CreateSection>
            </div>

            <CreateSection
              title="Background / Work & education"
              description="A few details about their work and education."
              icon={<BriefcaseBusiness className="size-5" />}
            >
              <div className="mt-4 grid gap-x-4 gap-y-3 md:grid-cols-2">
                <FormField
                  id="occupation"
                  label="Occupation"
                  error={errors.occupation?.message}
                >
                  <select
                    id="occupation"
                    className={selectClassName}
                    disabled={isLoading}
                    aria-describedby={errorId("occupation", errors.occupation?.message)}
                    aria-invalid={Boolean(errors.occupation)}
                    {...register("occupation")}
                  >
                    <option value="">
                      {isLoading ? "Loading occupations..." : "No occupation"}
                    </option>
                    {occupations.map((occupation) => (
                      <option key={occupation.id} value={String(occupation.id)}>
                        {occupation.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  id="custom_occupation"
                  label="Custom Occupation"
                  error={errors.custom_occupation?.message}
                >
                  <Input
                    id="custom_occupation"
                    placeholder="Enter custom occupation"
                    aria-describedby={errorId(
                      "custom_occupation",
                      errors.custom_occupation?.message,
                    )}
                    aria-invalid={Boolean(errors.custom_occupation)}
                    {...register("custom_occupation")}
                  />
                </FormField>
                <FormField id="company" label="Company" error={errors.company?.message}>
                  <Input
                    id="company"
                    placeholder="Enter company"
                    aria-describedby={errorId("company", errors.company?.message)}
                    aria-invalid={Boolean(errors.company)}
                    {...register("company")}
                  />
                </FormField>
                <FormField
                  id="education_level"
                  label="Education Level"
                  error={errors.education_level?.message}
                >
                  <select
                    id="education_level"
                    className={selectClassName}
                    disabled={isLoading}
                    aria-describedby={errorId(
                      "education_level",
                      errors.education_level?.message,
                    )}
                    aria-invalid={Boolean(errors.education_level)}
                    {...register("education_level")}
                  >
                    <option value="">
                      {isLoading ? "Loading education levels..." : "No education level"}
                    </option>
                    {educationLevels.map((level) => (
                      <option key={level.id} value={String(level.id)}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  id="custom_education_level"
                  label="Custom Education"
                  error={errors.custom_education_level?.message}
                >
                  <Input
                    id="custom_education_level"
                    placeholder="Enter custom education"
                    aria-describedby={errorId(
                      "custom_education_level",
                      errors.custom_education_level?.message,
                    )}
                    aria-invalid={Boolean(errors.custom_education_level)}
                    {...register("custom_education_level")}
                  />
                </FormField>
                <FormField id="school" label="School" error={errors.school?.message}>
                  <Input
                    id="school"
                    placeholder="Enter school"
                    aria-describedby={errorId("school", errors.school?.message)}
                    aria-invalid={Boolean(errors.school)}
                    {...register("school")}
                  />
                </FormField>
              </div>
              <HelperNotice
                tone="success"
                icon={<BriefcaseBusiness className="size-4" aria-hidden="true" />}
                className="mt-4"
              >
                This context helps you understand their world and find common ground.
              </HelperNotice>
            </CreateSection>
          </div>

          <aside className="grid min-w-0 gap-4 xl:sticky xl:top-4">
            <LiveProfilePreview
              displayName={displayName}
              initials={initials}
              profilePicture={selectedProfilePicture}
              relationName={relationName}
              hasContactDetails={
                hasValue(values?.email) ||
                hasValue(values?.phone_number) ||
                hasValue(values?.address)
              }
            />
            <DetailsAdded statuses={statuses} />
          </aside>
        </div>
      ) : (
        <DefaultContactFormFields
          contact={contact}
          errors={errors}
          isLoading={isLoading}
          occupations={occupations}
          relations={relations}
          educationLevels={educationLevels}
          register={register}
          setValue={setValue}
        />
      )}

      {isCreateExperience ? (
        <footer className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-lg border border-border bg-card/95 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Your entries are private and only visible to you.
          </p>
          <div className="flex shrink-0 justify-end gap-2">
            <Button asChild variant="outline">
              <Link href="/contacts">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-32">
              {isSubmitting ? "Creating..." : submitLabel}
            </Button>
          </div>
        </footer>
      ) : (
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}

function CreateSection({
  title,
  description,
  icon,
  className = "",
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-lg border border-border/80 bg-card p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <IconBadge tone="accent" size="md" className="rounded-md">
          {icon}
        </IconBadge>
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-5">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function HelperNotice({
  tone,
  icon,
  className = "",
  children,
}: {
  tone: "accent" | "info" | "warning" | "success";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const toneClassName = {
    accent: "bg-accent/70 text-accent-foreground",
    info: "bg-info-muted text-info",
    warning: "bg-warning-muted text-warning",
    success: "bg-success-muted text-success",
  }[tone];

  return (
    <p className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs leading-5 ${toneClassName} ${className}`}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <span>{children}</span>
    </p>
  );
}

function LiveProfilePreview({
  displayName,
  initials,
  profilePicture,
  relationName,
  hasContactDetails,
}: {
  displayName: string;
  initials: string;
  profilePicture: MediaAssetListItem | null;
  relationName: string;
  hasContactDetails: boolean;
}) {
  return (
    <section className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <IconBadge tone="accent" size="sm" className="rounded-md">
          <Eye className="size-4" />
        </IconBadge>
        <h2 className="text-sm font-semibold">Live profile preview</h2>
      </div>

      <div className="mt-5 text-center">
        <div className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full border border-primary-soft bg-accent text-accent-foreground">
          {profilePicture?.url ? (
            <div
              role="img"
              aria-label={profilePicture.alt_text || "Selected profile photo"}
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${profilePicture.url})` }}
            />
          ) : initials ? (
            <span className="text-2xl font-semibold">{initials}</span>
          ) : (
            <UserRound className="size-7" aria-hidden="true" />
          )}
        </div>
        <p
          className="mt-3 truncate text-lg font-semibold"
          title={displayName || "Name not added yet"}
          aria-label={displayName || "Name not added yet"}
        >
          {displayName || <span aria-hidden="true">---</span>}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{relationName}</p>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          {hasContactDetails
            ? "Contact details added"
            : "No contact details added yet"}
        </p>
      </div>

      <HelperNotice
        tone="accent"
        icon={<Heart className="size-4" aria-hidden="true" />}
        className="mt-4 text-left"
      >
        This preview reflects the details you add on the left.
      </HelperNotice>
    </section>
  );
}

function DetailsAdded({
  statuses,
}: {
  statuses: {
    identity: DetailStatus;
    contact: DetailStatus;
    dates: DetailStatus;
    background: DetailStatus;
  };
}) {
  return (
    <section className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
      <h2 className="text-sm font-semibold">Details added</h2>
      <div className="mt-3 divide-y divide-border">
        <DetailStatusRow
          icon={<UserRound className="size-4" />}
          label="Who they are"
          status={statuses.identity}
        />
        <DetailStatusRow
          icon={<UsersRound className="size-4" />}
          label="Contact details"
          status={statuses.contact}
        />
        <DetailStatusRow
          icon={<CalendarDays className="size-4" />}
          label="Important dates"
          status={statuses.dates}
        />
        <DetailStatusRow
          icon={<BriefcaseBusiness className="size-4" />}
          label="Background"
          status={statuses.background}
        />
      </div>
      <HelperNotice
        tone="warning"
        icon={<Sparkles className="size-4" aria-hidden="true" />}
        className="mt-4"
      >
        Add a few details to build a complete, meaningful profile.
      </HelperNotice>
    </section>
  );
}

function DetailStatusRow({
  icon,
  label,
  status,
}: {
  icon: ReactNode;
  label: string;
  status: DetailStatus;
}) {
  const tone =
    status === "Complete"
      ? "success"
      : status === "Partial"
        ? "info"
        : "neutral";
  const StatusIcon = status === "Complete" ? CheckCircle2 : Circle;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2">
        <IconBadge tone={tone} size="sm" className="rounded-md">
          {icon}
        </IconBadge>
        <span className="truncate text-sm">{label}</span>
      </div>
      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <StatusIcon className="size-3" aria-hidden="true" />
        {status}
      </span>
    </div>
  );
}

function DefaultContactFormFields({
  contact,
  errors,
  isLoading,
  occupations,
  relations,
  educationLevels,
  register,
  setValue,
}: {
  contact?: Contact | null;
  errors: ReturnType<typeof useForm<ContactFormValues>>["formState"]["errors"];
  isLoading: boolean;
  occupations: ReturnType<typeof useLookups>["occupations"];
  relations: ReturnType<typeof useLookups>["relations"];
  educationLevels: ReturnType<typeof useLookups>["educationLevels"];
  register: ReturnType<typeof useForm<ContactFormValues>>["register"];
  setValue: ReturnType<typeof useForm<ContactFormValues>>["setValue"];
}) {
  return (
    <>
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Identity</h2>
        <div className="mt-4">
          <Label>Profile Picture</Label>
          <div className="mt-2">
            <ProfilePictureSelector
              current={contact?.profile_picture}
              error={errors.profile_picture_id?.message}
              onChange={(mediaId) => setValue("profile_picture_id", mediaId)}
            />
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <FormField id="first_name" label="First Name" required error={errors.first_name?.message}>
            <Input id="first_name" required aria-invalid={Boolean(errors.first_name)} {...register("first_name")} />
          </FormField>
          <FormField id="middle_name" label="Middle Name" error={errors.middle_name?.message}>
            <Input id="middle_name" aria-invalid={Boolean(errors.middle_name)} {...register("middle_name")} />
          </FormField>
          <FormField id="last_name" label="Last Name" required error={errors.last_name?.message}>
            <Input id="last_name" required aria-invalid={Boolean(errors.last_name)} {...register("last_name")} />
          </FormField>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input id="email" type="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
          </FormField>
          <FormField id="phone_number" label="Phone" error={errors.phone_number?.message}>
            <Input id="phone_number" aria-invalid={Boolean(errors.phone_number)} {...register("phone_number")} />
          </FormField>
          <FormField id="address" label="Address" error={errors.address?.message}>
            <Input id="address" aria-invalid={Boolean(errors.address)} {...register("address")} />
          </FormField>
          <FormField id="birthday" label="Birthday" error={errors.birthday?.message}>
            <Input id="birthday" type="date" aria-invalid={Boolean(errors.birthday)} {...register("birthday")} />
          </FormField>
          <FormField id="first_met_date" label="First Met" error={errors.first_met_date?.message}>
            <Input id="first_met_date" type="date" aria-invalid={Boolean(errors.first_met_date)} {...register("first_met_date")} />
          </FormField>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Work and Education</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField id="relation" label="Relation" error={errors.relation?.message}>
            <select id="relation" className={selectClassName} disabled={isLoading} {...register("relation")}>
              <option value="">No relation</option>
              {relations.map((relation) => <option key={relation.id} value={String(relation.id)}>{relation.name}</option>)}
            </select>
          </FormField>
          <FormField id="occupation" label="Occupation" error={errors.occupation?.message}>
            <select id="occupation" className={selectClassName} disabled={isLoading} {...register("occupation")}>
              <option value="">No occupation</option>
              {occupations.map((occupation) => <option key={occupation.id} value={String(occupation.id)}>{occupation.name}</option>)}
            </select>
          </FormField>
          <FormField id="custom_occupation" label="Custom Occupation" error={errors.custom_occupation?.message}>
            <Input id="custom_occupation" {...register("custom_occupation")} />
          </FormField>
          <FormField id="company" label="Company" error={errors.company?.message}>
            <Input id="company" {...register("company")} />
          </FormField>
          <FormField id="education_level" label="Education Level" error={errors.education_level?.message}>
            <select id="education_level" className={selectClassName} disabled={isLoading} {...register("education_level")}>
              <option value="">No education level</option>
              {educationLevels.map((level) => <option key={level.id} value={String(level.id)}>{level.name}</option>)}
            </select>
          </FormField>
          <FormField id="custom_education_level" label="Custom Education" error={errors.custom_education_level?.message}>
            <Input id="custom_education_level" {...register("custom_education_level")} />
          </FormField>
          <FormField id="school" label="School" error={errors.school?.message}>
            <Input id="school" {...register("school")} />
          </FormField>
        </div>
      </section>
    </>
  );
}

function FormField({
  id,
  label,
  required = false,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <>
            <span className="text-destructive" aria-hidden="true">*</span>
            <span className="sr-only">required</span>
          </>
        )}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}

function hasValue(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

function getDetailStatus(values: unknown[], isComplete: boolean): DetailStatus {
  if (!values.some(hasValue)) {
    return "Not set";
  }

  return isComplete ? "Complete" : "Partial";
}

function errorId(id: string, error?: string) {
  return error ? `${id}-error` : undefined;
}
