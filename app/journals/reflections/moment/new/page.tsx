import { Suspense } from "react";

import { ReflectionEditor } from "@/components/journals/reflections/ReflectionEditor";

export default function NewMomentReflectionPage() {
  return (
    <Suspense fallback={<ReflectionPageFallback />}>
      <ReflectionEditor lens="moment" />
    </Suspense>
  );
}

function ReflectionPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
