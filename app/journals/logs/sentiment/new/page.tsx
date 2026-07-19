import { Suspense } from "react";

import { LogEditor } from "@/components/journals/logs/LogEditor";

export default function NewSentimentLogPage() {
  return (
    <Suspense fallback={<LogPageFallback />}>
      <LogEditor format="sentiment" />
    </Suspense>
  );
}

function LogPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
