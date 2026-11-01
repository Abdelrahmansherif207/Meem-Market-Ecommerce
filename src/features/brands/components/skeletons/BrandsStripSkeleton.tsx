import Skeleton from "@/components/ui/Skeleton";
import { gridColumnsClass } from "@/shared/utils/gridClasses";
import type { SectionFrontSetting } from "@/features/home/types";

interface BrandsStripSkeletonProps {
  setting?: SectionFrontSetting;
}

export default function BrandsStripSkeleton({ setting }: BrandsStripSkeletonProps) {
  const count = Math.max(1, Math.min(8, Math.round(setting?.columns_count ?? 8)));

  return (
    <section className="w-full pb-4" aria-label="Loading brands">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className={`grid gap-4 ${gridColumnsClass(count, "two")}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border-subtle p-3">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
