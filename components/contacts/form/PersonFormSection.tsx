"use client";

import { useId, useState } from "react";
import { Plus, UserRound } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ProfilePictureSelector } from "@/components/contacts/ProfilePictureSelector";
import { ContactFormSection } from "@/components/contacts/form/ContactFormSection";
import { ContactFormSectionHeader } from "@/components/contacts/form/ContactFormSectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Relation } from "@/types/lookups";
import type { MediaAssetListItem } from "@/types/media";

type PersonFieldErrors = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  relationship?: string;
  photo?: string;
};

type PersonFormSectionProps = {
  currentPhoto?: MediaAssetListItem | null;
  fallbackInitials: string;
  onPhotoChange: (
    mediaId: string | number | null,
    asset?: MediaAssetListItem | null,
  ) => void;
  firstNameRegistration: UseFormRegisterReturn;
  middleNameRegistration: UseFormRegisterReturn;
  lastNameRegistration: UseFormRegisterReturn;
  preferredNameRegistration: UseFormRegisterReturn;
  relationshipRegistration: UseFormRegisterReturn;
  relationships: Relation[];
  isLoadingRelationships: boolean;
  showMiddleNameInitially: boolean;
  errors: PersonFieldErrors;
};

const relationshipSelectClassName =
  "h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

export function PersonFormSection({
  currentPhoto,
  fallbackInitials,
  onPhotoChange,
  firstNameRegistration,
  middleNameRegistration,
  lastNameRegistration,
  preferredNameRegistration,
  relationshipRegistration,
  relationships,
  isLoadingRelationships,
  showMiddleNameInitially,
  errors,
}: PersonFormSectionProps) {
  const sectionHeadingId = useId();
  const middleNameRegionId = useId();
  const [isMiddleNameOpen, setIsMiddleNameOpen] = useState(
    showMiddleNameInitially,
  );
  const showMiddleName = isMiddleNameOpen || Boolean(errors.middleName);

  return (
    <ContactFormSection density="standard" aria-labelledby={sectionHeadingId}>
      <ContactFormSectionHeader
        icon={UserRound}
        title="Person"
        description="Who they are and how you know them."
        headingId={sectionHeadingId}
      />

      <div className="mt-3.5 grid min-w-0 items-start gap-4 md:grid-cols-[8rem_minmax(0,1fr)]">
        <div className="flex min-w-0 justify-center md:w-32">
          <ProfilePictureSelector
            current={currentPhoto}
            error={errors.photo}
            fallbackInitials={fallbackInitials}
            onChange={onPhotoChange}
          />
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="first_name">
              First name
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">required</span>
            </Label>
            <Input
              id="first_name"
              className="h-10"
              placeholder="Enter first name"
              required
              aria-describedby={
                errors.firstName ? "first_name-error" : undefined
              }
              aria-invalid={Boolean(errors.firstName)}
              {...firstNameRegistration}
            />
            {errors.firstName && (
              <p id="first_name-error" className="text-sm text-destructive">
                {errors.firstName}
              </p>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="last_name">
              Last name
              <span className="text-destructive" aria-hidden="true">
                *
              </span>
              <span className="sr-only">required</span>
            </Label>
            <Input
              id="last_name"
              className="h-10"
              placeholder="Enter last name"
              required
              aria-describedby={errors.lastName ? "last_name-error" : undefined}
              aria-invalid={Boolean(errors.lastName)}
              {...lastNameRegistration}
            />
            {errors.lastName && (
              <p id="last_name-error" className="text-sm text-destructive">
                {errors.lastName}
              </p>
            )}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="relation">Relationship</Label>
            <select
              id="relation"
              className={relationshipSelectClassName}
              disabled={isLoadingRelationships}
              aria-describedby={
                errors.relationship ? "relation-error" : undefined
              }
              aria-invalid={Boolean(errors.relationship)}
              {...relationshipRegistration}
            >
              <option value="">
                {isLoadingRelationships
                  ? "Loading relationships..."
                  : "No relationship"}
              </option>
              {relationships.map((relationship) => (
                <option key={relationship.id} value={String(relationship.id)}>
                  {relationship.name}
                </option>
              ))}
            </select>
            {errors.relationship && (
              <p id="relation-error" className="text-sm text-destructive">
                {errors.relationship}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <Label htmlFor="preferred_name">Preferred name</Label>
            <Input
              id="preferred_name"
              className="mt-1.5 h-10"
              placeholder="What you call them"
              aria-describedby={
                errors.preferredName
                  ? "preferred_name-help preferred_name-error"
                  : "preferred_name-help"
              }
              aria-invalid={Boolean(errors.preferredName)}
              {...preferredNameRegistration}
            />
            <p
              id="preferred_name-help"
              className="mt-1 text-xs leading-4 text-muted-foreground"
            >
              How you usually call them (optional).
            </p>
            {errors.preferredName && (
              <p
                id="preferred_name-error"
                className="mt-1.5 text-sm text-destructive"
              >
                {errors.preferredName}
              </p>
            )}
          </div>

          <div className="min-w-0">
            {!showMiddleName && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded="false"
                aria-controls={middleNameRegionId}
                className="-ml-2 text-muted-foreground"
                onClick={() => setIsMiddleNameOpen(true)}
              >
                <Plus aria-hidden="true" />
                Add middle name
              </Button>
            )}

            {showMiddleName && (
              <div className="flex min-w-0 items-center justify-between gap-2">
                <Label htmlFor="middle_name">Middle name</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  aria-expanded="true"
                  aria-controls={middleNameRegionId}
                  className="text-muted-foreground"
                  onClick={() => setIsMiddleNameOpen(false)}
                >
                  Hide
                </Button>
              </div>
            )}
            <div id={middleNameRegionId} hidden={!showMiddleName}>
              <Input
                id="middle_name"
                className="mt-1.5 h-10"
                placeholder="Enter middle name"
                aria-describedby={
                  errors.middleName ? "middle_name-error" : undefined
                }
                aria-invalid={Boolean(errors.middleName)}
                {...middleNameRegistration}
              />
              {errors.middleName && (
                <p
                  id="middle_name-error"
                  className="mt-1.5 text-sm text-destructive"
                >
                  {errors.middleName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContactFormSection>
  );
}
