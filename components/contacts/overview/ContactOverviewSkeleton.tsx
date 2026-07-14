import { Skeleton } from "@/components/ui/skeleton";

export function ContactOverviewSkeleton() {
  return (
    <div className="min-w-0 max-w-full" aria-label="Loading contact overview">
      <Skeleton className="mb-4 h-16 w-full rounded-none" />
      <div className="grid min-w-0 gap-4 xl:grid-cols-[288px_minmax(0,1fr)] xl:gap-5 2xl:grid-cols-[296px_minmax(0,1fr)] 2xl:gap-6">
        <div className="min-w-0 rounded-lg border border-border/80 bg-card p-5 shadow-sm">
          <Skeleton className="mx-auto size-24 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-6 w-36" />
          <Skeleton className="mx-auto mt-2 h-4 w-24" />
          <Skeleton className="mt-5 h-9 w-full" />
          <div className="mt-2 grid gap-2 2xl:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="mt-5 h-20 w-full" />
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
          <div className="min-w-0 space-y-4">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-44 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
          <div className="min-w-0 rounded-lg border border-border/80 bg-card p-4 shadow-sm">
            <Skeleton className="h-10 w-48 rounded-md" />
            <div className="mt-5 divide-y divide-border">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 py-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="size-12 shrink-0 rounded-md" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-4 h-8 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
