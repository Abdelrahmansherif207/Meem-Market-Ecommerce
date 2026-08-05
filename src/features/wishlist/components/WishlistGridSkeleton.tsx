import Skeleton from "@/components/ui/Skeleton";

export function WishlistItemSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-white p-3 sm:gap-4">
      <Skeleton className="h-20 w-20 shrink-0 rounded-lg sm:h-24 sm:w-24" />
      <div className="flex flex-1 flex-col justify-between py-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col items-end justify-between py-1">
        <Skeleton className="size-4 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}

export function WishlistGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <WishlistItemSkeleton key={i} />
      ))}
    </div>
  );
}
