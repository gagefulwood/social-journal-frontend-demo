import { Activity, HeartPulse, MessageCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ContactOverviewModel,
  OverviewTone,
} from "./contact-overview-utils";

type RelationshipStatChipsProps = {
  model: ContactOverviewModel;
};

const toneClasses: Record<OverviewTone, string> = {
  positive: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
  neutral: "border-sky-100 bg-sky-50/80 text-sky-800",
  watch: "border-amber-100 bg-amber-50/80 text-amber-800",
  muted: "border-violet-100 bg-violet-50/80 text-violet-800",
};

const iconToneClasses: Record<OverviewTone, string> = {
  positive: "bg-emerald-100 text-emerald-700",
  neutral: "bg-sky-100 text-sky-700",
  watch: "bg-amber-100 text-amber-700",
  muted: "bg-violet-100 text-violet-700",
};

export function RelationshipStatChips({ model }: RelationshipStatChipsProps) {
  const chips = [
    {
      label: model.connectionBand.label,
      eyebrow: "Connection",
      tone: model.connectionBand.tone,
      icon: <HeartPulse className="size-5" />,
    },
    {
      label: model.trend.label,
      eyebrow: model.trend.eyebrow,
      tone: model.trend.tone,
      icon: <TrendingUp className="size-5" />,
    },
    {
      label: model.sentiment.label,
      eyebrow: "Mood",
      tone: model.sentiment.tone,
      icon: <MessageCircle className="size-5" />,
    },
    {
      label: model.frequencyLabel,
      eyebrow: "Frequency",
      tone: model.frequencyLabel === "No rhythm yet" ? "muted" : "neutral",
      icon: <Activity className="size-5" />,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {chips.map((chip) => (
        <div
          key={chip.eyebrow}
          className={cn(
            "flex min-h-20 items-center gap-3 rounded-lg border px-4 py-3 shadow-sm",
            toneClasses[chip.tone],
          )}
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              iconToneClasses[chip.tone],
            )}
          >
            {chip.icon}
          </span>
          <div>
            <p className="text-base font-semibold leading-none">{chip.label}</p>
            <p className="mt-1 text-xs font-medium leading-none opacity-75">
              {chip.eyebrow}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
