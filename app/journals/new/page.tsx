"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogForm } from "@/components/journals/LogForm";
import { journalApi } from "@/lib/api/journalApi";
import type { CreateLogRequest, UpdateLogRequest } from "@/types/journals";

export default function NewLogPage() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-semibold leading-tight">
            New Log
          </h1>
          <p className="text-sm text-muted-foreground">
            Add episode type, moods felt, and details.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/journals">Cancel</Link>
        </Button>
      </div>

      <LogForm
        submitLabel="Create New Log"
        onSubmit={async (data: CreateLogRequest | UpdateLogRequest) => {
          const log = await journalApi.createLog(data as CreateLogRequest);
          toast.success("Log created.");
          router.push(`/journals`);
        }}
      />
    </main>
  );
}
