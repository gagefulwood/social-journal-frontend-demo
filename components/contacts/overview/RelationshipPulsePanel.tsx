"use client";

import { Lightbulb, TrendingUp } from "lucide-react";
import { useLookups } from "@/hooks/useLookups";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contacts";
import type { Mood } from "@/types/lookups";
import type {
  ContactOverviewModel,
  OverviewTone,
} from "./contact-overview-utils";

type RelationshipPulsePanelProps = {
  contact: Contact;
  model: ContactOverviewModel;
};

export function RelationshipPulsePanel({
  contact,
  model,
}: RelationshipPulsePanelProps) {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Relationship Pulse</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A quick read of your relationship signals from real moments.
        </p>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <ConnectionGauge
          value={contact.connection_strength}
          summary={model.connectionBand.label}
        />
        <TrendSignal summary={model.trend.label} tone={model.trend.tone} />
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

      <div className="mt-7 flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0" />
        <p>
          These signals reflect recorded moments only. Keep capturing to see
          clearer patterns.
        </p>
      </div>
    </section>
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
    <div className={pulseMetricCardClass()}>
      <p className="mb-3 text-center text-sm font-medium">Connection</p>
      <div className="relative mx-auto flex size-24 items-center justify-center rounded-full bg-muted">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${accent} ${percent * 3.6}deg, var(--muted) 0deg)`,
          }}
        />
        <div className="relative flex size-16 flex-col items-center justify-center rounded-full bg-background">
          <span className="text-2xl font-semibold">{percent}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p
        className={cn("mt-3 text-center text-sm font-semibold", "text-success")}
      >
        {summary}
      </p>
      <p className="text-center text-xs text-muted-foreground">Room to grow</p>
    </div>
  );
}

function TrendSignal({
  summary,
  tone,
}: {
  summary: string;
  tone: OverviewTone;
}) {
  const isGrowing = tone === "positive";

  return (
    <div className={pulseMetricCardClass()}>
      <p className="mb-4 text-center text-sm font-medium">Relationship Trend</p>
      <div
        className={cn(
          "mx-auto flex size-20 items-center justify-center rounded-full bg-muted",
          isGrowing
            ? "bg-success-muted text-success"
            : "bg-muted text-muted-foreground",
        )}
      >
        <TrendingUp className="size-9" />
      </div>
      <p
        className={cn(
          "mt-4 text-center text-sm font-semibold",
          isGrowing ? "text-success" : "text-muted-foreground",
        )}
      >
        {summary}
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Recorded pattern
      </p>
    </div>
  );
}

function FrequencyBars({ value, summary }: { value: number; summary: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const filledBars = Math.round((percent / 100) * 8);

  return (
    <div className={pulseMetricCardClass()}>
      <p className="mb-4 text-center text-sm font-medium">
        Interaction Frequency
        <span className="block font-normal text-muted-foreground">
          (30 days)
        </span>
      </p>
      <div className="flex h-16 items-end justify-center gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-3 rounded-full bg-info-muted",
              index < filledBars && "bg-info-solid",
            )}
            style={{ height: `${24 + index * 5}px` }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-info">
        {summary}
      </p>
      <p className="text-center text-xs text-muted-foreground">{percent}/100</p>
    </div>
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
    <div className={pulseMetricCardClass()}>
      <p className="mb-4 text-center text-sm font-medium">
        Interaction Diversity
        <span className="block font-normal text-muted-foreground">(Score)</span>
      </p>
      <p className="text-center text-2xl font-semibold">
        {percent}
        <span className="ml-1 text-sm font-normal text-muted-foreground">
          /100
        </span>
      </p>
      <div className="mx-auto mt-4 h-2 max-w-36 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-info-solid"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-center text-sm font-semibold">{summary}</p>
      <p className="text-center text-xs text-muted-foreground">
        {percent > 0 ? "Based on recorded contexts" : "Not enough contexts yet"}
      </p>
    </div>
  );
}

function SentimentMeter({ model }: { model: ContactOverviewModel }) {
  const { moods } = useLookups();

  return (
    <div className={pulseMetricCardClass()}>
      <p className="mb-4 text-center text-sm font-medium">Sentiment Balance</p>

      {model.sentiment.parts.length > 0 ? (
        <>
          <div className="mx-auto mt-6 flex h-5 max-w-40 items-center rounded-full bg-muted px-1">
            {model.sentiment.parts.map((part) => (
              <div
                key={part.label}
                className={cn(
                  "h-3 rounded-full",
                  moodSegmentColorClass(part.label, moods),
                )}
                style={{ width: `${part.percent}%` }}
                title={`${part.label}: ${part.count}`}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-warning">
            {model.sentiment.label}
          </p>
          <p className="mx-auto mt-1 max-w-40 text-center text-xs leading-5 text-muted-foreground">
            {model.sentiment.detail}
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto mt-6 h-5 max-w-40 rounded-full bg-muted" />
          <p className="mt-4 text-center text-sm font-semibold">
            {model.sentiment.label}
          </p>
          <p className="mx-auto mt-1 max-w-40 text-center text-xs leading-5 text-muted-foreground">
            No journal mood data has been recorded yet.
          </p>
        </>
      )}
    </div>
  );
}

function pulseMetricCardClass(): string {
  return cn(
    "min-h-64 cursor-default rounded-lg border border-border/70 bg-background/60 px-4 py-5 text-left transition-all duration-200",
    "hover:-translate-y-1 hover:border-border hover:bg-muted/30 hover:shadow-md motion-reduce:hover:translate-y-0",
  );
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
