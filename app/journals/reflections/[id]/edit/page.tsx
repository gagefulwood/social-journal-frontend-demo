"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";

import { ReflectionEditor } from "@/components/journals/reflections/ReflectionEditor";

export default function EditReflectionPage() {
  const params = useParams<{ id: string }>();
  return (
    <Suspense fallback={<ReflectionPageFallback />}>
      <ReflectionEditor reflectionId={params.id} />
    </Suspense>
  );
}

function ReflectionPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
