import Skeleton from "@/components/ui/Skeleton";

export function ProductDeliveryInfoSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
          <Skeleton className="mt-0.5 size-5" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
      ))}
    </div>
  );
}
