import Skeleton from "@/components/ui/Skeleton";

export function CouponCardSkeleton() {
  return (
    <div className="mx-auto flex w-64 flex-col gap-2">
      <Skeleton className="aspect-[6/7] w-full rounded-xl" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

export function CouponInputSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-10 flex-1 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  );
}
