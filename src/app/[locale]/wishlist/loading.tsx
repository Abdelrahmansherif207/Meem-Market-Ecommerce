import { WishlistGridSkeleton } from "@/features/wishlist/components/WishlistGridSkeleton";

export default function Loading() {
  return (
    <div className="py-6">
      <div className="h-5 w-40 animate-pulse rounded bg-surface" />
      <div className="mt-6 h-8 w-56 animate-pulse rounded bg-surface" />
      <div className="mt-6">
        <WishlistGridSkeleton />
      </div>
    </div>
  );
}
