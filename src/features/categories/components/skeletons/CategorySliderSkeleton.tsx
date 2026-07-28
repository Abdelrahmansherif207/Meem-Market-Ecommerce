import Skeleton from "@/components/ui/Skeleton";

export function CategorySliderSkeleton() {
  return (
    <div className="relative w-full pb-6 mb-4" aria-label="Loading categories">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-3 w-[120px] shrink-0">
            <Skeleton className="size-[120px] rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
