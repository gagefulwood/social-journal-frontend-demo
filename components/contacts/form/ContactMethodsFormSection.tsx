"use client";

import { useState } from "react";
import { ContactRound, Mail, Phone, Trash2 } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ContactFormDisclosure } from "@/components/contacts/form/ContactFormDisclosure";
import { EntryIconAction } from "@/components/contacts/form/EntryIconAction";
import { FormAddAction } from "@/components/contacts/form/FormAddAction";
import { FormEmptyInvite } from "@/components/contacts/form/FormEmptyInvite";
import { PrimaryStatusBadge } from "@/components/contacts/form/PrimaryStatusBadge";
import { RepeatableEntryShell } from "@/components/contacts/form/RepeatableEntryShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ContactMethodFormEntry = {
  key: string;
  index: number;
  kind: "email" | "phone";
  label: string;
  isPrimary: boolean;
  kindRegistration: UseFormRegisterReturn;
  labelRegistration: UseFormRegisterReturn;
  valueRegistration: UseFormRegisterReturn;
  primaryRegistration: UseFormRegisterReturn;
  labelError?: string;
  valueError?: string;
};

type ContactMethodsFormSectionProps = {
  entries: ContactMethodFormEntry[];
  collapsedSummary: string;
  rootError?: string;
  onAdd: (kind: ContactMethodFormEntry["kind"]) => void;
  onRemove: (index: number) => void;
  onPrimaryChange: (
    index: number,
    kind: ContactMethodFormEntry["kind"],
    isPrimary: boolean,
  ) => void;
};

export function ContactMethodsFormSection({
  entries,
  collapsedSummary,
  rootError,
  onAdd,
  onRemove,
  onPrimaryChange,
}: ContactMethodsFormSectionProps) {
  const hasErrors = Boolean(
    rootError || entries.some((entry) => entry.labelError || entry.valueError),
  );
  const [isOpen, setIsOpen] = useState(entries.length > 0 || hasErrors);

  function handleAdd(kind: ContactMethodFormEntry["kind"]) {
    setIsOpen(true);
    onAdd(kind);
  }

  function handleRemove(index: number) {
    if (entries.length === 1) {
      setIsOpen(false);
    }
    onRemove(index);
  }

  const emptyInvite = (
    <FormEmptyInvite
      summary="No contact methods yet. Add one whenever it is useful."
      actions={
        <>
          <FormAddAction onClick={() => handleAdd("phone")}>
            Add phone
          </FormAddAction>
          <FormAddAction onClick={() => handleAdd("email")}>
            Add email
          </FormAddAction>
        </>
      }
    />
  );

  return (
    <ContactFormDisclosure
      title="Ways to stay in touch"
      description="Add the best ways to reach them."
      icon={ContactRound}
      collapsedSummary={collapsedSummary}
      open={isOpen}
      onOpenChange={setIsOpen}
      hasErrors={hasErrors}
      errorSummary={rootError ?? "Check the highlighted contact method."}
      collapsedContent={
        entries.length === 0 ? (
          <div className="flex min-w-0 flex-wrap gap-2">
            <FormAddAction onClick={() => handleAdd("phone")}>
              Add phone
            </FormAddAction>
            <FormAddAction onClick={() => handleAdd("email")}>
              Add email
            </FormAddAction>
          </div>
        ) : undefined
      }
    >
      {entries.length === 0 ? (
        emptyInvite
      ) : (
        <div className="min-w-0">
          <div className="grid min-w-0 gap-2">
            {entries.map((entry) => {
              const isEmail = entry.kind === "email";
              const KindIcon = isEmail ? Mail : Phone;
              const kindLabel = isEmail ? "Email" : "Phone";
              const entryName = entry.label.trim() || kindLabel.toLowerCase();

              return (
                <RepeatableEntryShell
                  key={entry.key}
                  icon={KindIcon}
                  label={kindLabel}
                  primaryStatus={
                    entry.isPrimary ? <PrimaryStatusBadge /> : undefined
                  }
                  actions={
                    <EntryIconAction
                      icon={Trash2}
                      label={`Remove ${entryName}`}
                      tone="destructive"
                      onClick={() => handleRemove(entry.index)}
                    />
                  }
                >
                  <input
                    type="hidden"
                    value={entry.kind}
                    {...entry.kindRegistration}
                  />
                  <input
                    type="checkbox"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    {...entry.primaryRegistration}
                  />
                  <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(8rem,0.55fr)_minmax(12rem,1fr)_auto] md:items-end">
                    <div className="min-w-0 space-y-1.5">
                      <Label htmlFor={`contact-method-${entry.index}-label`}>
                        Label{" "}
                        <span className="text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id={`contact-method-${entry.index}-label`}
                        className="h-10"
                        placeholder={isEmail ? "Personal email" : "Mobile"}
                        aria-describedby={
                          entry.labelError
                            ? `contact-method-${entry.index}-label-error`
                            : undefined
                        }
                        aria-invalid={Boolean(entry.labelError)}
                        {...entry.labelRegistration}
                      />
                      {entry.labelError && (
                        <p
                          id={`contact-method-${entry.index}-label-error`}
                          className="text-sm text-destructive"
                        >
                          {entry.labelError}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <Label htmlFor={`contact-method-${entry.index}-value`}>
                        {isEmail ? "Email address" : "Phone number"}
                      </Label>
                      <Input
                        id={`contact-method-${entry.index}-value`}
                        type={isEmail ? "email" : "tel"}
                        className="h-10"
                        placeholder={
                          isEmail ? "name@example.com" : "+1 555-0101"
                        }
                        aria-describedby={
                          entry.valueError
                            ? `contact-method-${entry.index}-value-error`
                            : undefined
                        }
                        aria-invalid={Boolean(entry.valueError)}
                        {...entry.valueRegistration}
                      />
                      {entry.valueError && (
                        <p
                          id={`contact-method-${entry.index}-value-error`}
                          className="text-sm text-destructive"
                        >
                          {entry.valueError}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant={entry.isPrimary ? "soft" : "outline"}
                      size="sm"
                      aria-pressed={entry.isPrimary}
                      className="justify-self-start md:justify-self-end"
                      onClick={() =>
                        onPrimaryChange(
                          entry.index,
                          entry.kind,
                          !entry.isPrimary,
                        )
                      }
                    >
                      {entry.isPrimary ? "Unset primary" : "Set primary"}
                    </Button>
                  </div>
                </RepeatableEntryShell>
              );
            })}
          </div>

          <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
            <FormAddAction onClick={() => handleAdd("phone")}>
              Add phone
            </FormAddAction>
            <FormAddAction onClick={() => handleAdd("email")}>
              Add email
            </FormAddAction>
          </div>
        </div>
      )}
    </ContactFormDisclosure>
  );
}
