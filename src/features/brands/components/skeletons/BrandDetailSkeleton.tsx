import Skeleton from "@/components/ui/Skeleton";

export default function BrandDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-pulse" aria-label="Loading brand">
      <Skeleton className="h-5 w-48" />
      <div className="flex items-center gap-6">
        <Skeleton className="h-32 w-32 rounded-full" />
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
