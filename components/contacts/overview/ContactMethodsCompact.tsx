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
        copy="Use More details to edit contact info."
        className="text-left"
      />
    );
  }

  const methods = [
    {
      label: "Email",
      href: email ? `mailto:${email}` : null,
      disabledLabel: "Email address not set",
      icon: <Mail className="size-4" />,
    },
    {
      label: "Call",
      href: phoneNumber ? `tel:${phoneNumber}` : null,
      disabledLabel: "Phone number not set",
      icon: <Phone className="size-4" />,
    },
  ];

  return (
    <TooltipProvider>
      <div className="mx-auto grid w-full max-w-36 grid-cols-2 justify-items-center gap-3">
        {methods.map((method) =>
          method.href ? (
            <Button
              key={method.label}
              asChild
              variant="outline"
              size="icon"
              className="size-14 bg-background/80 text-primary-strong transition-all hover:-translate-y-0.5 hover:border-border hover:bg-muted/20 hover:shadow-sm active:translate-y-0 motion-reduce:hover:translate-y-0"
            >
              <a href={method.href} aria-label={method.label}>
                {method.icon}
              </a>
            </Button>
          ) : (
            <Tooltip key={method.label}>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex cursor-not-allowed rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  role="button"
                  tabIndex={0}
                  aria-label={method.disabledLabel}
                  aria-disabled="true"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled
                    className={cn(
                      "size-14 border-dashed bg-background/60 text-muted-foreground opacity-45",
                    )}
                    aria-hidden="true"
                  >
                    {method.icon}
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
