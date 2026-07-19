import { Skeleton } from "@/components/ui/skeleton";
import { SurfaceCard } from "@/components/ui/surface-card";

export function JournalHubSkeleton() {
  return (
    <main className="mx-auto flex w-full max-w-[90rem] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-80 max-w-full" />
      <SurfaceCard className="p-4">
        <Skeleton className="h-12 w-full" />
      </SurfaceCard>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <SurfaceCard className="overflow-hidden">
          <div className="border-b border-border/70 p-4">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="grid gap-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="h-72 p-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-4 h-20 w-full" />
        </SurfaceCard>
      </div>
    </main>
  );
}
