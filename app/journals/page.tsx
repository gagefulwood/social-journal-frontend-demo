import { Suspense } from "react";

import { JournalHub } from "@/components/journals/hub/JournalHub";
import { JournalHubSkeleton } from "@/components/journals/hub/JournalHubSkeleton";

export default function JournalsPage() {
  return (
    <Suspense fallback={<JournalHubSkeleton />}>
      <JournalHub />
    </Suspense>
  );
}
