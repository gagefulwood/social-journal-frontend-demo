"use client";

import type { ReactNode } from "react";
import {
  Activity,
  HeartPulse,
  LayoutGrid,
  Lightbulb,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contacts";
import type { Mood } from "@/types/lookups";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RelationshipPulsePanelProps = {
  contact: Contact;
  model: ContactOverviewModel;
};

type MicroMetricTone = "success" | "info" | "warning" | "muted";

type MicroMetricCardProps = {
  label: string;
  value: string;
  tone: MicroMetricTone;
  icon: ReactNode;
  children: ReactNode;
  detail?: ReactNode;
  className?: string;
};

const microMetricValueClasses: Record<MicroMetricTone, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  muted: "text-muted-foreground",
};

const microMetricBorderClasses: Record<MicroMetricTone, string> = {
  success: "border-success-muted",
  info: "border-border/80",
  warning: "border-border/80",
  muted: "border-border/80",
};

export function RelationshipPulsePanel({
  contact,
  model,
}: RelationshipPulsePanelProps) {
  const hasRecordedMoments = model.relationshipSnapshot.eventCount > 0;

  return (
    <SurfaceCard className="p-3 sm:p-4">
      <SectionHeader
        title="Pulse Details"
        description="A quick read of your relationship signals."
        icon={
          <IconBadge tone="accent" size="lg" shape="circle">
            <Activity className="size-5" />
          </IconBadge>
        }
      />

      <div className="mt-4 flex snap-x gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-5">
        <ConnectionGauge
          value={contact.connection_strength}
          summary={model.connectionBand.label}
        />
        <TrendSignal
          summary={model.trend.label}
          isGrowing={model.trend.tone === "positive"}
          hasRecordedMoments={hasRecordedMoments}
        />
        <FrequencyBars
          value={contact.interaction_frequency_score}
          summary={model.frequencyLabel}
        />
        <DiversityScore
          value={contact.interaction_diversity_score}
          summary={model.diversityLabel}
        />
        <SentimentMeter model={model} />
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs leading-4 text-muted-foreground">
        <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
        <p>Signals reflect recorded moments only.</p>
      </div>
    </SurfaceCard>
  );
}

function MicroMetricCard({
  label,
  value,
  tone,
  icon,
  children,
  detail,
  className,
}: MicroMetricCardProps) {
  return (
    <SurfaceCard
      data-pulse-micro-card
      className={cn(
        "flex h-full min-w-0 flex-col gap-2 overflow-hidden rounded-lg p-2.5",
        "min-h-[8rem] min-w-[11rem] snap-start sm:min-w-0 lg:min-h-[8rem]",
        microMetricBorderClasses[tone],
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <IconBadge
          tone={tone === "muted" ? "neutral" : tone}
          shape="circle"
          size="sm"
          className="size-7 shadow-sm [&_svg]:size-3.5"
        >
          {icon}
        </IconBadge>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-5 text-foreground">
            {label}
          </p>
          <p
            className={cn(
              "break-words text-sm font-semibold leading-5",
              microMetricValueClasses[tone],
            )}
          >
            {value}
          </p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
      {detail && (
        <div className="mt-auto min-w-0 text-xs leading-4 text-muted-foreground">
          {detail}
        </div>
      )}
    </SurfaceCard>
  );
}

function PulseGraphicFrame({ children }: { children: ReactNode }) {
  return (
    <div data-pulse-graphic className="flex h-14 min-w-0 items-center justify-center">
      {children}
    </div>
  );
}

function ConnectionGauge({
  value,
  summary,
}: {
  value: number;
  summary: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const hasSignal = percent > 0;
  const accent = tokenColor("success-solid");

  return (
    <MicroMetricCard
      label="Connection"
      value={summary}
      tone={hasSignal ? "success" : "muted"}
      icon={<HeartPulse />}
      detail={
        <span className="text-xs leading-4">
          {hasSignal ? "Room to grow" : "Needs recorded moments"}
        </span>
      }
    >
      <PulseGraphicFrame>
        <div className="relative flex items-center justify-center">
        <div className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-muted shadow-sm ring-3 ring-background">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${accent} ${percent * 3.6}deg, var(--muted) 0deg)`,
            }}
          />
          <div className="relative flex size-9 flex-col items-center justify-center rounded-full bg-card shadow-sm">
            <span className="text-base font-semibold leading-none text-foreground">
              {percent}
            </span>
            <span className="text-[0.65rem] leading-none text-muted-foreground">
              /100
            </span>
          </div>
        </div>
        </div>
      </PulseGraphicFrame>
    </MicroMetricCard>
  );
}

function TrendSignal({
  summary,
  isGrowing,
  hasRecordedMoments,
}: {
  summary: string;
  isGrowing: boolean;
  hasRecordedMoments: boolean;
}) {
  const tone = isGrowing ? "success" : "muted";

  return (
    <MicroMetricCard
      label="Trend"
      value={summary}
      tone={tone}
      icon={<TrendingUp />}
      detail={hasRecordedMoments ? "Recorded pattern" : "No pattern yet"}
    >
      <PulseGraphicFrame>
        <IconBadge
          tone={isGrowing ? "success" : "neutral"}
          shape="circle"
          size="md"
          className="size-10 [&_svg]:size-4"
        >
          <TrendingUp />
        </IconBadge>
      </PulseGraphicFrame>
    </MicroMetricCard>
  );
}

function FrequencyBars({ value, summary }: { value: number; summary: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const filledBars = Math.round((percent / 100) * 8);
  const hasSignal = percent > 0;

  return (
    <MicroMetricCard
      label="Frequency"
      value={summary}
      tone={summary === "No rhythm yet" ? "muted" : "info"}
      icon={<Activity />}
      detail={
        hasSignal ? `(30 days) · ${percent}/100` : "No recent moments"
      }
    >
      <PulseGraphicFrame>
        <div className="flex h-9 items-end justify-center gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 rounded-full bg-muted",
              hasSignal && "bg-info-muted",
              hasSignal && index < filledBars && "bg-info-solid",
            )}
            style={{ height: `${8 + index * 3}px` }}
          />
        ))}
        </div>
      </PulseGraphicFrame>
    </MicroMetricCard>
  );
}

