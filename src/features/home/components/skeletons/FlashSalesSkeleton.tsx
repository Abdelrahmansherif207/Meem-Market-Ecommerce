import Skeleton from "@/components/ui/Skeleton";
import type { SectionFrontSetting } from "../../types";

interface FlashSalesSkeletonProps {
  type?: string;
  setting?: SectionFrontSetting;
}

export default function FlashSalesSkeleton({ type, setting }: FlashSalesSkeletonProps) {
  const isFlashSale = type === "flash-sales";

  // Old skeleton for coupons/promotions/brands (non-flash-sales types)
  if (!isFlashSale) {
    const isGrid = setting?.layout === "grid";
    return (
      <section className="group relative w-full pb-4" aria-label="Loading section">
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

  // New skeleton for flash-sales type
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 my-16" aria-label="Loading flash sales">
      {/* Banner Skeleton */}
      <div className="relative w-full h-[140px] sm:h-[180px] lg:h-[220px] rounded-[24px] rounded-b-none bg-gradient-to-br from-orange-400 to-orange-500 animate-pulse" />

      {/* Carousel Skeleton */}
      <div className="-mt-3 relative">
        <div className="flex gap-4 overflow-hidden pt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col w-[248px] shrink-0 bg-white rounded-[18px] border border-gray-100 overflow-hidden">
              <Skeleton className="h-[260px] w-full rounded-none" />
              <div className="flex flex-col gap-2.5 p-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-20 mt-2" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
