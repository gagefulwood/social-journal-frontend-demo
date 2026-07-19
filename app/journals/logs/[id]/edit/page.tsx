import { Suspense } from "react";

import { LogEditScreen } from "@/components/journals/logs/LogScreens";

export default function EditLogPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <LogEditScreen />
    </Suspense>
  );
}
