"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExerciseForm } from "@/components/journals/ExerciseForm";
import { journalApi } from "@/lib/api/journalApi";
import type { CreateExerciseRequest, UpdateExerciseRequest } from "@/types/journals";

export default function NewExercisePage() {
    const router = useRouter();

    return (
        <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
            <div>
            <h1 className="font-display text-3xl">New Exercise</h1>
            <p className="text-sm text-muted-foreground">
                Let&apos;s Work Through This!
            </p>
            </div>
            <Button asChild variant="outline">
            <Link href="/journals/exercises">Cancel</Link>
            </Button>
        </div>

      <ExerciseForm
        submitLabel="Create New Exercise"
        onSubmit={async (data: CreateExerciseRequest | UpdateExerciseRequest) => {
          const exercise = await journalApi.createExercise(data as CreateExerciseRequest);
          toast.success("Exercise created.");
          router.push(`/journals/exercises/${exercise.id}`);
        }}
      />
    </main>
  );
}
