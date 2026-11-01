import Skeleton from "@/components/ui/Skeleton";
import { ProductSliderRowSkeleton } from "@/features/home/components/skeletons/ProductSliderSkeleton";
import type { SectionFrontSetting } from "@/features/home/types";

interface BannerSectionSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function BannerSectionSkeleton({ setting }: BannerSectionSkeletonProps) {
  return (
    <section className="w-full flex flex-col gap-4" aria-label="Loading banner">
      <Skeleton className="relative h-[170px] w-full overflow-hidden rounded-lg sm:h-[230px] lg:h-[300px]" />
      <ProductSliderRowSkeleton setting={setting} />
    </section>
  );
}
