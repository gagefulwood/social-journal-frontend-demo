"use client";

import { useState, type ReactNode } from "react";
import { BriefcaseBusiness } from "lucide-react";

import { ContactFormDisclosure } from "@/components/contacts/form/ContactFormDisclosure";
import { FormAddAction } from "@/components/contacts/form/FormAddAction";

type WorkEducationFormSectionProps = {
  collapsedSummary: string;
  hasWorkDetails: boolean;
  hasEducationDetails: boolean;
  hasWorkErrors?: boolean;
  hasEducationErrors?: boolean;
  onAddWork: () => void;
  onAddEducation: () => void;
  children: ReactNode;
};

export function WorkEducationFormSection({
  collapsedSummary,
  hasWorkDetails,
  hasEducationDetails,
  hasWorkErrors = false,
  hasEducationErrors = false,
  onAddWork,
  onAddEducation,
  children,
}: WorkEducationFormSectionProps) {
  const hasErrors = hasWorkErrors || hasEducationErrors;
  const [isOpen, setIsOpen] = useState(
    hasWorkDetails || hasEducationDetails || hasErrors,
  );

  function addWork() {
    setIsOpen(true);
    onAddWork();
  }

  function addEducation() {
    setIsOpen(true);
    onAddEducation();
  }

  const collapsedContent =
    !hasWorkDetails && !hasEducationDetails ? (
      <div className="flex min-w-0 flex-wrap gap-2">
        <FormAddAction onClick={addWork}>Add work</FormAddAction>
        <FormAddAction onClick={addEducation}>Add education</FormAddAction>
      </div>
    ) : undefined;

  return (
    <ContactFormDisclosure
      title="Work & education"
      description="Add a job, school, or both."
      icon={BriefcaseBusiness}
      collapsedSummary={collapsedSummary}
      open={isOpen}
      onOpenChange={setIsOpen}
      hasErrors={hasErrors}
      errorSummary="Check the highlighted work or education fields."
      collapsedContent={collapsedContent}
    >
      <div className="grid min-w-0 gap-4 divide-y divide-border/70">
        {children}
      </div>
    </ContactFormDisclosure>
  );
}
