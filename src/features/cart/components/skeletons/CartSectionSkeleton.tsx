import Skeleton from "@/components/ui/Skeleton";

export function CartSectionSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border p-10 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-full rounded-full" />
        <div className="flex justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-3 border border-border p-3 rounded-lg">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="flex flex-1 min-w-0 gap-2">
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-col items-end justify-center gap-2 shrink-0">
                <Skeleton className="h-7 w-[114px] rounded-lg" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
