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
import { ContactSectionCard } from "@/components/contacts/surfaces/ContactSectionCard";
import { ContactSectionHeader } from "@/components/contacts/surfaces/ContactSectionHeader";
import { IconBadge } from "@/components/ui/icon-badge";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Contact, RelationshipTrend } from "@/types/contacts";
import type { Mood } from "@/types/lookups";
import type { ContactOverviewModel } from "./contact-overview-utils";

type RelationshipPulsePanelProps = {
  contact: Contact;
  model: ContactOverviewModel;
  variant?: "content" | "rail";
};

type PulseLayout = NonNullable<RelationshipPulsePanelProps["variant"]>;

type MicroMetricTone = "success" | "info" | "warning" | "muted";

type MicroMetricCardProps = {
  label: string;
  value: string;
  tone: MicroMetricTone;
  icon: ReactNode;
  children: ReactNode;
  detail?: ReactNode;
  className?: string;
  layout: PulseLayout;
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
  variant = "content",
}: RelationshipPulsePanelProps) {
  const hasRecordedMoments = model.relationshipSnapshot.eventCount > 0;
  const isRail = variant === "rail";

  return (
    <ContactSectionCard
      asChild
      density={isRail ? "compact" : "standard"}
      className={cn(
        isRail
          ? "xl:flex xl:h-full xl:min-h-0 xl:flex-col"
          : "xl:flex xl:flex-1 xl:flex-col",
      )}
    >
      <section aria-labelledby="overview-relationship-pulse-title">
        <ContactSectionHeader
          headingId="overview-relationship-pulse-title"
          title="Relationship pulse"
          subtitle="A quick read of your relationship signals."
          icon={Activity}
          iconTone="violet"
        />

        <div
          className={cn(
            "mt-4 grid grid-cols-2 items-stretch gap-2 [&>*:last-child]:col-span-2",
            isRail
              ? "xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:justify-between xl:gap-4 xl:divide-y xl:divide-border xl:[&>*:last-child]:col-span-1"
              : "xl:grid-cols-5 xl:[&>*:last-child]:col-span-1",
          )}
        >
          <ConnectionGauge
            value={contact.connection_strength}
            summary={model.connectionBand.label}
            layout={variant}
          />
          <TrendSignal
            summary={model.trend.label}
            trend={model.trend.value}
            hasRecordedMoments={hasRecordedMoments}
            layout={variant}
          />
          <FrequencyBars
            value={contact.interaction_frequency_score}
            summary={model.frequencyLabel}
            layout={variant}
          />
          <DiversityScore
            value={contact.interaction_diversity_score}
            summary={model.diversityLabel}
            layout={variant}
          />
          <SentimentMeter model={model} layout={variant} />
        </div>

        <div
          className={cn(
            "mt-3 flex items-start gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs leading-4 text-muted-foreground",
            !isRail && "xl:mt-auto",
            isRail && "xl:mt-4 xl:shrink-0",
          )}
        >
          <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
          <p>Signals reflect recorded moments only.</p>
        </div>
      </section>
    </ContactSectionCard>
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
  layout,
}: MicroMetricCardProps) {
  const isRail = layout === "rail";

  return (
    <SurfaceCard
      data-pulse-micro-card
      className={cn(
        "flex h-full min-w-0 flex-col gap-2 overflow-hidden rounded-lg p-2.5",
        microMetricBorderClasses[tone],
        isRail &&
          "xl:grid xl:h-auto xl:shrink-0 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-x-3 xl:gap-y-1 xl:rounded-none xl:border-0 xl:bg-transparent xl:px-0 xl:py-4 xl:shadow-none",
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
              "break-words text-sm font-semibold leading-5 [overflow-wrap:anywhere]",
              microMetricValueClasses[tone],
            )}
          >
            {value}
          </p>
        </div>
      </div>
      <div className={cn("min-w-0", isRail && "xl:col-start-2 xl:row-span-2")}>
        {children}
      </div>
      {detail && (
        <div
          className={cn(
            "mt-auto min-w-0 text-xs leading-4 text-muted-foreground",
            isRail && "xl:col-start-1 xl:mt-0",
          )}
        >
          {detail}
        </div>
      )}
    </SurfaceCard>
  );
}

