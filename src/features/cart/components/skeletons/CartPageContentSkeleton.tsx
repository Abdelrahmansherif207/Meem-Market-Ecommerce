import Skeleton from "@/components/ui/Skeleton";
import { CartSectionSkeleton } from "./CartSectionSkeleton";
import { CartSummarySkeleton } from "./CartSummarySkeleton";

export function CartPageContentSkeleton() {
  return (
    <div className="space-y-10" aria-label="Loading cart">
      <Skeleton className="h-7 w-24" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CartSectionSkeleton />
          <CartSectionSkeleton />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CartSummarySkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
