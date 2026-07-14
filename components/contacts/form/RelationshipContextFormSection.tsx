"use client";

import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ContactFormDisclosure } from "@/components/contacts/form/ContactFormDisclosure";
import { FormAddAction } from "@/components/contacts/form/FormAddAction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RelationshipContextFormSectionProps = {
  collapsedSummary: string;
  firstMet: string;
  metThrough: string;
  metLocation: string;
  firstMetRegistration: UseFormRegisterReturn;
  metThroughRegistration: UseFormRegisterReturn;
  metLocationRegistration: UseFormRegisterReturn;
  errors: {
    firstMet?: string;
    metThrough?: string;
    metLocation?: string;
  };
};

export function RelationshipContextFormSection({
  collapsedSummary,
  firstMet,
  metThrough,
  metLocation,
  firstMetRegistration,
  metThroughRegistration,
  metLocationRegistration,
  errors,
}: RelationshipContextFormSectionProps) {
  const hasValues = [firstMet, metThrough, metLocation].some(
    (value) => value.trim().length > 0,
  );
  const hasErrors = Boolean(
    errors.firstMet || errors.metThrough || errors.metLocation,
  );
  const [isOpen, setIsOpen] = useState(hasValues || hasErrors);

  const collapsedContent = (
    <>
      <input type="hidden" {...firstMetRegistration} />
      <input type="hidden" {...metThroughRegistration} />
      <input type="hidden" {...metLocationRegistration} />
      <FormAddAction onClick={() => setIsOpen(true)}>
        Add relationship context
      </FormAddAction>
    </>
  );

  return (
    <ContactFormDisclosure
      title="Relationship context"
      description="How and where you crossed paths."
      icon={HeartHandshake}
      collapsedSummary={collapsedSummary}
      density="standard"
      open={isOpen}
      onOpenChange={setIsOpen}
      hasErrors={hasErrors}
      errorSummary="Check the highlighted relationship context fields."
      collapsedContent={!hasValues ? collapsedContent : undefined}
    >
      <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="first_met_on">First met</Label>
          <Input
            id="first_met_on"
            type="date"
            className="h-10"
            aria-describedby={
              errors.firstMet ? "first_met_on-error" : undefined
            }
            aria-invalid={Boolean(errors.firstMet)}
            {...firstMetRegistration}
          />
          {errors.firstMet && (
            <p id="first_met_on-error" className="text-sm text-destructive">
              {errors.firstMet}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="met_through">Met through</Label>
          <Input
            id="met_through"
            className="h-10"
            placeholder="University, Work, or Mutual friends"
            aria-describedby={
              errors.metThrough ? "met_through-error" : undefined
            }
            aria-invalid={Boolean(errors.metThrough)}
            {...metThroughRegistration}
          />
          {errors.metThrough && (
            <p id="met_through-error" className="text-sm text-destructive">
              {errors.metThrough}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-1.5 md:col-span-2 xl:col-span-1">
          <Label htmlFor="met_location">Met location</Label>
          <Input
            id="met_location"
            className="h-10"
            placeholder="Starkville, MS, a coffee shop, or Online"
            aria-describedby={
              errors.metLocation ? "met_location-error" : undefined
            }
            aria-invalid={Boolean(errors.metLocation)}
            {...metLocationRegistration}
          />
          {errors.metLocation && (
            <p id="met_location-error" className="text-sm text-destructive">
              {errors.metLocation}
            </p>
          )}
        </div>
      </div>
    </ContactFormDisclosure>
  );
}
