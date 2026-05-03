"use client";

import type { Contact } from "@/types/contacts";
import { DiversityChart } from "@/components/contacts/DiversityChart";
import { scorePercent, trendLabel } from "@/components/contacts/contact-utils";

type StatsPanelProps = {
  contact: Contact;
};

export function StatsPanel({ contact }: StatsPanelProps) {
  const sentiments = Object.entries(contact.sentiment_profile ?? {});

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Relationship Stats</h2>
        <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
          {trendLabel(contact.relationship_trend)}
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Connection Strength</p>
            <p className="mt-1 text-2xl font-semibold">
              {scorePercent(contact.connection_strength)}%
            </p>
          </div>
          <div className="h-2 w-24 rounded-full bg-background">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${scorePercent(contact.connection_strength)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <MetricBar
          label="Frequency"
          value={contact.interaction_frequency_score}
        />
        <div className="rounded-md bg-muted p-3">
          <div className="flex items-center justify-between text-sm">
            <span>Sentiment</span>
            <span className="text-xs text-muted-foreground">
              {sentiments.length || 0} signals
            </span>
          </div>
          {sentiments.length > 0 ? (
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-background">
              {sentiments.map(([label, value]) => (
                <div
                  key={label}
                  title={`${label}: ${value}`}
                  className="bg-primary odd:bg-muted-foreground"
                  style={{ width: `${scorePercent(value)}%` }}
                />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No sentiment data</p>
          )}
        </div>
        <div className="rounded-md bg-muted p-3 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Diversity</span>
            <span className="text-xs text-muted-foreground">
              {scorePercent(contact.interaction_diversity_score)}%
            </span>
          </div>
          <DiversityChart
            score={contact.interaction_diversity_score}
            distribution={null}
          />
        </div>
      </div>
    </section>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{scorePercent(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-background">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${scorePercent(value)}%` }}
        />
      </div>
    </div>
  );
}
