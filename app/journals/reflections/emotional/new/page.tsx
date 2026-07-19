import { Suspense } from "react";

import { ReflectionEditor } from "@/components/journals/reflections/ReflectionEditor";

export default function NewEmotionalReflectionPage() {
  return (
    <Suspense fallback={<ReflectionPageFallback />}>
      <ReflectionEditor lens="emotional" />
    </Suspense>
  );
}

function ReflectionPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
