import Skeleton from "@/components/ui/Skeleton";

export default function SliderDetailSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse">
      <Skeleton className="aspect-[21/9] w-full rounded-xl" />
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
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
