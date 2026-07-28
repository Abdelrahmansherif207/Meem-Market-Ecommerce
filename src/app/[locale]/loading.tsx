import Skeleton from "@/components/ui/Skeleton";
import HeroSwiperSkeleton from "@/features/home/components/skeletons/HeroSwiperSkeleton";
import ProductSliderSkeleton from "@/features/home/components/skeletons/ProductSliderSkeleton";

export default function Loading() {
  return (
    <main className="flex flex-col gap-y-5">
      <HeroSwiperSkeleton />
      <div className="space-y-4 px-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-3/4 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <ProductSliderSkeleton />
      <div className="space-y-4 px-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-4 gap-x-15 gap-y-4" style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
      <ProductSliderSkeleton />
    </main>
  );
}
