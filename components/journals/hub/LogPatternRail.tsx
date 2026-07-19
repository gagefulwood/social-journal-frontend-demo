"use client";

import { BarChart3, Clock3, NotebookTabs } from "lucide-react";

import { EmptyActionBox } from "@/components/ui/empty-action-box";
import { IconBadge } from "@/components/ui/icon-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";
import { useLogPatterns } from "@/hooks/useJournal";
import {
  getJournalClassificationPresentation,
  UNSPECIFIED_JOURNAL_FORMAT_LABEL,
} from "@/lib/presentation/journalPresentation";
import type { LogFormat } from "@/types/journals";

import { formatDuration } from "@/components/journals/hub/journalHubUtils";

type PatternRow = { key: string; label: string; value: string };

function buildFormatRows(counts: Record<string, number>): PatternRow[] {
  const grouped = new Map<string, { label: string; count: number }>();

  for (const [value, count] of Object.entries(counts)) {
    const { formatPresentation } = getJournalClassificationPresentation(
      "log",
      value,
    );
    const key = formatPresentation?.key ?? "unspecified";
    const label = formatPresentation?.label ?? UNSPECIFIED_JOURNAL_FORMAT_LABEL;
    const current = grouped.get(key);
    grouped.set(key, {
      label,
      count: (current?.count ?? 0) + count,
    });
  }

  return Array.from(grouped, ([key, item]) => ({
    key,
    label: item.label,
    value: String(item.count),
  }));
}

export function LogPatternRail({ format }: { format?: LogFormat }) {
  const { data, loading, error } = useLogPatterns({ days: 30, format });
  const byFormat = data ? buildFormatRows(data.by_format) : [];
  const characteristics: PatternRow[] =
    data?.episode.characteristics.map((item) => ({
      key: String(item.id),
      label: item.name,
      value: String(item.count),
    })) ?? [];
  const socialEffects: PatternRow[] =
    data?.social_energy.effects.map((item, index) => ({
      key: `${item.battery_effect}-${item.mood_shift}-${item.behavioral_effect}-${index}`,
      label: [item.battery_effect, item.mood_shift, item.behavioral_effect]
        .filter(Boolean)
        .map(humanize)
        .join(" / "),
      value: String(item.count),
    })) ?? [];
  const sentimentShifts: PatternRow[] =
    data?.sentiment.shifts.map((item, index) => ({
      key: `${item.before_state}-${item.after_state}-${index}`,
      label: `${humanize(item.before_state)} to ${humanize(item.after_state)} / ${humanize(item.overall_exchange)}`,
      value: String(item.count),
    })) ?? [];

  return (
    <aside
      aria-labelledby="log-patterns-heading"
      className="xl:sticky xl:top-4"
    >
      <SurfaceCard className="p-4">
        <div className="flex items-start gap-3">
          <IconBadge tone="accent">
            <BarChart3 aria-hidden="true" />
          </IconBadge>
          <div>
            <h2 id="log-patterns-heading" className="text-base font-semibold">
              From your Logs
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Recorded activity from completed Logs only.
            </p>
          </div>
        </div>

        {loading ? (
          <PatternSkeleton />
        ) : error ? (
          <p className="mt-4 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
            Log patterns are unavailable right now.
          </p>
        ) : !data || data.total === 0 ? (
          <EmptyActionBox
            className="mt-4"
            title="Not enough Log data yet"
            copy="Complete Logs to build straightforward counts and duration summaries."
          />
        ) : (
          <div className="mt-4 space-y-4">
            <dl className="grid grid-cols-2 gap-2">
              <PatternMetric
                icon={<NotebookTabs aria-hidden="true" />}
                value={String(data.total)}
                label={`Logs in ${data.window.days} days`}
              />
              <PatternMetric
                icon={<Clock3 aria-hidden="true" />}
                value={formatDuration(data.episode.total_duration_minutes)}
                label="Episode duration"
              />
            </dl>
            <PatternList title="By format" items={byFormat} />
            <PatternList
              title="Episode characteristics"
              items={characteristics}
            />
            <PatternList title="Social energy shifts" items={socialEffects} />
            <PatternList title="Sentiment shifts" items={sentimentShifts} />
            <p className="border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
              These summaries reflect only what you recorded. Reflections are
              never included.
            </p>
          </div>
        )}
      </SurfaceCard>
    </aside>
  );
}

function PatternMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-md bg-muted/35 p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function PatternList({ title, items }: { title: string; items: PatternRow[] }) {
  const visibleItems = items.slice(0, 3);
  if (!visibleItems.length) return null;

  return (
    <section>
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <dl className="mt-2 grid gap-2">
        {visibleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <dt className="min-w-0 truncate text-muted-foreground">
              {item.label}
            </dt>
            <dd className="shrink-0 font-medium text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PatternSkeleton() {
  return (
    <div className="mt-4 space-y-4" aria-label="Loading Log patterns">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

function humanize(value: string) {
  if (!value) return "Not recorded";
  const words = value.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}
