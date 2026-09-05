import Skeleton from "@/components/ui/Skeleton";

export default function BannerHeroSkeleton() {
  return (
    <section className="w-full" aria-label="Loading hero banners">
      <div className="relative h-[220px] w-full overflow-hidden rounded-lg sm:h-[300px] lg:h-[380px]">
        <Skeleton className="h-full w-full" />
      </div>
    </section>
  );
}
