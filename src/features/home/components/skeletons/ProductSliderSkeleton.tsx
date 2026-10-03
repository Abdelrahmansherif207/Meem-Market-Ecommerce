import Skeleton from "@/components/ui/Skeleton";

export const PRODUCT_SLIDER_CARD_WIDTHS =
  "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-24px)/4)] lg:w-[calc((100%-56px)/8)]";

export function ProductSliderRowSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-6 sm:px-10 lg:px-12">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`${PRODUCT_SLIDER_CARD_WIDTHS} flex-shrink-0`}>
          <Skeleton className="w-full aspect-square rounded-xl mb-2" />
          <div className="space-y-1.5 px-0.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-5 w-16 mt-1.5 px-0.5" />
        </div>
      ))}
    </div>
  );
}

export default function ProductSliderSkeleton() {
  return (
    <div className="group relative w-full overflow-hidden pb-4" aria-label="Loading products">
      <div className="px-6 sm:px-10 lg:px-12 mb-4">
        <Skeleton className="h-5 w-48" />
      </div>
      <ProductSliderRowSkeleton />
    </div>
  );
}
