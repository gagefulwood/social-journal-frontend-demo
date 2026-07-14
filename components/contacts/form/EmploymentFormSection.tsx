"use client";

import type { ChangeEvent } from "react";
import { BriefcaseBusiness, Trash2 } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { EntryIconAction } from "@/components/contacts/form/EntryIconAction";
import { FormAddAction } from "@/components/contacts/form/FormAddAction";
import { FormEmptyInvite } from "@/components/contacts/form/FormEmptyInvite";
import { RepeatableEntryShell } from "@/components/contacts/form/RepeatableEntryShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EmploymentFormEntry = {
  key: string;
  index: number;
  title: string;
  isCurrent: boolean;
  titleRegistration: UseFormRegisterReturn;
  organizationRegistration: UseFormRegisterReturn;
  startDateRegistration: UseFormRegisterReturn;
  endDateRegistration: UseFormRegisterReturn;
  currentRegistration: UseFormRegisterReturn;
  errors: {
    title?: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
  };
};

type EmploymentFormSectionProps = {
  entries: EmploymentFormEntry[];
  legacyTitle: string;
  legacyOrganization: string;
  legacyOccupationRegistration: UseFormRegisterReturn;
  legacyCustomOccupationRegistration: UseFormRegisterReturn;
  legacyCompanyRegistration: UseFormRegisterReturn;
  rootError?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onCurrentChange: (index: number, isCurrent: boolean) => void;
};

export function EmploymentFormSection({
  entries,
  legacyTitle,
  legacyOrganization,
  legacyOccupationRegistration,
  legacyCustomOccupationRegistration,
  legacyCompanyRegistration,
  rootError,
  onAdd,
  onRemove,
  onCurrentChange,
}: EmploymentFormSectionProps) {
  const hasLegacyWork = Boolean(
    legacyTitle.trim() || legacyOrganization.trim(),
  );
  const showLegacyCompatibility = hasLegacyWork && entries.length === 0;

  const legacyRegistrations = (
    <>
      <input type="hidden" {...legacyOccupationRegistration} />
      <input type="hidden" {...legacyCustomOccupationRegistration} />
      <input type="hidden" {...legacyCompanyRegistration} />
    </>
  );

  const emptyInvite = (
    <FormEmptyInvite
      summary="No work details yet."
      actions={<FormAddAction onClick={onAdd}>Add work</FormAddAction>}
    />
  );

  return (
    <section aria-labelledby="contact-form-work-heading" className="min-w-0">
      {legacyRegistrations}

      <div className="mb-3 flex min-w-0 items-center gap-2">
        <BriefcaseBusiness
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <h3 id="contact-form-work-heading" className="text-sm font-semibold">
          Work
        </h3>
      </div>

      {rootError && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {rootError}
        </p>
      )}

      {showLegacyCompatibility && (
        <RepeatableEntryShell
          icon={BriefcaseBusiness}
          label="Legacy work details"
        >
          <dl className="grid min-w-0 gap-2 text-sm sm:grid-cols-2">
            {legacyTitle && (
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Role</dt>
                <dd className="mt-1 break-words [overflow-wrap:anywhere]">
                  {legacyTitle}
                </dd>
              </div>
            )}
            {legacyOrganization && (
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Organization</dt>
                <dd className="mt-1 break-words [overflow-wrap:anywhere]">
                  {legacyOrganization}
                </dd>
              </div>
            )}
          </dl>
        </RepeatableEntryShell>
      )}

      {entries.length > 0 && (
        <div className="grid min-w-0 gap-2">
          {entries.map((entry) => {
            const roleLabel = entry.title.trim() || "work role";
            const {
              onChange: onCurrentRegistrationChange,
              ...currentRegistration
            } = entry.currentRegistration;

            return (
              <RepeatableEntryShell
                key={entry.key}
                icon={BriefcaseBusiness}
                label={
                  <span>
                    Work
                    {entry.isCurrent && (
                      <span className="text-muted-foreground"> · Current</span>
                    )}
                  </span>
                }
                actions={
                  <EntryIconAction
                    icon={Trash2}
                    label={`Remove ${roleLabel}`}
                    tone="destructive"
                    onClick={() => onRemove(entry.index)}
                  />
                }
              >
                <div className="grid min-w-0 gap-3 md:grid-cols-2">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`employment-${entry.index}-title`}>
                      Job title
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only">required</span>
                    </Label>
                    <Input
                      id={`employment-${entry.index}-title`}
                      className="h-10"
                      required
                      aria-describedby={
                        entry.errors.title
                          ? `employment-${entry.index}-title-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.title)}
                      {...entry.titleRegistration}
                    />
                    {entry.errors.title && (
                      <p
                        id={`employment-${entry.index}-title-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.title}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`employment-${entry.index}-organization`}>
                      Organization
                    </Label>
                    <Input
                      id={`employment-${entry.index}-organization`}
                      className="h-10"
                      aria-describedby={
                        entry.errors.organization
                          ? `employment-${entry.index}-organization-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.organization)}
                      {...entry.organizationRegistration}
                    />
                    {entry.errors.organization && (
                      <p
                        id={`employment-${entry.index}-organization-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.organization}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(9rem,1fr)_minmax(9rem,1fr)_auto] lg:items-end">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`employment-${entry.index}-start-date`}>
                      Start date
                    </Label>
                    <Input
                      id={`employment-${entry.index}-start-date`}
                      type="date"
                      className="h-10"
                      aria-describedby={
                        entry.errors.startDate
                          ? `employment-${entry.index}-start-date-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.startDate)}
                      {...entry.startDateRegistration}
                    />
                    {entry.errors.startDate && (
                      <p
                        id={`employment-${entry.index}-start-date-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.startDate}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`employment-${entry.index}-end-date`}>
                      End date
                    </Label>
                    <Input
                      id={`employment-${entry.index}-end-date`}
                      type="date"
                      className="h-10"
                      disabled={entry.isCurrent}
                      aria-describedby={
                        entry.errors.endDate
                          ? `employment-${entry.index}-end-date-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.endDate)}
                      {...entry.endDateRegistration}
                    />
                    {entry.errors.endDate && (
                      <p
                        id={`employment-${entry.index}-end-date-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.endDate}
                      </p>
                    )}
                  </div>

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
                    <span>I currently work here</span>
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
            {entries.length > 0 ? "Add another work" : "Add work"}
          </FormAddAction>
        </div>
      )}
    </section>
  );
}
