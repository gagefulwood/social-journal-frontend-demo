"use client";

import { scorePercent } from "@/components/contacts/contact-utils";

type DiversityChartProps = {
  score: number;
  distribution?: Record<string, number> | null;
};

const segmentClasses = [
  "bg-primary",
  "bg-muted-foreground",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

export function DiversityChart({ score, distribution }: DiversityChartProps) {
  const entries = Object.entries(distribution ?? {}).filter(
    ([, count]) => count > 0
  );
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0 || total === 0) {
    return (
      <div className="rounded-md border border-border bg-background p-3">
        <div className="h-3 rounded-full border border-dashed border-muted-foreground/40" />
        <p className="mt-2 text-xs text-muted-foreground">
          Context distribution will appear once event data is tracked.
        </p>
        <p className="mt-2 text-xs font-medium">
          Diversity score: {scorePercent(score)}%
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-muted">
        {entries.map(([label, count], index) => (
          <div
            key={label}
            title={`${label}: ${count}`}
            aria-label={`${label}: ${count}`}
            className={segmentClasses[index % segmentClasses.length]}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(([label], index) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
          >
            <span
              className={`size-2 rounded-full ${
                segmentClasses[index % segmentClasses.length]
              }`}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
