import { Suspense } from "react";

import { LogEditor } from "@/components/journals/logs/LogEditor";

export default function NewEpisodeLogPage() {
  return (
    <Suspense fallback={<LogPageFallback />}>
      <LogEditor format="episode" />
    </Suspense>
  );
}

function LogPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
