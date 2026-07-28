import Skeleton from "@/components/ui/Skeleton";
import { FastShippingSectionSkeleton } from "./FastShippingSectionSkeleton";
import { FastShippingSummarySkeleton } from "./FastShippingSummarySkeleton";

export function FastShippingCartContentSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading fast shipping cart">
      <Skeleton className="h-7 w-24" />
      <FastShippingSectionSkeleton />
      <FastShippingSummarySkeleton />
    </div>
  );
}
