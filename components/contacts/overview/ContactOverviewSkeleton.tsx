import { Skeleton } from "@/components/ui/skeleton";

export function ContactOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,320px)_1fr]">
      <div className="rounded-lg border border-border bg-card p-5">
        <Skeleton className="mx-auto size-24 rounded-2xl" />
        <Skeleton className="mx-auto mt-4 h-7 w-40" />
        <Skeleton className="mx-auto mt-2 h-4 w-28" />
        <Skeleton className="mt-5 h-9 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="mt-6 h-20 w-full" />
        <Skeleton className="mt-4 h-20 w-full" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-36 w-full rounded-lg" />
        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
