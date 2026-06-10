import { Mail, MessageCircle, Phone } from "lucide-react";
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
      icon: <Mail className="size-4" />,
    },
    {
      label: "Call",
      href: phoneNumber ? `tel:${phoneNumber}` : null,
      icon: <Phone className="size-4" />,
    },
    {
      label: "Message",
      href: phoneNumber ? `sms:${phoneNumber}` : null,
      icon: <MessageCircle className="size-4" />,
    },
  ];

  return (
    <div className="mx-auto grid w-full max-w-56 grid-cols-3 justify-items-center gap-3">
      {methods.map((method) =>
        method.href ? (
          <Button
            key={method.label}
            asChild
            variant="outline"
            size="icon"
            title={method.label}
            className="size-14 bg-background/80"
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
            title={`${method.label} not set`}
            className={cn("size-14 bg-background/80 opacity-40")}
            aria-label={`${method.label} not set`}
          >
            {method.icon}
          </Button>
        ),
      )}
    </div>
  );
}
