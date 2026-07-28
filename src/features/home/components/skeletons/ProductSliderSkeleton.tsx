import Skeleton from "@/components/ui/Skeleton";

export default function ProductSliderSkeleton() {
  return (
    <div className="group relative w-full pb-4" aria-label="Loading products">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[190px] flex-shrink-0">
            <Skeleton className="w-full aspect-square rounded-2xl mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
