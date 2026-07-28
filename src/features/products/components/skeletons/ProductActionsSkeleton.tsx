import Skeleton from "@/components/ui/Skeleton";

export function ProductActionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-16" />
        <div className="flex items-center rounded-lg border border-border">
          <Skeleton className="size-10" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="size-10" />
        </div>
      </div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
