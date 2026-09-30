import Skeleton from "@/components/ui/Skeleton";

export default function PromotionsSectionSkeleton() {
  return (
    <section className="group relative w-full overflow-hidden pb-4" aria-label="Loading promotions">
      <Skeleton className="h-5 w-48 mb-4" />
      <Skeleton className="w-full aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] rounded-xl" />
    </section>
  );
}
