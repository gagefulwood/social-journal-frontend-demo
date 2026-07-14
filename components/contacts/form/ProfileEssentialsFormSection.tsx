import { useId } from "react";
import { UserRound } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { ContactFormSection } from "@/components/contacts/form/ContactFormSection";
import { ContactFormSectionHeader } from "@/components/contacts/form/ContactFormSectionHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileEssentialsFieldErrors = {
  gender?: string;
  pronouns?: string;
  birthday?: string;
  timezone?: string;
};

type ProfileEssentialsFormSectionProps = {
  genderRegistration: UseFormRegisterReturn;
  pronounsRegistration: UseFormRegisterReturn;
  birthdayRegistration: UseFormRegisterReturn;
  timezoneRegistration: UseFormRegisterReturn;
  errors: ProfileEssentialsFieldErrors;
};

export function ProfileEssentialsFormSection({
  genderRegistration,
  pronounsRegistration,
  birthdayRegistration,
  timezoneRegistration,
  errors,
}: ProfileEssentialsFormSectionProps) {
  const sectionHeadingId = useId();

  return (
    <ContactFormSection density="compact" aria-labelledby={sectionHeadingId}>
      <ContactFormSectionHeader
        icon={UserRound}
        title="Profile essentials"
        description="Optional details shown on their profile."
        headingId={sectionHeadingId}
      />

      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="gender_identity">Gender</Label>
          <Input
            id="gender_identity"
            className="h-10"
            placeholder="e.g., Woman, Man, Nonbinary"
            aria-describedby={
              errors.gender ? "gender_identity-error" : undefined
            }
            aria-invalid={Boolean(errors.gender)}
            {...genderRegistration}
          />
          {errors.gender && (
            <p id="gender_identity-error" className="text-sm text-destructive">
              {errors.gender}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="pronouns">Pronouns</Label>
          <Input
            id="pronouns"
            className="h-10"
            placeholder="e.g., she/her, he/him, they/them"
            aria-describedby={errors.pronouns ? "pronouns-error" : undefined}
            aria-invalid={Boolean(errors.pronouns)}
            {...pronounsRegistration}
          />
          {errors.pronouns && (
            <p id="pronouns-error" className="text-sm text-destructive">
              {errors.pronouns}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <Label htmlFor="birth_date">Birthday</Label>
          <Input
            id="birth_date"
            type="date"
            className="mt-1.5 h-10"
            aria-describedby={
              errors.birthday
                ? "birth_date-help birth_date-error"
                : "birth_date-help"
            }
            aria-invalid={Boolean(errors.birthday)}
            {...birthdayRegistration}
          />
          <p
            id="birth_date-help"
            className="mt-1 text-xs leading-4 text-muted-foreground"
          >
            Age is calculated automatically.
          </p>
          {errors.birthday && (
            <p
              id="birth_date-error"
              className="mt-1.5 text-sm text-destructive"
            >
              {errors.birthday}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="timezone">Time zone</Label>
          <Input
            id="timezone"
            className="h-10"
            placeholder="e.g., America/Chicago"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={errors.timezone ? "timezone-error" : undefined}
            aria-invalid={Boolean(errors.timezone)}
            {...timezoneRegistration}
          />
          {errors.timezone && (
            <p id="timezone-error" className="text-sm text-destructive">
              {errors.timezone}
            </p>
          )}
        </div>
      </div>
    </ContactFormSection>
  );
}
