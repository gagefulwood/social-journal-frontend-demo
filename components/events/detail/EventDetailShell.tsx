import type { ReactNode } from "react";

export function EventDetailShell({
  actions,
  children,
}: {
  actions: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen min-w-0 bg-background">
      <div className="mx-auto w-full max-w-[1500px] min-w-0 px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5">
        <header className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-3 sm:mb-4">
          {actions}
        </header>
        <div className="min-w-0 space-y-3 sm:space-y-4">{children}</div>
      </div>
    </main>
  );
}
