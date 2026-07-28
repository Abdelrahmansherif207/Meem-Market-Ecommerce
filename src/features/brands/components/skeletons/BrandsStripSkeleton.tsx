import Skeleton from "@/components/ui/Skeleton";

export default function BrandsStripSkeleton() {
  return (
    <section className="w-full pb-4" aria-label="Loading brands">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="flex gap-4 overflow-hidden px-4 md:px-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-24">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}
