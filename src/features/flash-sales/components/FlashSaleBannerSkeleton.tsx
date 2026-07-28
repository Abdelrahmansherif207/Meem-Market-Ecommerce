import Skeleton from "@/components/ui/Skeleton";

export default function FlashSaleBannerSkeleton() {
  return (
    <section className="w-full" aria-label="Loading flash sale banner">
      <div className="relative h-[200px] w-full overflow-hidden rounded-[20px] sm:h-[260px] lg:h-[340px]">
        <Skeleton className="h-full w-full" />
      </div>
    </section>
  );
}
