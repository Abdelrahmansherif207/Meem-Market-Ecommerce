import Skeleton from "@/components/ui/Skeleton";
import { ProductGallerySkeleton } from "./ProductGallerySkeleton";
import { ProductInfoSkeleton } from "./ProductInfoSkeleton";
import { ProductVariantsSkeleton } from "./ProductVariantsSkeleton";
import { ProductActionsSkeleton } from "./ProductActionsSkeleton";
import { ProductDeliveryInfoSkeleton } from "./ProductDeliveryInfoSkeleton";
import { ProductReviewsSkeleton } from "./ProductReviewsSkeleton";

export function ProductDetailsSkeleton() {
  return (
    <div className="py-6" aria-label="Loading product details">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)_minmax(300px,1fr)] lg:gap-8">
        <aside className="space-y-6">
          <ProductDeliveryInfoSkeleton />
          <ProductActionsSkeleton />
        </aside>

        <main className="space-y-8 border-x border-border/40 px-0 lg:px-6">
          <ProductInfoSkeleton />
          <ProductVariantsSkeleton />

          <section>
            <Skeleton className="mb-3 h-5 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </section>

          <section>
            <Skeleton className="mb-3 h-5 w-32" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-4 text-center">
                  <Skeleton className="mx-auto mb-1 h-3 w-16" />
                  <Skeleton className="mx-auto h-4 w-12" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <Skeleton className="mb-3 h-5 w-24" />
            <ProductReviewsSkeleton />
          </section>
        </main>

        <aside className="w-full">
          <ProductGallerySkeleton compact />
        </aside>
      </div>
    </div>
  );
}
