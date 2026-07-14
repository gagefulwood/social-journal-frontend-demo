"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toDateInputValue } from "@/components/contacts/contact-utils";
import { AddressesFormSection } from "@/components/contacts/form/AddressesFormSection";
import {
  ContactFormLayout,
  ContactFormMain,
  ContactFormRail,
} from "@/components/contacts/form/ContactFormLayout";
import { ContactDraftProfilePreview } from "@/components/contacts/form/ContactDraftProfilePreview";
import { ContactFormProfileProgress } from "@/components/contacts/form/ContactFormProfileProgress";
import { ContactMethodsFormSection } from "@/components/contacts/form/ContactMethodsFormSection";
import { EducationFormSection } from "@/components/contacts/form/EducationFormSection";
import { EmploymentFormSection } from "@/components/contacts/form/EmploymentFormSection";
import { PersonFormSection } from "@/components/contacts/form/PersonFormSection";
import { ProfileEssentialsFormSection } from "@/components/contacts/form/ProfileEssentialsFormSection";
import { RelationshipContextFormSection } from "@/components/contacts/form/RelationshipContextFormSection";
import { WorkEducationFormSection } from "@/components/contacts/form/WorkEducationFormSection";
import { Button } from "@/components/ui/button";
import { useLookups } from "@/hooks/useLookups";
import {
  getContactFormCollapsedSummaries,
  getContactFormDraftPresentation,
  getContactFormProgress,
} from "@/lib/presentation/contactFormDraftPresentation";
import {
  contactProfileSchema,
  validateContactProfileCollections,
} from "@/lib/validation/contactProfile";
import type { ApiError } from "@/types/auth";
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from "@/types/contacts";
import type { MediaAssetListItem } from "@/types/media";

const contactSchema = z
  .object({
    ...contactProfileSchema.shape,
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
  })
  .superRefine(validateContactProfileCollections);

type ContactFormValues = z.infer<typeof contactSchema>;

function getInitialContactMethods(
  contact?: Contact | null,
): ContactFormValues["contact_methods"] {
  const methods: ContactFormValues["contact_methods"] = (
    contact?.contact_methods ?? []
  ).map((method) => ({ ...method }));

  function includeLegacyMethod(
    kind: "email" | "phone",
    value: string | null | undefined,
  ) {
    const normalizedValue = value?.trim();
    if (!normalizedValue) {
      return;
    }

    const matchingMethod = methods.find(
      (method) =>
        method.kind === kind && method.value.trim() === normalizedValue,
    );
    const hasPrimaryMethod = methods.some(
      (method) => method.kind === kind && method.is_primary,
    );

    if (matchingMethod) {
      if (!hasPrimaryMethod) {
        matchingMethod.is_primary = true;
      }
      return;
    }

    methods.push({
      kind,
      label: "",
      value: normalizedValue,
      is_primary: !hasPrimaryMethod,
    });
  }

  includeLegacyMethod("email", contact?.email);
  includeLegacyMethod("phone", contact?.phone_number);

  return methods;
}

function getLegacyContactMethodValue(
  methods: ContactFormValues["contact_methods"],
  kind: "email" | "phone",
) {
  return (
    methods
      .find((method) => method.kind === kind && method.is_primary)
      ?.value.trim() || undefined
  );
}

