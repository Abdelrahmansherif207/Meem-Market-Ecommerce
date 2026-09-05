import Skeleton from "@/components/ui/Skeleton";

export default function FlashSaleBannerSkeleton() {
  return (
    <section className="w-full" aria-label="Loading flash sale banner">
      <div className="relative h-[260px] w-full overflow-hidden rounded-lg sm:h-[340px] lg:h-[420px]">
        <Skeleton className="h-full w-full" />
      </div>
    </section>
  );
}
