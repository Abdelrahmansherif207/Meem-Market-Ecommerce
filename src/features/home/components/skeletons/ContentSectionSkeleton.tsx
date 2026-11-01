import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/shared/utils/cn";
import { gridColumnsClass } from "@/shared/utils/gridClasses";
import type { SectionFrontSetting } from "../../types";

interface ContentSectionSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function ContentSectionSkeleton({ setting }: ContentSectionSkeletonProps) {
  const isCircle = setting?.shape === "circle";
  const isGrid = setting?.layout === "grid";
  const columnsCount = setting?.columns_count;

  // Static "grid" layout shows everything at once; the slider shows one page.
  const itemCount = isGrid
    ? Math.min(64, Math.max(6, Math.round(columnsCount ?? 8) * 2))
    : 16;

  return (
    <div className="relative w-full" aria-label="Loading categories">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className={`grid gap-x-4 gap-y-4 xl:gap-x-6 ${gridColumnsClass(columnsCount, "two")}`}>
        {Array.from({ length: itemCount }).map((_, i) => (
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
