import Skeleton from "@/components/ui/Skeleton";

export function NavSkeleton() {
  return (
    <nav aria-label="Loading categories" className="w-full">
      <div className="flex h-11 items-center gap-3 rounded-md">
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="flex flex-1 gap-4 sm:gap-6 md:gap-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </nav>
  );
}
