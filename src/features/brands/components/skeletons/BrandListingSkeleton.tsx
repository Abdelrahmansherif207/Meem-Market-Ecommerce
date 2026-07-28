import Skeleton from "@/components/ui/Skeleton";

export default function BrandListingSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6" aria-label="Loading brands">
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 p-4">
            <Skeleton className="h-24 w-24 rounded-full md:h-28 md:w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
