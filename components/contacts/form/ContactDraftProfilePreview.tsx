import { Fragment, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import { ContactFormSection } from "@/components/contacts/form/ContactFormSection";
import { ContactFormSectionHeader } from "@/components/contacts/form/ContactFormSectionHeader";
import type { ContactFormDraftPresentation } from "@/lib/presentation/contactFormDraftPresentation";
import type { MediaAssetListItem } from "@/types/media";

type ContactDraftProfilePreviewProps = {
  presentation: ContactFormDraftPresentation;
  profilePicture: MediaAssetListItem | null;
};

export function ContactDraftProfilePreview({
  presentation,
  profilePicture,
}: ContactDraftProfilePreviewProps) {
  const hasContact = Boolean(presentation.phone || presentation.email);
  const hasWorkEducation = Boolean(presentation.work || presentation.education);

  return (
    <ContactFormSection density="standard">
      <ContactFormSectionHeader icon={Eye} title="Live profile preview" />

      <div className="mt-4 min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-accent text-lg font-semibold text-accent-foreground shadow-sm">
            {profilePicture?.url ? (
              <div
                role="img"
                aria-label={
                  profilePicture.alt_text ||
                  presentation.displayName ||
                  "Selected profile photo"
                }
                className="size-full bg-cover bg-center"
                style={{ backgroundImage: `url(${profilePicture.url})` }}
              />
            ) : presentation.initials ? (
              <span>{presentation.initials}</span>
            ) : (
              <UserRound className="size-6" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0">
            <p
              className="break-words text-base leading-5 font-semibold [overflow-wrap:anywhere]"
              title={presentation.displayName ?? undefined}
            >
              {presentation.displayName || "Name will appear here"}
            </p>
            {presentation.relationshipLabel && (
              <p className="mt-1 break-words text-sm leading-5 text-muted-foreground [overflow-wrap:anywhere]">
                {presentation.relationshipLabel}
              </p>
            )}
          </div>
        </div>

        {presentation.isBlank ? (
          <p className="mt-4 text-sm leading-5 text-muted-foreground">
            Add a few details to see their profile take shape.
          </p>
        ) : (
          <>
            {(presentation.identityMetadata.length > 0 ||
              presentation.firstMetLabel) && (
              <div className="mt-4 grid min-w-0 gap-2 border-t border-border/70 pt-3 text-xs leading-4 text-muted-foreground">
                {presentation.identityMetadata.length > 0 && (
                  <PreviewLine icon={<UserRound aria-hidden="true" />}>
                    {presentation.identityMetadata.join(" · ")}
                  </PreviewLine>
                )}
                {presentation.firstMetLabel && (
                  <PreviewLine icon={<CalendarDays aria-hidden="true" />}>
                    First met {presentation.firstMetLabel}
                  </PreviewLine>
                )}
              </div>
            )}

            {hasContact && (
              <PreviewGroup title="Contact">
                {presentation.phone && (
                  <PreviewLine icon={<Phone aria-hidden="true" />}>
                    {presentation.phone}
                  </PreviewLine>
                )}
                {presentation.email && (
                  <PreviewLine icon={<Mail aria-hidden="true" />}>
                    <SoftWrappingText value={presentation.email} />
                  </PreviewLine>
                )}
              </PreviewGroup>
            )}

            {presentation.location && (
              <PreviewGroup title="Location">
                <PreviewLine icon={<MapPin aria-hidden="true" />}>
                  {presentation.location}
                </PreviewLine>
              </PreviewGroup>
            )}

            {hasWorkEducation && (
              <PreviewGroup title="Work & education">
                {presentation.work && (
                  <SummaryLine
                    icon={<BriefcaseBusiness aria-hidden="true" />}
                    title={presentation.work.title}
                    detail={presentation.work.detail}
                  />
                )}
                {presentation.education && (
                  <SummaryLine
                    icon={<GraduationCap aria-hidden="true" />}
                    title={presentation.education.title}
                    detail={presentation.education.detail}
                  />
                )}
              </PreviewGroup>
            )}
          </>
        )}
      </div>
    </ContactFormSection>
  );
}

function PreviewGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-4 min-w-0 border-t border-border/70 pt-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="mt-2 grid min-w-0 gap-2 text-sm leading-5">
        {children}
      </div>
    </section>
  );
}

function PreviewLine({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 size-4 shrink-0 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <span className="min-w-0 break-words [overflow-wrap:anywhere]">
        {children}
      </span>
    </div>
  );
}

function SummaryLine({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string | null;
}) {
  return (
    <PreviewLine icon={icon}>
      <span className="block font-medium">{title}</span>
      {detail && (
        <span className="block text-xs text-muted-foreground">{detail}</span>
      )}
    </PreviewLine>
  );
}

function SoftWrappingText({ value }: { value: string }) {
  return value.split(/([@.])/).map((part, index) => (
    <Fragment key={`${part}-${index}`}>
      {part}
      {(part === "@" || part === ".") && <wbr />}
    </Fragment>
  ));
}
