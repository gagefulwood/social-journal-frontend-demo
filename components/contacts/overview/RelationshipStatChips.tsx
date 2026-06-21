import type { ReactNode } from "react";
import { Activity, HeartPulse, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RelationshipStatChipsProps = {
  model: ContactOverviewModel;
};

type SignalTone = "success" | "warning" | "info" | "muted";

const toneClasses: Record<SignalTone, string> = {
  success: "border-success-muted bg-success-muted text-success",
  warning: "border-warning-muted bg-warning-muted text-warning",
  info: "border-info-muted bg-info-muted text-info",
  muted: "border-border bg-muted text-muted-foreground",
};

const iconToneClasses: Record<SignalTone, string> = {
  success: "bg-background/70 text-success",
  warning: "bg-background/70 text-warning",
  info: "bg-background/70 text-info",
  muted: "bg-background/70 text-muted-foreground",
};

export function RelationshipStatChips({ model }: RelationshipStatChipsProps) {
  const chips = [
    {
      label: model.connectionBand.label,
      eyebrow: "Connection",
      tone: "success",
      icon: <HeartPulse className="size-5" />,
    },
    {
      label: model.trend.label,
      eyebrow: model.trend.eyebrow,
      tone: model.trend.value === "growing" ? "success" : "muted",
      icon: <TrendingUp className="size-5" />,
    },
    {
      label: model.sentiment.label,
      eyebrow: "Mood",
      tone: model.sentiment.total > 0 ? "warning" : "muted",
      icon: <MessageCircle className="size-5" />,
    },
    {
      label: model.frequencyLabel,
      eyebrow: "Frequency",
      tone: model.frequencyLabel === "No rhythm yet" ? "muted" : "info",
      icon: <Activity className="size-5" />,
    },
  ] satisfies Array<{
    label: string;
    eyebrow: string;
    tone: SignalTone;
    icon: ReactNode;
  }>;

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-4">
      {chips.map((chip) => (
        <div
          key={chip.eyebrow}
          className={cn(
            "flex min-h-16 cursor-default items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left shadow-sm transition-all duration-200",
            "hover:-translate-y-0.5 hover:border-current hover:shadow-md motion-reduce:hover:translate-y-0",
            toneClasses[chip.tone],
          )}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors [&_svg]:size-4",
              iconToneClasses[chip.tone],
            )}
          >
            {chip.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-none">
              {chip.label}
            </p>
            <p className="mt-1 text-[0.7rem] font-medium leading-none opacity-75">
              {chip.eyebrow}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
