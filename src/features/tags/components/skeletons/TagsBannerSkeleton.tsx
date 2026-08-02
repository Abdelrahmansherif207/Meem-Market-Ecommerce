import Skeleton from "@/components/ui/Skeleton";

export default function TagsBannerSkeleton() {
  return (
    <section className="w-full overflow-hidden rounded-2xl bg-surface">
      <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </section>
  );
}
