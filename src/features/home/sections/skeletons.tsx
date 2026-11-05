import Skeleton from "@/components/ui/Skeleton";

/**
 * Homepage-only skeletons matching the Sovereign Rose section shapes.
 * Shared skeletons used by `app/[locale]/loading.tsx` are untouched.
 */

export function HomeHeroSkeleton() {
  return (
    <div className="home-container" aria-hidden>
      <Skeleton className="h-[300px] w-full rounded-xl sm:h-[380px] lg:h-[480px]" />
    </div>
  );
}

export function HomeChipsSkeleton() {
  return (
    <div className="home-container" aria-hidden>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[88px] shrink-0">
            <Skeleton className="size-20 rounded-full" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RailBar() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-(--home-stroke) bg-white"
      aria-hidden
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-16" />
      </div>
    </div>
  );
}

export function HomeRailSkeleton() {
  return (
    <div className="home-container" aria-hidden>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-2 gap-3 overflow-hidden sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <RailBar key={i} />
        ))}
      </div>
    </div>
  );
}

export function HomeFlashSkeleton() {
  return (
    <div className="home-container" aria-hidden>
      <div className="home-flash-frame" aria-hidden>
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-hidden sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <RailBar key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomeBannerSkeleton() {
  return (
    <div className="home-container" aria-hidden>
      <div className="mb-4 h-6 w-40">
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-[170px] w-full rounded-xl sm:h-[230px] lg:h-[300px]" />
    </div>
  );
}

export function HomeRingsSkeleton() {
  return (
    <div className="home-container" aria-hidden>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-3 justify-items-center gap-4 py-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="size-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}
