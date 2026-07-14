"use client";

import { useState } from "react";
import { MapPin, Trash2 } from "lucide-react";
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

export type AddressFormEntry = {
  key: string;
  index: number;
  label: string;
  isPrimary: boolean;
  labelRegistration: UseFormRegisterReturn;
  line1Registration: UseFormRegisterReturn;
  line2Registration: UseFormRegisterReturn;
  cityRegistration: UseFormRegisterReturn;
  regionRegistration: UseFormRegisterReturn;
  postalCodeRegistration: UseFormRegisterReturn;
  countryCodeRegistration: UseFormRegisterReturn;
  primaryRegistration: UseFormRegisterReturn;
  errors: {
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
  };
};

type AddressesFormSectionProps = {
  entries: AddressFormEntry[];
  collapsedSummary: string;
  legacyAddress: string;
  legacyAddressRegistration: UseFormRegisterReturn;
  legacyAddressError?: string;
  rootError?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onPrimaryChange: (index: number, isPrimary: boolean) => void;
};

export function AddressesFormSection({
  entries,
  collapsedSummary,
  legacyAddress,
  legacyAddressRegistration,
  legacyAddressError,
  rootError,
  onAdd,
  onRemove,
  onPrimaryChange,
}: AddressesFormSectionProps) {
  const [hadLegacyAddress] = useState(Boolean(legacyAddress.trim()));
  const hasLegacyAddress = hadLegacyAddress || Boolean(legacyAddress.trim());
  const hasErrors = Boolean(
    legacyAddressError ||
    rootError ||
    entries.some((entry) => Object.values(entry.errors).some(Boolean)),
  );
  const [isOpen, setIsOpen] = useState(
    entries.length > 0 || hasLegacyAddress || hasErrors,
  );
  const showLegacyCompatibility =
    hasLegacyAddress && (entries.length === 0 || Boolean(legacyAddressError));

  function handleAdd() {
    setIsOpen(true);
    onAdd();
  }

  function handleRemove(index: number) {
    if (entries.length === 1 && !hasLegacyAddress) {
      setIsOpen(false);
    }
    onRemove(index);
  }

  const emptyInvite = (
    <FormEmptyInvite
      summary="No address yet."
      actions={<FormAddAction onClick={handleAdd}>Add address</FormAddAction>}
    />
  );

  return (
    <ContactFormDisclosure
      title="Location"
      description="Where they live."
      icon={MapPin}
      collapsedSummary={collapsedSummary}
      open={isOpen}
      onOpenChange={setIsOpen}
      hasErrors={hasErrors}
      errorSummary={rootError ?? "Check the highlighted address fields."}
      collapsedContent={
        entries.length === 0 && !hasLegacyAddress ? (
          <>
            <input type="hidden" {...legacyAddressRegistration} />
            <FormAddAction onClick={handleAdd}>Add address</FormAddAction>
          </>
        ) : undefined
      }
    >
      {!showLegacyCompatibility && (
        <input type="hidden" {...legacyAddressRegistration} />
      )}

      {showLegacyCompatibility && (
        <RepeatableEntryShell icon={MapPin} label="Legacy address">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="address">Legacy freeform address</Label>
            <Input
              id="address"
              className="h-10"
              aria-describedby={
                legacyAddressError
                  ? "legacy-address-help address-error"
                  : "legacy-address-help"
              }
              aria-invalid={Boolean(legacyAddressError)}
              {...legacyAddressRegistration}
            />
            <p
              id="legacy-address-help"
              className="text-xs leading-4 text-muted-foreground"
            >
              Kept exactly as originally entered. Add a structured address when
              useful.
            </p>
            {legacyAddressError && (
              <p id="address-error" className="text-sm text-destructive">
                {legacyAddressError}
              </p>
            )}
          </div>
        </RepeatableEntryShell>
      )}

      {entries.length > 0 && (
        <div className="grid min-w-0 gap-2">
          {entries.map((entry) => {
            const entryLabel = entry.label.trim();
            const displayLabel = entryLabel
              ? `${entryLabel} address`
              : `Address ${entry.index + 1}`;

            return (
              <RepeatableEntryShell
                key={entry.key}
                icon={MapPin}
                label={displayLabel}
                primaryStatus={
                  entry.isPrimary ? <PrimaryStatusBadge /> : undefined
                }
                actions={
                  <EntryIconAction
                    icon={Trash2}
                    label={`Remove ${displayLabel.toLowerCase()}`}
                    tone="destructive"
                    onClick={() => handleRemove(entry.index)}
                  />
                }
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  {...entry.primaryRegistration}
                />

                <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(10rem,1fr)_auto] sm:items-end">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-label`}>
                      Address label{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id={`address-${entry.index}-label`}
                      className="h-10"
                      placeholder="Home, Work, or School"
                      aria-describedby={
                        entry.errors.label
                          ? `address-${entry.index}-label-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.label)}
                      {...entry.labelRegistration}
                    />
                    {entry.errors.label && (
                      <p
                        id={`address-${entry.index}-label-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.label}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant={entry.isPrimary ? "soft" : "outline"}
                    size="sm"
                    aria-pressed={entry.isPrimary}
                    className="justify-self-start sm:justify-self-end"
                    onClick={() =>
                      onPrimaryChange(entry.index, !entry.isPrimary)
                    }
                  >
                    {entry.isPrimary ? "Unset primary" : "Set primary"}
                  </Button>
                </div>

                <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(0,2fr)_minmax(10rem,1fr)]">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-line-1`}>
                      Street address
                      <span className="text-destructive" aria-hidden="true">
                        *
                      </span>
                      <span className="sr-only">required</span>
                    </Label>
                    <Input
                      id={`address-${entry.index}-line-1`}
                      className="h-10"
                      required
                      aria-describedby={
                        entry.errors.line1
                          ? `address-${entry.index}-line-1-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.line1)}
                      {...entry.line1Registration}
                    />
                    {entry.errors.line1 && (
                      <p
                        id={`address-${entry.index}-line-1-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.line1}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-line-2`}>
                      Apt / suite
                    </Label>
                    <Input
                      id={`address-${entry.index}-line-2`}
                      className="h-10"
                      aria-describedby={
                        entry.errors.line2
                          ? `address-${entry.index}-line-2-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.line2)}
                      {...entry.line2Registration}
                    />
                    {entry.errors.line2 && (
                      <p
                        id={`address-${entry.index}-line-2-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.line2}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-city`}>City</Label>
                    <Input
                      id={`address-${entry.index}-city`}
                      className="h-10"
                      aria-describedby={
                        entry.errors.city
                          ? `address-${entry.index}-city-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.city)}
                      {...entry.cityRegistration}
                    />
                    {entry.errors.city && (
                      <p
                        id={`address-${entry.index}-city-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.city}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-region`}>
                      State / region
                    </Label>
                    <Input
                      id={`address-${entry.index}-region`}
                      className="h-10"
                      aria-describedby={
                        entry.errors.region
                          ? `address-${entry.index}-region-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.region)}
                      {...entry.regionRegistration}
                    />
                    {entry.errors.region && (
                      <p
                        id={`address-${entry.index}-region-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.region}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-postal-code`}>
                      ZIP / postal code
                    </Label>
                    <Input
                      id={`address-${entry.index}-postal-code`}
                      className="h-10"
                      aria-describedby={
                        entry.errors.postalCode
                          ? `address-${entry.index}-postal-code-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.postalCode)}
                      {...entry.postalCodeRegistration}
                    />
                    {entry.errors.postalCode && (
                      <p
                        id={`address-${entry.index}-postal-code-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label htmlFor={`address-${entry.index}-country-code`}>
                      Country code
                    </Label>
                    <Input
                      id={`address-${entry.index}-country-code`}
                      className="h-10"
                      placeholder="US"
                      maxLength={2}
                      autoComplete="off"
                      spellCheck={false}
                      aria-describedby={
                        entry.errors.countryCode
                          ? `address-${entry.index}-country-code-error`
                          : undefined
                      }
                      aria-invalid={Boolean(entry.errors.countryCode)}
                      {...entry.countryCodeRegistration}
                    />
                    {entry.errors.countryCode && (
                      <p
                        id={`address-${entry.index}-country-code-error`}
                        className="text-sm text-destructive"
                      >
                        {entry.errors.countryCode}
                      </p>
                    )}
                  </div>
                </div>
              </RepeatableEntryShell>
            );
          })}
        </div>
      )}

      {entries.length === 0 && !showLegacyCompatibility && emptyInvite}

      {(entries.length > 0 || showLegacyCompatibility) && (
        <div className="mt-3">
          <FormAddAction onClick={handleAdd}>
            {entries.length > 0 ? "Add another address" : "Add address"}
          </FormAddAction>
        </div>
      )}
    </ContactFormDisclosure>
  );
}