function PulseGraphicFrame({
  children,
  layout,
}: {
  children: ReactNode;
  layout: PulseLayout;
}) {
  return (
    <div
      data-pulse-graphic
      className={cn(
        "flex h-14 min-w-0 items-center justify-center",
        layout === "rail" && "xl:w-24 xl:shrink-0",
      )}
    >
      {children}
    </div>
  );
}

function ConnectionGauge({
  value,
  summary,
  layout,
}: {
  value: number;
  summary: string;
  layout: PulseLayout;
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
      layout={layout}
      detail={
        <span className="text-xs leading-4">
          {hasSignal ? "Room to grow" : "Needs recorded moments"}
        </span>
      }
    >
      <PulseGraphicFrame layout={layout}>
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
  trend,
  hasRecordedMoments,
  layout,
}: {
  summary: string;
  trend: RelationshipTrend;
  hasRecordedMoments: boolean;
  layout: PulseLayout;
}) {
  const tone: MicroMetricTone =
    trend === "growing" ? "success" : trend === "fading" ? "warning" : "muted";

  return (
    <MicroMetricCard
      label="Trend"
      value={summary}
      tone={tone}
      icon={<TrendingUp />}
      layout={layout}
      detail={hasRecordedMoments ? "Recorded pattern" : "No pattern yet"}
    >
      <PulseGraphicFrame layout={layout}>
        <span className="sr-only">
          Recorded trend: {summary}. The sparkline represents categorical
          direction, not measured numerical history.
        </span>
        <svg
          viewBox="0 0 96 40"
          preserveAspectRatio="xMidYMid meet"
          className={cn(
            "h-10 w-full max-w-24",
            tone === "success"
              ? "text-success"
              : tone === "warning"
                ? "text-warning"
                : "text-muted-foreground",
          )}
          aria-hidden="true"
          focusable="false"
        >
          <path
            d={categoricalTrendPath(trend)}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </PulseGraphicFrame>
    </MicroMetricCard>
  );
}

// The API exposes direction only, not time buckets. These paths are categorical
// glyphs and must not be interpreted as measured historical values.
function categoricalTrendPath(trend: RelationshipTrend): string {
  if (trend === "growing") {
    return "M4 30 L18 24 L32 27 L47 18 L62 21 L78 10 L92 13";
  }

  if (trend === "fading") {
    return "M4 11 L18 15 L32 13 L47 22 L62 19 L78 30 L92 27";
  }

  if (trend === "stable") {
    return "M4 21 L19 18 L34 22 L49 19 L64 21 L79 18 L92 20";
  }

  if (trend === "dormant") {
    return "M4 26 L19 25 L34 27 L49 26 L64 27 L79 25 L92 26";
  }

  return "M4 22 L92 22";
}

function FrequencyBars({
  value,
  summary,
  layout,
}: {
  value: number;
  summary: string;
  layout: PulseLayout;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const filledBars = Math.round((percent / 100) * 8);
  const hasSignal = percent > 0;

  return (
    <MicroMetricCard
      label="Frequency"
      value={summary}
      tone={summary === "No rhythm yet" ? "muted" : "info"}
      icon={<Activity />}
      layout={layout}
      detail={hasSignal ? `(30 days) · ${percent}/100` : "No recent moments"}
    >
      <PulseGraphicFrame layout={layout}>
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
  layout,
}: {
  value: number;
  summary: string;
  layout: PulseLayout;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <MicroMetricCard
      label="Diversity"
      value={summary}
      tone={percent > 0 ? "info" : "muted"}
      icon={<LayoutGrid />}
      layout={layout}
      detail={
        <span>{percent > 0 ? "Recorded contexts" : "Needs more context"}</span>
      }
    >
      <PulseGraphicFrame layout={layout}>
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

function SentimentMeter({
  model,
  layout,
}: {
  model: ContactOverviewModel;
  layout: PulseLayout;
}) {
  const { moods } = useLookups();
  const tone = sentimentMetricTone(model);

  return (
    <MicroMetricCard
      label="Sentiment"
      value={model.sentiment.label}
      tone={tone}
      icon={<MessageCircle />}
      layout={layout}
      detail={
        model.sentiment.parts.length > 0 ? (
          `${model.sentiment.total} mood signals`
        ) : (
          <span className="text-xs leading-4">No mood data yet.</span>
        )
      }
    >
      {model.sentiment.parts.length > 0 ? (
        <PulseGraphicFrame layout={layout}>
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
        <PulseGraphicFrame layout={layout}>
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
