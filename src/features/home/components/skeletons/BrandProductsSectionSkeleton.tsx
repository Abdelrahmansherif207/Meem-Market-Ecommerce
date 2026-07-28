import Skeleton from "@/components/ui/Skeleton";
import type { SectionFrontSetting } from "../../types";

interface BrandProductsSectionSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function BrandProductsSectionSkeleton({ setting }: BrandProductsSectionSkeletonProps) {
  const count = setting?.columns_count ?? 4;

  return (
    <div className="flex flex-col gap-y-8 pb-4" aria-label="Loading brands">
      <Skeleton className="h-5 w-48" />
      <div className="flex flex-col gap-y-12">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-y-4">
            <Skeleton className="h-42.5 w-full rounded-sm sm:h-57.5 lg:h-75" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: count }).map((_, j) => (
                <div key={j} className="w-[190px] flex-shrink-0">
                  <Skeleton className="mb-2 aspect-square w-full rounded-2xl" />
                  <Skeleton className="mb-1 h-4 w-full" />
                  <Skeleton className="mb-1 h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
