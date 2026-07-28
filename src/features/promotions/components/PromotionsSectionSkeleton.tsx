import Skeleton from "@/components/ui/Skeleton";

export default function PromotionsSectionSkeleton() {
  return (
    <section className="group relative w-full pb-4" aria-label="Loading promotions">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="flex gap-4 overflow-hidden px-4 md:px-20">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[16/5] w-full flex-shrink-0 rounded-xl" />
        ))}
      </div>
    </section>
  );
}
