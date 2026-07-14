import { AlertCircle, CheckCircle2, Circle, ListChecks } from "lucide-react";

import { ContactFormSection } from "@/components/contacts/form/ContactFormSection";
import { ContactFormSectionHeader } from "@/components/contacts/form/ContactFormSectionHeader";
import { cn } from "@/lib/utils";
import type {
  ContactFormProgressItem,
  ContactFormProgressStatus,
} from "@/lib/presentation/contactFormDraftPresentation";

type ContactFormProfileProgressProps = {
  items: ContactFormProgressItem[];
};

export function ContactFormProfileProgress({
  items,
}: ContactFormProfileProgressProps) {
  return (
    <ContactFormSection density="compact">
      <ContactFormSectionHeader icon={ListChecks} title="Profile progress" />

      <div className="mt-3 divide-y divide-border/70">
        {items.map((item) => (
          <ProgressRow key={item.key} item={item} />
        ))}
      </div>
    </ContactFormSection>
  );
}

function ProgressRow({ item }: { item: ContactFormProgressItem }) {
  const StatusIcon = statusIcons[item.status];

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="min-w-0 break-words text-sm leading-5 font-medium [overflow-wrap:anywhere]">
        {item.label}
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center gap-1.5 text-xs leading-4",
          statusClasses[item.status],
        )}
        aria-label={`${item.label}: ${item.statusLabel}`}
      >
        <StatusIcon className="size-3.5" aria-hidden="true" />
        {item.statusLabel}
      </span>
    </div>
  );
}

const statusIcons: Record<ContactFormProgressStatus, typeof Circle> = {
  ready: CheckCircle2,
  added: CheckCircle2,
  optional: Circle,
  needsAttention: AlertCircle,
};

const statusClasses: Record<ContactFormProgressStatus, string> = {
  ready: "text-success",
  added: "text-success",
  optional: "text-muted-foreground",
  needsAttention: "text-destructive",
};