function DiversityScore({
  value,
  summary,
}: {
  value: number;
  summary: string;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <MicroMetricCard
      label="Diversity"
      value={summary}
      tone={percent > 0 ? "info" : "muted"}
      icon={<LayoutGrid />}
      detail={
        <span>{percent > 0 ? "Recorded contexts" : "Needs more context"}</span>
      }
    >
      <PulseGraphicFrame>
        <div className="w-full">
        <p className="text-center text-xl font-semibold leading-none text-foreground">
          {percent}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            /100
          </span>
        </p>
        <div className="mx-auto mt-2 h-1.5 max-w-24 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-info-solid"
            style={{ width: `${percent}%` }}
          />
        </div>
        </div>
      </PulseGraphicFrame>
    </MicroMetricCard>
  );
}

function SentimentMeter({ model }: { model: ContactOverviewModel }) {
  const { moods } = useLookups();
  const tone = sentimentMetricTone(model);

  return (
    <MicroMetricCard
      label="Sentiment"
      value={model.sentiment.label}
      tone={tone}
      icon={<MessageCircle />}
      detail={
        model.sentiment.parts.length > 0
          ? `${model.sentiment.total} mood signals`
          : (
              <span className="text-xs leading-4">
                No mood data yet.
              </span>
            )
      }
    >
      {model.sentiment.parts.length > 0 ? (
        <PulseGraphicFrame>
          <div className="mx-auto flex h-5 w-full max-w-28 items-center rounded-full bg-muted px-1">
          {model.sentiment.parts.map((part) => (
            <div
              key={part.label}
              className={cn(
                "h-2.5 rounded-full",
                moodSegmentColorClass(part.label, moods),
              )}
              style={{ width: `${part.percent}%` }}
              title={`${part.label}: ${part.count}`}
            />
          ))}
          </div>
        </PulseGraphicFrame>
      ) : (
        <PulseGraphicFrame>
          <div className="mx-auto h-5 w-full max-w-28 rounded-full bg-muted" />
        </PulseGraphicFrame>
      )}
    </MicroMetricCard>
  );
}

function sentimentMetricTone(
  model: ContactOverviewModel,
): "success" | "warning" | "muted" {
  if (model.sentiment.total === 0) {
    return "muted";
  }

  if (model.sentiment.tone === "positive") {
    return "success";
  }

  if (model.sentiment.label === "No mood signal") {
    return "muted";
  }

  return "warning";
}

type MoodSegmentColorClass =
  | "bg-mood-happy"
  | "bg-mood-content"
  | "bg-mood-neutral"
  | "bg-mood-anxious"
  | "bg-mood-sad"
  | "bg-mood-angry";

const namedMoodSegmentColors: Record<string, MoodSegmentColorClass> = {
  angry: "bg-mood-angry",
  anxious: "bg-mood-anxious",
  content: "bg-mood-content",
  happy: "bg-mood-happy",
  neutral: "bg-mood-neutral",
  sad: "bg-mood-sad",
};

const fallbackMoodSegmentColors: MoodSegmentColorClass[] = [
  "bg-mood-happy",
  "bg-mood-content",
  "bg-mood-neutral",
  "bg-mood-anxious",
  "bg-mood-sad",
  "bg-mood-angry",
];

function moodSegmentColorClass(
  label: string,
  moods: Mood[],
): MoodSegmentColorClass {
  const normalizedLabel = normalizeMoodKey(label);
  const namedColor = namedMoodSegmentColors[normalizedLabel];

  if (namedColor) {
    return namedColor;
  }

  const lookupMood = moods.find(
    (mood) => normalizeMoodKey(mood.name) === normalizedLabel,
  );
  const fallbackSeed = lookupMood
    ? `${lookupMood.name}:${lookupMood.polarity}`
    : label;

  return fallbackMoodSegmentColors[
    stableHash(fallbackSeed) % fallbackMoodSegmentColors.length
  ];
}

function normalizeMoodKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

function stableHash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function tokenColor(token: "success-solid"): string {
  return `var(--${token})`;
}
