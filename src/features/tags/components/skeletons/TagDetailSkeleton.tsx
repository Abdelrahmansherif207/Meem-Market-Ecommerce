export default function TagDetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="h-8 w-48 animate-pulse rounded bg-surface" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square animate-pulse rounded-xl bg-surface" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
