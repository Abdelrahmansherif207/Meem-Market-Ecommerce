import Skeleton from "@/components/ui/Skeleton";
import type { SectionFrontSetting } from "../../types";

interface FlashSalesSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function FlashSalesSkeleton({ setting }: FlashSalesSkeletonProps) {
  const isGrid = setting?.layout === "grid";

  return (
    <section className="group relative w-full pb-4" aria-label="Loading flash sales">
      <Skeleton className="h-5 w-48 mb-4" />
      {isGrid ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-3/4 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-hidden px-4 md:px-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-3/4 w-[200px] flex-shrink-0 rounded-lg" />
          ))}
        </div>
      )}
    </section>
  );
}
