import Skeleton from "@/components/ui/Skeleton";

export function ProductsSidebarSkeleton() {
  return (
    <aside className="w-80 shrink-0 border border-border-subtle" aria-label="Loading filters">
      <div className="max-h-[calc(100vh-200px)] overflow-y-hidden space-y-1 p-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-3 space-y-3">
            <Skeleton className="h-4 w-24" />
            {i === 0 && (
              <div className="relative mb-3">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            )}
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="size-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
