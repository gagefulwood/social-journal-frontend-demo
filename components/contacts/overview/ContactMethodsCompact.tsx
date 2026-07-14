import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ContactMethodsCompactProps = {
  email?: string;
  phoneNumber?: string;
};

export function ContactMethodsCompact({
  email,
  phoneNumber,
}: ContactMethodsCompactProps) {
  if (!email && !phoneNumber) {
    return (
      <EmptyActionBox
        icon={
          <IconBadge tone="neutral" size="sm" className="shadow-none">
            <Mail className="size-4" />
          </IconBadge>
        }
        title="No contact methods yet"
        copy="Use the contact actions menu, then Edit contact, to add contact info."
        className="text-left"
      />
    );
  }

  const methods = [
    {
      label: "Email",
      href: email ? `mailto:${email}` : null,
      disabledLabel: "Email address not set",
      icon: <Mail className="size-4 shrink-0" />,
    },
    {
      label: "Call",
      href: phoneNumber ? `tel:${phoneNumber}` : null,
      disabledLabel: "Phone number not set",
      icon: <Phone className="size-4 shrink-0" />,
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid w-full grid-cols-2 gap-2">
        {methods.map((method) =>
          method.href ? (
            <Button
              key={method.label}
              asChild
              variant="outline"
              className="h-10 min-w-0 bg-background/80 text-primary-strong"
            >
              <a href={method.href} aria-label={method.label}>
                {method.icon}
                <span>{method.label}</span>
              </a>
            </Button>
          ) : (
            <Tooltip key={method.label}>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex w-full cursor-not-allowed rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  role="button"
                  tabIndex={0}
                  aria-label={method.disabledLabel}
                  aria-disabled="true"
                >
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className={cn(
                      "h-10 w-full border-dashed bg-background/60 text-muted-foreground opacity-45",
                    )}
                    aria-hidden="true"
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{method.disabledLabel}</TooltipContent>
            </Tooltip>
          ),
        )}
      </div>
    </TooltipProvider>
  );
}
