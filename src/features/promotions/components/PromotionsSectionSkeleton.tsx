import Skeleton from "@/components/ui/Skeleton";
import { gridColumnsClass } from "@/shared/utils/gridClasses";
import type { SectionFrontSetting } from "@/features/home/types";

interface PromotionsSectionSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function PromotionsSectionSkeleton({ setting }: PromotionsSectionSkeletonProps) {
  const isGrid = setting?.layout === "grid";

  return (
    <section className="group relative w-full overflow-hidden pb-4" aria-label="Loading promotions">
      <Skeleton className="h-5 w-48 mb-4" />
      {isGrid ? (
        <div className={`grid gap-4 ${gridColumnsClass(setting?.columns_count, "one")}`}>
          {Array.from({ length: Math.max(3, Math.min(setting?.columns_count ?? 3, 8)) }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] rounded-xl"
            />
          ))}
        </div>
      ) : (
        <Skeleton className="w-full aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] rounded-xl" />
      )}
    </section>
  );
}
