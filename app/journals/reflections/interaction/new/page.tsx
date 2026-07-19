import { Suspense } from "react";

import { ReflectionEditor } from "@/components/journals/reflections/ReflectionEditor";

export default function NewInteractionReflectionPage() {
  return (
    <Suspense fallback={<ReflectionPageFallback />}>
      <ReflectionEditor lens="interaction" />
    </Suspense>
  );
}

function ReflectionPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
