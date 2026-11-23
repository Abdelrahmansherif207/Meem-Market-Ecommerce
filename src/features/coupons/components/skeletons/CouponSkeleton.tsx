import Skeleton from "@/components/ui/Skeleton";

export function CouponCardSkeleton() {
  return (
    <div className="mx-auto flex w-64 flex-col gap-2">
      <Skeleton className="aspect-[6/7] w-full rounded-xl" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
