import Skeleton from "@/components/ui/Skeleton";

export function ProductInfoSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-7 w-1/2" />
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="size-4" />
        ))}
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-baseline gap-3">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
