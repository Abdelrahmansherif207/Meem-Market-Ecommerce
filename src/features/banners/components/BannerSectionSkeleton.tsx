import Skeleton from "@/components/ui/Skeleton";

export default function BannerSectionSkeleton() {
  return (
    <section className="w-full" aria-label="Loading banner">
      <div className="relative h-[170px] w-full overflow-hidden rounded-lg sm:h-[230px] lg:h-[300px]">
        <Skeleton className="h-full w-full" />
      </div>
    </section>
  );
}
