import Skeleton from "@/components/ui/Skeleton";

export function MobileCategorySidebarSkeleton() {
  return (
    <div className="w-[85px] min-h-full bg-[#f4f5f7]" aria-label="Loading categories">
      <div className="flex flex-col items-center gap-6 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 px-1 w-full">
            <Skeleton className="size-[56px] rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
