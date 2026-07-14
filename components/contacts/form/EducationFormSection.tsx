"use client";

import type { ChangeEvent, ReactNode } from "react";
import { GraduationCap, Trash2 } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { EntryIconAction } from "@/components/contacts/form/EntryIconAction";
import { FormAddAction } from "@/components/contacts/form/FormAddAction";
import { FormEmptyInvite } from "@/components/contacts/form/FormEmptyInvite";
import { RepeatableEntryShell } from "@/components/contacts/form/RepeatableEntryShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EducationFormEntry = {
  key: string;
  index: number;
  credential: string;
  fieldOfStudy: string;
  institution: string;
  isCurrent: boolean;
  credentialRegistration: UseFormRegisterReturn;
  fieldOfStudyRegistration: UseFormRegisterReturn;
  institutionRegistration: UseFormRegisterReturn;
  startDateRegistration: UseFormRegisterReturn;
  endDateRegistration: UseFormRegisterReturn;
  currentRegistration: UseFormRegisterReturn;
  errors: {
    credential?: string;
    fieldOfStudy?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
  };
};

type EducationFormSectionProps = {
  entries: EducationFormEntry[];
  legacyCredential: string;
  legacyInstitution: string;
  legacyEducationLevelRegistration: UseFormRegisterReturn;
  legacyCustomEducationRegistration: UseFormRegisterReturn;
  legacySchoolRegistration: UseFormRegisterReturn;
  rootError?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onCurrentChange: (index: number, isCurrent: boolean) => void;
};

