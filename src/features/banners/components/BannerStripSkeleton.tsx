import Skeleton from "@/components/ui/Skeleton";

export default function BannerStripSkeleton() {
  return (
    <section className="w-full" aria-label="Loading banner strip">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[16/9] sm:aspect-[4/3] w-full rounded-xl" />
        ))}
      </div>
    </section>
  );
}
