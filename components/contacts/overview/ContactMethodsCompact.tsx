import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContactMethodsCompactProps = {
  email?: string;
  phoneNumber?: string;
};

export function ContactMethodsCompact({
  email,
  phoneNumber,
}: ContactMethodsCompactProps) {
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
    <div className="mx-auto grid w-full max-w-36 grid-cols-2 justify-items-center gap-3">
      {methods.map((method) =>
        method.href ? (
          <Button
            key={method.label}
            asChild
            variant="outline"
            size="icon"
            className="size-14 bg-background/80 text-primary-strong transition-all hover:-translate-y-0.5 hover:border-border hover:bg-muted/30 hover:shadow-sm active:translate-y-0 motion-reduce:hover:translate-y-0"
          >
            <a href={method.href} aria-label={method.label}>
              {method.icon}
            </a>
          </Button>
        ) : (
          <Button
            key={method.label}
            type="button"
            variant="outline"
            size="icon"
            disabled
            className={cn(
              "size-14 border-dashed bg-background/60 text-muted-foreground opacity-45",
            )}
            aria-label={method.disabledLabel}
          >
            {method.icon}
          </Button>
        ),
      )}
    </div>
  );
}
