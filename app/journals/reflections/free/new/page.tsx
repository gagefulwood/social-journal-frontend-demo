import { Suspense } from "react";

import { ReflectionEditor } from "@/components/journals/reflections/ReflectionEditor";

export default function NewFreeReflectionPage() {
  return (
    <Suspense fallback={<ReflectionPageFallback />}>
      <ReflectionEditor lens="free" />
    </Suspense>
  );
}

function ReflectionPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
