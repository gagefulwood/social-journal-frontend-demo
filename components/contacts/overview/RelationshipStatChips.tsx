import type { ReactNode } from "react";
import {
  Activity,
  HeartPulse,
  LayoutGrid,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { MetricChip } from "@/components/ui/metric-card";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RelationshipStatChipsProps = {
  model: ContactOverviewModel;
};

type SignalTone = "success" | "warning" | "info" | "muted";

export function RelationshipStatChips({ model }: RelationshipStatChipsProps) {
  const chips = [
    {
      label: model.connectionBand.label,
      eyebrow: "connection",
      tone: signalToneForOverviewTone(model.connectionBand.tone),
      icon: <HeartPulse />,
    },
    {
      label: model.trend.label,
      eyebrow: "rhythm",
      tone: model.trend.value === "growing" ? "success" : "muted",
      icon: <TrendingUp />,
    },
    {
      label: model.frequencyLabel,
      eyebrow: "lately",
      tone: model.frequencyLabel === "No rhythm yet" ? "muted" : "info",
      icon: <Activity />,
    },
    {
      label: model.sentiment.label,
      eyebrow: "mood",
      tone: model.sentiment.total > 0 ? "warning" : "muted",
      icon: <MessageCircle />,
    },
    {
      label: model.diversityLabel,
      eyebrow: "contexts",
      tone: "muted",
      icon: <LayoutGrid />,
    },
  ] satisfies Array<{
    label: string;
    eyebrow: string;
    tone: SignalTone;
    icon: ReactNode;
  }>;

  return (
    <div className="grid min-w-0 max-w-full gap-2.5 sm:grid-cols-2 2xl:grid-cols-5">
      {chips.map((chip) => (
        <MetricChip
          key={chip.eyebrow}
          label={chip.label}
          eyebrow={chip.eyebrow}
          tone={chip.tone}
          icon={chip.icon}
          layout="stacked"
          className="min-h-14"
        />
      ))}
    </div>
  );
}

function signalToneForOverviewTone(
  tone: ContactOverviewModel["connectionBand"]["tone"],
): SignalTone {
  if (tone === "positive") {
    return "success";
  }

  if (tone === "watch") {
    return "warning";
  }

  return "muted";
}
