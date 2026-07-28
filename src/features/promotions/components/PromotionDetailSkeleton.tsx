import Skeleton from "@/components/ui/Skeleton";

export default function PromotionDetailSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 p-4 md:p-8 animate-pulse">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="aspect-[16/5] w-full rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