export function EducationFormSection({
  entries,
  legacyCredential,
  legacyInstitution,
  legacyEducationLevelRegistration,
  legacyCustomEducationRegistration,
  legacySchoolRegistration,
  rootError,
  onAdd,
  onRemove,
  onCurrentChange,
}: EducationFormSectionProps) {
  const hasLegacyEducation = Boolean(
    legacyCredential.trim() || legacyInstitution.trim(),
  );
  const showLegacyCompatibility = hasLegacyEducation && entries.length === 0;

  const legacyRegistrations = (
    <>
      <input type="hidden" {...legacyEducationLevelRegistration} />
      <input type="hidden" {...legacyCustomEducationRegistration} />
      <input type="hidden" {...legacySchoolRegistration} />
    </>
  );

  const emptyInvite = (
    <FormEmptyInvite
      summary="No education details yet."
      actions={<FormAddAction onClick={onAdd}>Add education</FormAddAction>}
    />
  );

  return (
    <section
      aria-labelledby="contact-form-education-heading"
      className="min-w-0 pt-4"
    >
      {legacyRegistrations}

      <div className="mb-3 flex min-w-0 items-center gap-2">
        <GraduationCap
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <h3
          id="contact-form-education-heading"
          className="text-sm font-semibold"
        >
          Education
        </h3>
      </div>

      {rootError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {rootError}
        </p>
      )}

      {showLegacyCompatibility && (
        <RepeatableEntryShell
          icon={GraduationCap}
          label="Legacy education details"
        >
          <dl className="grid min-w-0 gap-2 text-sm sm:grid-cols-2">
            {legacyCredential && (
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Education level
                </dt>
                <dd className="mt-1 break-words [overflow-wrap:anywhere]">
                  {legacyCredential}
                </dd>
              </div>
            )}
            {legacyInstitution && (
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">School</dt>
                <dd className="mt-1 break-words [overflow-wrap:anywhere]">
                  {legacyInstitution}
                </dd>
              </div>
            )}
          </dl>
        </RepeatableEntryShell>
      )}

      {entries.length > 0 && (
        <div className="grid min-w-0 gap-2">
          {entries.map((entry) => {
            const educationLabel =
              [entry.credential.trim(), entry.fieldOfStudy.trim()]
                .filter(Boolean)
                .join(" ") ||
              entry.institution.trim() ||
              "education record";
            const removeLabel =
              educationLabel === "education record"
                ? "Remove education record"
                : `Remove ${educationLabel} education`;
            const {
              onChange: onCurrentRegistrationChange,
              ...currentRegistration
            } = entry.currentRegistration;

            return (
              <RepeatableEntryShell
                key={entry.key}
                icon={GraduationCap}
                label={
                  <span>
                    Education
                    {entry.isCurrent && (
                      <span className="text-muted-foreground"> · Current</span>
                    )}
                  </span>
                }
                actions={
                  <EntryIconAction
                    icon={Trash2}
                    label={removeLabel}
                    tone="destructive"
                    onClick={() => onRemove(entry.index)}
                  />
                }
              >
                <div className="grid min-w-0 gap-3 md:grid-cols-2">
                  <EducationField
                    id={`education-${entry.index}-credential`}
                    label="Credential / degree"
                    error={entry.errors.credential}
                  >
                    <Input
                      id={`education-${entry.index}-credential`}
                      className="h-10"
                      aria-describedby={describedBy(
                        `education-${entry.index}-credential`,
                        entry.errors.credential,
                      )}
                      aria-invalid={Boolean(entry.errors.credential)}
                      {...entry.credentialRegistration}
                    />
                  </EducationField>

                  <EducationField
                    id={`education-${entry.index}-institution`}
                    label="Institution / school"
                    required
                    error={entry.errors.institution}
                  >
                    <Input
                      id={`education-${entry.index}-institution`}
                      className="h-10"
                      required
                      aria-describedby={describedBy(
                        `education-${entry.index}-institution`,
                        entry.errors.institution,
                      )}
                      aria-invalid={Boolean(entry.errors.institution)}
                      {...entry.institutionRegistration}
                    />
                  </EducationField>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(9rem,0.8fr)_minmax(9rem,0.8fr)_auto] xl:items-end">
                  <EducationField
                    id={`education-${entry.index}-field-of-study`}
                    label="Field of study"
                    error={entry.errors.fieldOfStudy}
                  >
                    <Input
                      id={`education-${entry.index}-field-of-study`}
                      className="h-10"
                      aria-describedby={describedBy(
                        `education-${entry.index}-field-of-study`,
                        entry.errors.fieldOfStudy,
                      )}
                      aria-invalid={Boolean(entry.errors.fieldOfStudy)}
                      {...entry.fieldOfStudyRegistration}
                    />
                  </EducationField>

                  <EducationField
                    id={`education-${entry.index}-start-date`}
                    label="Start date"
                    error={entry.errors.startDate}
                  >
                    <Input
                      id={`education-${entry.index}-start-date`}
                      type="date"
                      className="h-10"
                      aria-describedby={describedBy(
                        `education-${entry.index}-start-date`,
                        entry.errors.startDate,
                      )}
                      aria-invalid={Boolean(entry.errors.startDate)}
                      {...entry.startDateRegistration}
                    />
                  </EducationField>

                  <EducationField
                    id={`education-${entry.index}-end-date`}
                    label="End date"
                    error={entry.errors.endDate}
                  >
                    <Input
                      id={`education-${entry.index}-end-date`}
                      type="date"
                      className="h-10"
                      disabled={entry.isCurrent}
                      aria-describedby={describedBy(
                        `education-${entry.index}-end-date`,
                        entry.errors.endDate,
                      )}
                      aria-invalid={Boolean(entry.errors.endDate)}
                      {...entry.endDateRegistration}
                    />
                  </EducationField>

                  <label className="flex min-h-10 min-w-0 items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      className="size-4 shrink-0 rounded border-input"
                      {...currentRegistration}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        void onCurrentRegistrationChange(event);
                        onCurrentChange(entry.index, event.target.checked);
                      }}
                    />
                    <span>I currently study here</span>
                  </label>
                </div>
              </RepeatableEntryShell>
            );
          })}
        </div>
      )}

      {entries.length === 0 && !showLegacyCompatibility && emptyInvite}

      {(entries.length > 0 || showLegacyCompatibility) && (
        <div className="mt-3">
          <FormAddAction onClick={onAdd}>
            {entries.length > 0 ? "Add another education" : "Add education"}
          </FormAddAction>
        </div>
      )}
    </section>
  );
}

function describedBy(id: string, error?: string) {
  return error ? `${id}-error` : undefined;
}

function EducationField({
  id,
  label,
  required = false,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && (
          <>
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
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
