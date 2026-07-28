import Skeleton from "@/components/ui/Skeleton";
import { CartPageContentSkeleton } from "@/features/cart/components/skeletons/CartPageContentSkeleton";

export default function Loading() {
  return (
    <div className="py-6 min-h-screen">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="mt-6">
        <CartPageContentSkeleton />
      </div>
    </div>
  );
}
