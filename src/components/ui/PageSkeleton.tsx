import { cn } from "@/shared/utils/cn";

const shimmer = "animate-pulse rounded-xl bg-meem-border-soft";

interface SkeletonProps {
  className?: string;
}

/**
 * Neutral page placeholder for routes that have no route-specific loading UI.
 * Uses the current Meem surface and spacing tokens so the fallback never
 * flashes the retired storefront design.
 */
export function PageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("meem-surface", className)} aria-hidden>
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-3 py-6 sm:px-4 lg:px-8">
        <div className={`h-8 w-56 ${shimmer}`} />
        <div className="space-y-3">
          <div className={`h-4 w-full max-w-2xl ${shimmer}`} />
          <div className={`h-4 w-full max-w-xl ${shimmer}`} />
          <div className={`h-4 w-2/3 max-w-lg ${shimmer}`} />
        </div>
        <div className="grid gap-4 pt-2 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-40 flex-col gap-3 rounded-2xl border border-meem-border-soft bg-white p-4"
            >
              <div className={`h-4 w-1/2 ${shimmer}`} />
              <div className={`h-3 w-full ${shimmer}`} />
              <div className={`h-3 w-5/6 ${shimmer}`} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/**
 * Single block placeholder for a CMS section whose final shape is unknown
 * until its server data resolves.
 */
export function SectionSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-56 w-full animate-pulse rounded-2xl bg-meem-border-soft",
        className,
      )}
      aria-hidden
    />
  );
}
