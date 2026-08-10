import Skeleton from "@/components/ui/Skeleton";

export function ProductsSidebarSkeleton() {
  return (
    <aside
      className="card-shadow flex max-h-[calc(100dvh-11rem)] w-80 shrink-0 self-start flex-col overflow-hidden rounded-2xl border border-border-subtle bg-background"
      aria-label="Loading filters"
    >
      <div className="flex items-center gap-3 border-b border-border-subtle bg-linear-to-b from-primary/[0.07] to-background px-5 py-4">
        <Skeleton className="size-10 shrink-0 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      <div className="overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-border-subtle px-4 pb-5 last:border-b-0"
          >
            <div className="flex items-center justify-between px-1 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            {index === 0 && (
              <Skeleton className="mb-3 h-10 w-full rounded-xl" />
            )}
            <div className="space-y-2.5 px-2">
              {Array.from({ length: 4 }).map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-3">
                  <Skeleton className="size-4.5 shrink-0 rounded-[5px]" />
                  <Skeleton
                    className={`h-3.5 ${
                      itemIndex % 2 === 0 ? "w-3/5" : "w-2/5"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
