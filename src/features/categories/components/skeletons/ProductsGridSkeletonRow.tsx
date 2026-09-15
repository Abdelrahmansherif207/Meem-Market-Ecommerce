import Skeleton from "@/components/ui/Skeleton";

/**
 * Skeleton cards appended below the grid while the next cursor page loads.
 * Uses the same grid classes as `CategoryProducts` so the placeholders
 * align with the real cards.
 */
export function ProductsGridSkeletonRow({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      aria-label="Loading more products"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-full">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
          <Skeleton className="mt-1 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
