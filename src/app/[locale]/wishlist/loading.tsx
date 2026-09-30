import Skeleton from "@/components/ui/Skeleton";
import { WishlistGridSkeleton } from "@/features/wishlist/components/WishlistGridSkeleton";

export default function Loading() {
  return (
    <div className="py-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-8 w-56" />
      <div className="mt-6">
        <WishlistGridSkeleton />
      </div>
    </div>
  );
}
