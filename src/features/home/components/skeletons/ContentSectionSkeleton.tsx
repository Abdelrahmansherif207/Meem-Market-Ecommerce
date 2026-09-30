import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/shared/utils/cn";
import type { SectionFrontSetting } from "../../types";

interface ContentSectionSkeletonProps {
  setting?: SectionFrontSetting;
}

const GRID_CLASSES =
  "grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:gap-x-6";
const ITEMS_PER_SLIDE = 16;

export default function ContentSectionSkeleton({ setting }: ContentSectionSkeletonProps) {
  const isCircle = setting?.shape === "circle";

  return (
    <div className="relative w-full" aria-label="Loading categories">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className={GRID_CLASSES}>
        {Array.from({ length: ITEMS_PER_SLIDE }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton
              className={cn(
                "w-full aspect-square",
                isCircle ? "rounded-full" : "rounded-lg"
              )}
            />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