type ContactFormProps = {
  contact?: Contact | null;
  onSubmit: (
    data: CreateContactRequest | UpdateContactRequest,
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
  "preferred_name",
  "gender_identity",
  "pronouns",
  "birth_date",
  "timezone",
  "first_met_on",
  "met_through",
  "met_location",
  "relation",
  "occupation",
  "custom_occupation",
  "company",
  "education_level",
  "custom_education_level",
  "school",
  "profile_picture_id",
];

const validationFocusOrder: Array<keyof ContactFormValues> = [
  "first_name",
  "last_name",
  "middle_name",
  "relation",
  "preferred_name",
  "profile_picture_id",
  "gender_identity",
  "pronouns",
  "birth_date",
  "timezone",
  "contact_methods",
  "email",
  "phone_number",
  "addresses",
  "address",
  "first_met_on",
  "met_through",
  "met_location",
  "employment",
  "occupation",
  "custom_occupation",
  "company",
  "education",
  "education_level",
  "custom_education_level",
  "school",
];

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
}: ContactFormProps) {
  const { relations, educationLevels, isLoading } = useLookups();
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
      preferred_name: contact?.preferred_name ?? "",
      gender_identity: contact?.gender_identity ?? "",
      pronouns: contact?.pronouns ?? "",
      birth_date: toDateInputValue(contact?.birth_date ?? contact?.birthday),
      timezone: contact?.timezone ?? "",
      first_met_on: toDateInputValue(
        contact?.first_met_on ?? contact?.first_met_date,
      ),
      met_through: contact?.met_through ?? "",
      met_location: contact?.met_location ?? "",
      contact_methods: getInitialContactMethods(contact),
      addresses: contact?.addresses ?? [],
      employment:
        contact?.employment.map((entry) => ({
          ...entry,
          start_date: toDateInputValue(entry.start_date),
          end_date: toDateInputValue(entry.end_date),
        })) ?? [],
      education:
        contact?.education.map((entry) => ({
          ...entry,
          start_date: toDateInputValue(entry.start_date),
          end_date: toDateInputValue(entry.end_date),
        })) ?? [],
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
  const contactMethods = useFieldArray({
    control,
    name: "contact_methods",
    keyName: "_formKey",
  });
  const addresses = useFieldArray({
    control,
    name: "addresses",
    keyName: "_formKey",
  });
  const employment = useFieldArray({
    control,
    name: "employment",
    keyName: "_formKey",
  });
  const education = useFieldArray({
    control,
    name: "education",
    keyName: "_formKey",
  });
  const values = useWatch({ control });

  async function submit(nextValues: ContactFormValues) {
    const payload: CreateContactRequest = {
      first_name: nextValues.first_name,
      middle_name: emptyToUndefined(nextValues.middle_name),
      last_name: nextValues.last_name,
      email:
        getLegacyContactMethodValue(nextValues.contact_methods, "email") ??
        (contact ? "" : undefined),
      phone_number:
        getLegacyContactMethodValue(nextValues.contact_methods, "phone") ??
        (contact ? "" : undefined),
      address: emptyToUndefined(nextValues.address),
      preferred_name: emptyToUndefined(nextValues.preferred_name),
      gender_identity: emptyToUndefined(nextValues.gender_identity),
      pronouns: emptyToUndefined(nextValues.pronouns),
      birth_date: emptyToNull(nextValues.birth_date) as string | null,
      timezone: emptyToUndefined(nextValues.timezone),
      first_met_on: emptyToNull(nextValues.first_met_on) as string | null,
      met_through: emptyToUndefined(nextValues.met_through),
      met_location: emptyToUndefined(nextValues.met_location),
      contact_methods: nextValues.contact_methods.map((method) => ({
        ...method,
        label: method.label?.trim() ?? "",
        value: method.value.trim(),
      })),
      addresses: nextValues.addresses.map((address) => ({
        ...address,
        label: address.label?.trim() ?? "",
        line_1: address.line_1.trim(),
        line_2: address.line_2?.trim() ?? "",
        city: address.city?.trim() ?? "",
        region: address.region?.trim() ?? "",
        postal_code: address.postal_code?.trim() ?? "",
        country_code: address.country_code?.trim().toUpperCase() ?? "",
      })),
      employment: nextValues.employment.map((entry) => ({
        ...entry,
        organization: entry.organization?.trim() ?? "",
        start_date: emptyToNull(entry.start_date) as string | null,
        end_date: emptyToNull(entry.end_date) as string | null,
      })),
      education: nextValues.education.map((entry) => ({
        ...entry,
        credential: entry.credential?.trim() ?? "",
        field_of_study: entry.field_of_study?.trim() ?? "",
        start_date: emptyToNull(entry.start_date) as string | null,
        end_date: emptyToNull(entry.end_date) as string | null,
      })),
      relation: emptyToNull(nextValues.relation),
      occupation: emptyToNull(nextValues.occupation),
      custom_occupation: emptyToUndefined(nextValues.custom_occupation),
      company: emptyToUndefined(nextValues.company),
      education_level: emptyToNull(nextValues.education_level),
      custom_education_level: emptyToUndefined(
        nextValues.custom_education_level,
      ),
      school: emptyToUndefined(nextValues.school),
      profile_picture_id: emptyToNull(nextValues.profile_picture_id),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.fieldErrors) {
        let handledFieldError = false;
        for (const fieldName of fieldNames) {
          const fieldError = apiError.fieldErrors[fieldName]?.[0];
          if (fieldError) {
            setError(fieldName, { message: fieldError });
            handledFieldError = true;
          }
        }
        if (!handledFieldError) {
          setError("root", {
            message:
              apiError.message || "Check the profile details and try again.",
          });
        }
      }

      if (!apiError.fieldErrors) {
        setError("root", {
          message: apiError.message || "Unable to save contact.",
        });
      }
    }
  }

  function handleInvalidSubmit(invalidErrors: FieldErrors<ContactFormValues>) {
    const fieldPath = findFirstInvalidFieldPath(invalidErrors);
    if (!fieldPath) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const controls = Array.from(
          document
            .getElementById("contact-form")
            ?.querySelectorAll<HTMLElement>("[name]") ?? [],
        );
        const pathParts = fieldPath.split(".");
        const candidatePaths = pathParts.map((_, index) =>
          pathParts.slice(0, pathParts.length - index).join("."),
        );
        const field = candidatePaths
          .map((candidatePath) =>
            controls.find((control) => {
              const name = control.getAttribute("name");
              return (
                (name === candidatePath ||
                  name?.startsWith(`${candidatePath}.`)) &&
                control.getAttribute("type") !== "hidden" &&
                !control.hasAttribute("disabled")
              );
            }),
          )
          .find(Boolean);

        if (!field) return;
        field.scrollIntoView({ block: "center", inline: "nearest" });
        field.focus({ preventScroll: true });
      });
    });
  }

  const relationshipLabel =
    relations.find((relation) => String(relation.id) === values?.relation)
      ?.name ??
    (values?.relation && String(contact?.relation) === values.relation
      ? contact?.relation_name
      : null) ??
    null;
  const legacyEducationLabel = educationLevels.find(
    (level) => String(level.id) === values?.education_level,
  )?.name;
  const draftPresentation = getContactFormDraftPresentation(values ?? {}, {
    relationshipLabel,
    legacyOccupationLabel: contact?.occupation_name,
    legacyEducationLabel,
  });
  const progressItems = getContactFormProgress(values ?? {}, errors);
  const collapsedSummaries = getContactFormCollapsedSummaries(values ?? {});

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(submit, handleInvalidSubmit)}
      aria-busy={isSubmitting}
      className="min-w-0 space-y-4 pb-[env(safe-area-inset-bottom)] [&_button]:scroll-mt-6 [&_button]:scroll-mb-32 [&_input]:scroll-mt-6 [&_input]:scroll-mb-32 [&_select]:scroll-mt-6 [&_select]:scroll-mb-32"
    >
      {errors.root?.message && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      )}

      <ContactFormLayout>
        <ContactFormMain>
          <PersonFormSection
            currentPhoto={contact?.profile_picture}
            fallbackInitials={draftPresentation.initials}
            onPhotoChange={(mediaId, asset) => {
              setValue("profile_picture_id", mediaId, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setSelectedProfilePicture(asset ?? null);
            }}
            firstNameRegistration={register("first_name")}
            middleNameRegistration={register("middle_name")}
            lastNameRegistration={register("last_name")}
            preferredNameRegistration={register("preferred_name")}
            relationshipRegistration={register("relation")}
            relationships={relations}
            isLoadingRelationships={isLoading}
            showMiddleNameInitially={Boolean(contact?.middle_name?.trim())}
            errors={{
              firstName: errors.first_name?.message,
              middleName: errors.middle_name?.message,
              lastName: errors.last_name?.message,
              preferredName: errors.preferred_name?.message,
              relationship: errors.relation?.message,
              photo: errors.profile_picture_id?.message,
            }}
          />

          <ProfileEssentialsFormSection
            genderRegistration={register("gender_identity")}
            pronounsRegistration={register("pronouns")}
            birthdayRegistration={register("birth_date")}
            timezoneRegistration={register("timezone")}
            errors={{
              gender: errors.gender_identity?.message,
              pronouns: errors.pronouns?.message,
              birthday: errors.birth_date?.message,
              timezone: errors.timezone?.message,
            }}
          />

          <ContactMethodsFormSection
            collapsedSummary={collapsedSummaries.contact}
            entries={contactMethods.fields.map((field, index) => {
              const method = values?.contact_methods?.[index];
              return {
                key: field._formKey,
                index,
                kind: method?.kind ?? field.kind,
                label: method?.label ?? field.label ?? "",
                isPrimary: Boolean(method?.is_primary),
                kindRegistration: register(`contact_methods.${index}.kind`),
                labelRegistration: register(`contact_methods.${index}.label`),
                valueRegistration: register(`contact_methods.${index}.value`),
                primaryRegistration: register(
                  `contact_methods.${index}.is_primary`,
                ),
                labelError: errors.contact_methods?.[index]?.label?.message,
                valueError: errors.contact_methods?.[index]?.value?.message,
              };
            })}
            rootError={errors.contact_methods?.root?.message}
            onAdd={(kind) =>
              contactMethods.append({
                kind,
                label: "",
                value: "",
                is_primary: false,
              })
            }
            onRemove={(index) => contactMethods.remove(index)}
            onPrimaryChange={(index, kind, isPrimary) => {
              if (!isPrimary) {
                setValue(`contact_methods.${index}.is_primary`, false, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                return;
              }

              values?.contact_methods?.forEach((method, methodIndex) => {
                if (method?.kind === kind) {
                  setValue(
                    `contact_methods.${methodIndex}.is_primary`,
                    methodIndex === index,
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  );
                }
              });
            }}
          />

          <AddressesFormSection
            collapsedSummary={collapsedSummaries.location}
            entries={addresses.fields.map((field, index) => {
              const address = values?.addresses?.[index];
              return {
                key: field._formKey,
                index,
                label: address?.label ?? field.label ?? "",
                isPrimary: Boolean(address?.is_primary),
                labelRegistration: register(`addresses.${index}.label`),
                line1Registration: register(`addresses.${index}.line_1`),
                line2Registration: register(`addresses.${index}.line_2`),
                cityRegistration: register(`addresses.${index}.city`),
                regionRegistration: register(`addresses.${index}.region`),
                postalCodeRegistration: register(
                  `addresses.${index}.postal_code`,
                ),
                countryCodeRegistration: register(
                  `addresses.${index}.country_code`,
                ),
                primaryRegistration: register(`addresses.${index}.is_primary`),
                errors: {
                  label: errors.addresses?.[index]?.label?.message,
                  line1: errors.addresses?.[index]?.line_1?.message,
                  line2: errors.addresses?.[index]?.line_2?.message,
                  city: errors.addresses?.[index]?.city?.message,
                  region: errors.addresses?.[index]?.region?.message,
                  postalCode: errors.addresses?.[index]?.postal_code?.message,
                  countryCode: errors.addresses?.[index]?.country_code?.message,
                },
              };
            })}
            legacyAddress={values?.address ?? ""}
            legacyAddressRegistration={register("address")}
            legacyAddressError={errors.address?.message}
            rootError={errors.addresses?.root?.message}
            onAdd={() =>
              addresses.append({
                label: "",
                line_1: "",
                line_2: "",
                city: "",
                region: "",
                postal_code: "",
                country_code: "",
                is_primary: false,
              })
            }
            onRemove={(index) => addresses.remove(index)}
            onPrimaryChange={(index, isPrimary) => {
              if (!isPrimary) {
                setValue(`addresses.${index}.is_primary`, false, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                return;
              }

              values?.addresses?.forEach((_address, addressIndex) => {
                setValue(
                  `addresses.${addressIndex}.is_primary`,
                  addressIndex === index,
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                );
              });
            }}
          />

          <RelationshipContextFormSection
            collapsedSummary={collapsedSummaries.relationship}
            firstMet={values?.first_met_on ?? ""}
            metThrough={values?.met_through ?? ""}
            metLocation={values?.met_location ?? ""}
            firstMetRegistration={register("first_met_on")}
            metThroughRegistration={register("met_through")}
            metLocationRegistration={register("met_location")}
            errors={{
              firstMet: errors.first_met_on?.message,
              metThrough: errors.met_through?.message,
              metLocation: errors.met_location?.message,
            }}
          />

          <WorkEducationFormSection
            collapsedSummary={collapsedSummaries.workEducation}
            hasWorkDetails={Boolean(
              employment.fields.length ||
              values?.occupation ||
              values?.custom_occupation?.trim() ||
              values?.company?.trim(),
            )}
            hasEducationDetails={Boolean(
              education.fields.length ||
              values?.education_level ||
              values?.custom_education_level?.trim() ||
              values?.school?.trim(),
            )}
            hasWorkErrors={Boolean(errors.employment)}
            hasEducationErrors={Boolean(
              errors.education ||
              errors.education_level ||
              errors.custom_education_level ||
              errors.school,
            )}
            onAddWork={() =>
              employment.append({
                title: "",
                organization: "",
                start_date: "",
                end_date: "",
                is_current: false,
              })
            }
            onAddEducation={() =>
              education.append({
                credential: "",
                field_of_study: "",
                institution: "",
                start_date: "",
                end_date: "",
                is_current: false,
              })
            }
          >
            <EmploymentFormSection
              entries={employment.fields.map((field, index) => {
                const entry = values?.employment?.[index];
                return {
                  key: field._formKey,
                  index,
                  title: entry?.title ?? field.title,
                  isCurrent: Boolean(entry?.is_current),
                  titleRegistration: register(`employment.${index}.title`),
                  organizationRegistration: register(
                    `employment.${index}.organization`,
                  ),
                  startDateRegistration: register(
                    `employment.${index}.start_date`,
                  ),
                  endDateRegistration: register(`employment.${index}.end_date`),
                  currentRegistration: register(
                    `employment.${index}.is_current`,
                  ),
                  errors: {
                    title: errors.employment?.[index]?.title?.message,
                    organization:
                      errors.employment?.[index]?.organization?.message,
                    startDate: errors.employment?.[index]?.start_date?.message,
                    endDate: errors.employment?.[index]?.end_date?.message,
                  },
                };
              })}
              legacyTitle={
                (values?.custom_occupation ?? "").trim() ||
                contact?.occupation_name ||
                ""
              }
              legacyOrganization={values?.company ?? ""}
              legacyOccupationRegistration={register("occupation")}
              legacyCustomOccupationRegistration={register("custom_occupation")}
              legacyCompanyRegistration={register("company")}
              rootError={errors.employment?.root?.message}
              onAdd={() =>
                employment.append({
                  title: "",
                  organization: "",
                  start_date: "",
                  end_date: "",
                  is_current: false,
                })
              }
              onRemove={(index) => employment.remove(index)}
              onCurrentChange={(index, isCurrent) => {
                if (isCurrent) {
                  setValue(`employment.${index}.end_date`, "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            />

            <EducationFormSection
              entries={education.fields.map((field, index) => {
                const entry = values?.education?.[index];
                return {
                  key: field._formKey,
                  index,
                  credential: entry?.credential ?? field.credential ?? "",
                  fieldOfStudy:
                    entry?.field_of_study ?? field.field_of_study ?? "",
                  institution: entry?.institution ?? field.institution,
                  isCurrent: Boolean(entry?.is_current),
                  credentialRegistration: register(
                    `education.${index}.credential`,
                  ),
                  fieldOfStudyRegistration: register(
                    `education.${index}.field_of_study`,
                  ),
                  institutionRegistration: register(
                    `education.${index}.institution`,
                  ),
                  startDateRegistration: register(
                    `education.${index}.start_date`,
                  ),
                  endDateRegistration: register(`education.${index}.end_date`),
                  currentRegistration: register(
                    `education.${index}.is_current`,
                  ),
                  errors: {
                    credential: errors.education?.[index]?.credential?.message,
                    fieldOfStudy:
                      errors.education?.[index]?.field_of_study?.message,
                    institution:
                      errors.education?.[index]?.institution?.message,
                    startDate: errors.education?.[index]?.start_date?.message,
                    endDate: errors.education?.[index]?.end_date?.message,
                  },
                };
              })}
              legacyCredential={
                (values?.custom_education_level ?? "").trim() ||
                educationLevels.find(
                  (level) => String(level.id) === values?.education_level,
                )?.name ||
                (values?.education_level ? "Saved education level" : "")
              }
              legacyInstitution={values?.school ?? ""}
              legacyEducationLevelRegistration={register("education_level")}
              legacyCustomEducationRegistration={register(
                "custom_education_level",
              )}
              legacySchoolRegistration={register("school")}
              rootError={
                errors.education?.root?.message ||
                errors.education_level?.message ||
                errors.custom_education_level?.message ||
                errors.school?.message
              }
              onAdd={() =>
                education.append({
                  credential: "",
                  field_of_study: "",
                  institution: "",
                  start_date: "",
                  end_date: "",
                  is_current: false,
                })
              }
              onRemove={(index) => education.remove(index)}
              onCurrentChange={(index, isCurrent) => {
                if (isCurrent) {
                  setValue(`education.${index}.end_date`, "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            />
          </WorkEducationFormSection>
        </ContactFormMain>

        <ContactFormRail>
          <ContactDraftProfilePreview
            presentation={draftPresentation}
            profilePicture={selectedProfilePicture}
          />
          <ContactFormProfileProgress items={progressItems} />
        </ContactFormRail>
      </ContactFormLayout>

      <footer className="relative z-20 flex min-w-0 flex-col gap-3 rounded-xl border border-primary/15 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-sm md:sticky md:bottom-3 md:flex-row md:items-center md:justify-between">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck
            className="size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          Your entries are private and only visible to you.
        </p>
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:shrink-0 sm:justify-end">
          <Button asChild variant="outline">
            <Link href={contact ? `/contacts/${contact.id}` : "/contacts"}>
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:min-w-32"
          >
            {isSubmitting
              ? contact
                ? "Saving..."
                : "Creating..."
              : submitLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}

function findFirstInvalidFieldPath(errors: FieldErrors<ContactFormValues>) {
  for (const fieldName of validationFocusOrder) {
    const error = errors[fieldName];
    if (!error) continue;
    return findNestedErrorPath(error, String(fieldName)) ?? String(fieldName);
  }
  return null;
}

function findNestedErrorPath(value: unknown, path: string): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const nested = findNestedErrorPath(value[index], `${path}.${index}`);
      if (nested) return nested;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.message === "string") return path;

  for (const [key, nestedValue] of Object.entries(record)) {
    if (["ref", "type", "types", "message"].includes(key)) continue;
    const nested = findNestedErrorPath(nestedValue, `${path}.${key}`);
    if (nested) return nested;
  }
  return null;
}
