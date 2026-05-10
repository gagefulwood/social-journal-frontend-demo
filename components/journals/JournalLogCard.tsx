"use client";

import Link from "next/link";
import type { LogListItem } from "@/types/journals";
import {
  logTitle,
  logDate,
  logSubtype,
} from "@/components/journals/journals-utils";
import { scorePercent } from "../contacts/contact-utils";

type JournalLogCardProps = {
  log: LogListItem;
};

export function JournalLogCard({ log }: JournalLogCardProps) {
    const title = logTitle(log);
    const date = logDate(log);

return (
    <Link
      href={`/journals/${log.id}`}
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
            <span className="rounded-md bg-muted px-2 py-1 text-xs capitalize text-muted-foreground">
              {logSubtype(log)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
} 