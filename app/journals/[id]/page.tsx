"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { journalApi } from "@/lib/api/journalApi";
import type { Log } from "@/types/journals";
import { SidebarSJ } from "@/components/layout/SideBarLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await journalApi.getLog(
          String(params.id)
        );

        setLog(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-lg border bg-card p-8">
          <p className="text-muted-foreground">
            Loading journal...
          </p>
        </div>
      </main>
    );
  }

  if (!log) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-lg border bg-card p-8">
          <p className="text-destructive">
            Journal not found.
          </p>
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider>
        <div className="flex min-h-screen w-full">
            <SidebarSJ />
        <main className="mx-auto max-w-5xl px-6 py-10">

            {/* button omfg*/}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/journals">Back</Link>
          </Button>
        </div>
        <section className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-5">
                <div>
                <p className="text-sm text-muted-foreground">
                    Log #{log.id}
                </p>

                <h1 className="mt-2 text-4xl font-bold tracking-tight">
                    {log.title}
                </h1>
                </div>

                <div className="space-y-2 text-base">
                <p>
                    <span className="font-semibold">
                    Episode Type:
                    </span>{" "}
                    {log.subtype || "None"}
                </p>

                <p>
                    <span className="font-semibold">
                    Mood:
                    </span>{" "}
                    {log.mood?.name || "None"}
                </p>
                </div>
            </div>
                <div className="flex w-full max-w-sm flex-col gap-4">
                <div className="flex flex-wrap justify-end gap-2">
                    {log.tags?.map((tag) => (
                    <div
                        key={tag.id}
                        className="rounded-full bg-muted px-4 py-1 text-sm font-medium"
                    >
                        {tag.tag_name}
                    </div>
                    ))}
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-5">
                    <h2 className="text-lg font-semibold">
                    Event
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    This box will populate with the event associated with this log when the events timeline is rebuilt.
                    </p>
                </div>
                </div>
            </div>
            <div className="mt-12">
            <h2 className="text-2xl font-semibold">
                Episode Description
            </h2>

            <div className="mt-5 rounded-lg bg-muted/40 p-6 leading-8 text-muted-foreground">
                {log.body}
            </div>
            </div>
        </section>
        </main>
        </div>
    </SidebarProvider>
  );
}


