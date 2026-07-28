import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/shared/utils/cn";
import type { SectionFrontSetting } from "../../types";

interface ContentSectionSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function ContentSectionSkeleton({ setting }: ContentSectionSkeletonProps) {
  const columns = setting?.columns_count ?? 8;
  const isCircle = setting?.shape === "circle";

  return (
    <div className="w-full" aria-label="Loading categories">
      <Skeleton className="h-5 w-48 mb-4" />
      <div
        className="grid gap-x-15 gap-y-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, 8)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: Math.min(columns, 8) }).map((_, i) => (
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
