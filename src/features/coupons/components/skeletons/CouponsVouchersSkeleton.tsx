import Skeleton from "@/components/ui/Skeleton";

export default function CouponsVouchersSkeleton() {
  return (
    <section className="group relative w-full pb-4" aria-label="Loading coupons">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="flex gap-3 overflow-hidden px-4 md:px-20">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-3/4 w-1/2 flex-shrink-0 rounded-xl md:w-1/4"
          />
        ))}
      </div>
    </section>
  );
}
