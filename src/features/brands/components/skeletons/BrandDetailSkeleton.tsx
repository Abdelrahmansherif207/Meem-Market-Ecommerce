import Skeleton from "@/components/ui/Skeleton";

export default function BrandDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-pulse" aria-label="Loading brand">
      <Skeleton className="h-5 w-48" />
      <div className="w-full flex flex-col items-center gap-4 rounded-xl bg-surface p-6 md:p-8">
        <Skeleton className="h-28 w-28 rounded-xl md:h-36 md:w-36" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
