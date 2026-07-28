import Skeleton from "@/components/ui/Skeleton";

export default function HeroSwiperSkeleton() {
  return (
    <section className="w-full" aria-label="Loading hero banners">
      <div className="relative h-[170px] w-full overflow-hidden rounded-[20px] sm:h-[230px] lg:h-[300px]">
        <Skeleton className="h-full w-full" />
      </div>
    </section>
  );
}
