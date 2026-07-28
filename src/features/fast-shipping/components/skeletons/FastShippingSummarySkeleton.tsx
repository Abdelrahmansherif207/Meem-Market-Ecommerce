import Skeleton from "@/components/ui/Skeleton";

export function FastShippingSummarySkeleton() {
  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-1 w-6 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-[14px]" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="border-t border-border pt-3 space-y-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-3 w-48 mx-auto" />
    </div>
  );
}
