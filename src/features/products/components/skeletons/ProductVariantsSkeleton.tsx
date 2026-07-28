import Skeleton from "@/components/ui/Skeleton";

export function ProductVariantsSkeleton() {
  return (
    <div className="space-y-4 border-t border-border pt-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-9 w-16 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
