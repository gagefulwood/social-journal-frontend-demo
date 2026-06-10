import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contacts";
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

      <div className="mt-7 grid gap-6 lg:grid-cols-4">
        <ConnectionGauge
          value={contact.connection_strength}
          summary={model.connectionBand.label}
          tone={model.connectionBand.tone}
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
  tone,
}: {
  value: number;
  summary: string;
  tone: OverviewTone;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const accent = toneColor(tone);

  return (
    <div className="border-border/70 lg:border-r lg:pr-6">
      <p className="mb-3 text-center text-sm font-medium">Connection</p>
      <div className="relative mx-auto flex size-24 items-center justify-center rounded-full bg-muted">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${accent} ${percent * 3.6}deg, rgb(243 244 246) 0deg)`,
          }}
        />
        <div className="relative flex size-16 flex-col items-center justify-center rounded-full bg-background">
          <span className="text-2xl font-semibold">{percent}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <p
        className={cn(
          "mt-3 text-center text-sm font-semibold",
          tone === "positive" && "text-emerald-700",
          tone === "neutral" && "text-sky-700",
          tone === "watch" && "text-amber-600",
          tone === "muted" && "text-violet-700",
        )}
      >
        {summary}
      </p>
      <p className="text-center text-xs text-muted-foreground">Room to grow</p>
    </div>
  );
}

function FrequencyBars({ value, summary }: { value: number; summary: string }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  const filledBars = Math.round((percent / 100) * 8);

  return (
    <div className="border-border/70 lg:border-r lg:px-6">
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
              "w-3 rounded-full bg-violet-100",
              index < filledBars && "bg-violet-500",
            )}
            style={{ height: `${24 + index * 5}px` }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-violet-700">
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
    <div className="border-border/70 lg:border-r lg:px-6">
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
          className="h-full rounded-full bg-violet-500"
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
  return (
    <div className="lg:pl-6">
      <p className="mb-4 text-center text-sm font-medium">Sentiment Balance</p>

      {model.sentiment.parts.length > 0 ? (
        <>
          <div className="mx-auto mt-6 flex h-5 max-w-40 items-center rounded-full bg-violet-50 px-1">
            {model.sentiment.parts.slice(0, 5).map((part, index) => (
              <div
                key={part.label}
                className={cn(
                  "h-3 rounded-full",
                  index % 3 === 0 && "bg-amber-400",
                  index % 3 === 1 && "bg-violet-500",
                  index % 3 === 2 && "bg-emerald-500",
                )}
                style={{ width: `${part.percent}%` }}
                title={`${part.label}: ${part.count}`}
              />
            ))}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-amber-600">
            {model.sentiment.label}
          </p>
          <p className="mx-auto mt-1 max-w-40 text-center text-xs leading-5 text-muted-foreground">
            {model.sentiment.detail}
          </p>
        </>
      ) : (
        <>
          <div className="mx-auto mt-6 h-5 max-w-40 rounded-full bg-violet-50" />
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

function toneColor(tone: OverviewTone): string {
  if (tone === "positive") {
    return "rgb(34 197 94)";
  }

  if (tone === "neutral") {
    return "rgb(14 165 233)";
  }

  if (tone === "watch") {
    return "rgb(245 158 11)";
  }

  return "rgb(139 92 246)";
}
