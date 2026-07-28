import Skeleton from "@/components/ui/Skeleton";
import { ProductsSidebarSkeleton } from "./ProductsSidebarSkeleton";
import { CategorySliderSkeleton } from "./CategorySliderSkeleton";
import { MobileCategorySidebarSkeleton } from "./MobileCategorySidebarSkeleton";
import { CategoryProductsSkeleton } from "./CategoryProductsSkeleton";

export function CategoryPageSkeleton() {
  return (
    <div className="w-full" aria-label="Loading category page">
      <div className="flex items-center gap-2 max-[991px]:hidden">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex gap-5 max-[991px]:gap-0 items-stretch">
        <div className="max-[991px]:hidden block">
          <ProductsSidebarSkeleton />
        </div>
        <div className="hidden max-[991px]:flex shrink-0 -ms-4 self-stretch">
          <MobileCategorySidebarSkeleton />
        </div>
        <div className="flex-1 max-[991px]:p-3">
          <div className="max-[991px]:hidden block">
            <CategorySliderSkeleton />
          </div>
          <CategoryProductsSkeleton />
        </div>
      </div>
    </div>
  );
}
