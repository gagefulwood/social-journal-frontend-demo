import { Suspense } from "react";

import { LogEditor } from "@/components/journals/logs/LogEditor";

export default function NewSocialEnergyLogPage() {
  return (
    <Suspense fallback={<LogPageFallback />}>
      <LogEditor format="social_energy" />
    </Suspense>
  );
}

function LogPageFallback() {
  return <main className="min-h-screen bg-background" />;
}
