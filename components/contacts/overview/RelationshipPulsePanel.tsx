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
import { MetricChip } from "@/components/ui/metric-card";
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
  return (
    <SurfaceCard className="p-4">
      <SectionHeader
        title="Relationship Pulse"
        description="A quick read of your relationship signals from real moments."
      />

      <div className="mt-4 grid grid-cols-1 items-start gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <ConnectionGauge
          value={contact.connection_strength}
          summary={model.connectionBand.label}
        />
        <TrendSignal
          summary={model.trend.label}
          isGrowing={model.trend.tone === "positive"}
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
      hoverable
      data-pulse-micro-card
      className={cn(
        "flex min-w-0 flex-col gap-1.5 overflow-hidden rounded-lg p-2.5",
        "min-h-[7.75rem]",
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
          <p className="text-xs font-semibold leading-4 text-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-0.5 break-words text-[0.95rem] font-semibold leading-5",
              microMetricValueClasses[tone],
            )}
          >
            {value}
          </p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
      {detail && (
        <div className="min-w-0 text-[0.7rem] leading-4 text-muted-foreground">
          {detail}
        </div>
      )}
    </SurfaceCard>
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
  const accent = tokenColor("success-solid");

  return (
    <MicroMetricCard
      label="Connection"
      value={summary}
      tone="success"
      icon={<HeartPulse />}
      detail={<span className="text-xs leading-4">Room to grow</span>}
      className="bg-success-muted/10"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-16 rounded-full bg-success-muted/60 blur-xl" />
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
    </MicroMetricCard>
  );
}

function TrendSignal({
  summary,
  isGrowing,
}: {
  summary: string;
  isGrowing: boolean;
}) {
  const tone = isGrowing ? "success" : "muted";

  return (
    <MicroMetricCard
      label="Relationship Trend"
      value={summary}
      tone={tone}
      icon={<TrendingUp />}
      detail={
        <MetricChip
          label="Recorded pattern"
          tone={tone}
          className="max-w-full px-2 py-1 text-[0.68rem]"
        />
      }
    >
      <div className="flex items-center justify-center">
        <IconBadge
          tone={isGrowing ? "success" : "neutral"}
          shape="circle"
          size="md"
          className="size-8"
        >
          <TrendingUp className="size-4" />
        </IconBadge>
      </div>
    </MicroMetricCard>
  );
}

function FrequencyBars({ value, summary }: { value: number; summary: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const filledBars = Math.round((percent / 100) * 8);

  return (
    <MicroMetricCard
      label="Interaction Frequency"
      value={summary}
      tone={summary === "No rhythm yet" ? "muted" : "info"}
      icon={<Activity />}
      detail={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <MetricChip
            label="(30 days)"
            tone="info"
            className="px-2 py-1 text-[0.68rem]"
          />
          <span className="shrink-0 text-[0.68rem] text-muted-foreground">
            {percent}/100
          </span>
        </div>
      }
    >
      <div className="flex h-8 items-end justify-center gap-1">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 rounded-full bg-info-muted",
              index < filledBars && "bg-info-solid",
            )}
            style={{ height: `${8 + index * 2.5}px` }}
          />
        ))}
      </div>
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
      label="Interaction Diversity"
      value={summary}
      tone={percent > 0 ? "info" : "muted"}
      icon={<LayoutGrid />}
      detail={
        <span>{percent > 0 ? "Recorded contexts" : "Needs more context"}</span>
      }
    >
      <div>
        <p className="text-center text-lg font-semibold text-foreground">
          {percent}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            /100
          </span>
        </p>
        <div className="mx-auto mt-2 h-1.5 max-w-28 rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-info-solid"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </MicroMetricCard>
  );
}

function SentimentMeter({ model }: { model: ContactOverviewModel }) {
  const { moods } = useLookups();
  const tone = sentimentMetricTone(model);

  return (
    <MicroMetricCard
      label="Sentiment Balance"
      value={model.sentiment.label}
      tone={tone}
      icon={<MessageCircle />}
      detail={
        model.sentiment.parts.length > 0
          ? <span className="text-xs leading-4">{model.sentiment.detail}</span>
          : (
              <span className="text-xs leading-4">
                No mood data yet.
              </span>
            )
      }
    >
      {model.sentiment.parts.length > 0 ? (
        <div className="mx-auto mt-1 flex h-3.5 max-w-28 items-center rounded-full bg-muted px-1">
          {model.sentiment.parts.map((part) => (
            <div
              key={part.label}
              className={cn(
                "h-2 rounded-full",
                moodSegmentColorClass(part.label, moods),
              )}
              style={{ width: `${part.percent}%` }}
              title={`${part.label}: ${part.count}`}
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-1 h-3.5 max-w-28 rounded-full bg-muted" />
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
