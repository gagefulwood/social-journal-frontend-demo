"use client";

import Link from "next/link";
import type { ReflectionListItem } from "@/types/journals";
import {
  reflectionTitle,
  reflectionDate,
} from "@/components/journals/journals-utils";

type JournalReflectionCardProps = {
  reflection: ReflectionListItem;
};

export function JournalReflectionCard({ reflection }: JournalReflectionCardProps) {
    const title = reflectionTitle(reflection);
    const date = reflectionDate(reflection);

return (
    <Link
      href={`/journals/${reflection.id}`}
      className="group block rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs transition hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{title}</h2>
              {date && (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {date.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 