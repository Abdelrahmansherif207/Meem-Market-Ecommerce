import type { SectionFrontSetting } from "../types";

const shimmer = "animate-pulse rounded-xl bg-neutral-100";

/** Screen hero placeholder: container-width block with rounded corners. */
export function CatchHeroSkeleton() {
  return (
    <div className={`h-[313px] w-full rounded-md sm:h-[300px] lg:h-[313px] ${shimmer}`} />
  );
}

/** Screen shelf placeholder: title row + a row of 145px slide tiles. */
export function CatchShelfSkeleton({ setting }: { setting?: SectionFrontSetting }) {
  const cols = Math.max(4, Math.min(8, Math.round(setting?.columns_count ?? 8)));
  return (
    <section className="space-y-4" aria-hidden>
      <div className="flex items-center justify-between">
        <div className={`h-6 w-48 ${shimmer}`} />
        <div className={`h-4 w-16 ${shimmer}`} />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="w-[145px] shrink-0 rounded-lg bg-white">
            <div className={`mx-auto h-[150px] w-[130px] ${shimmer}`} />
            <div className={`mt-1 h-4 w-full rounded-md ${shimmer}`} />
            <div className={`mt-1 h-4 w-20 rounded-md ${shimmer}`} />
            <div className={`mt-1 h-8 w-full rounded-md ${shimmer}`} />
            <div className={`mt-1 h-11 w-full rounded-md ${shimmer}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Screen wide-banner placeholder. */
export function CatchBannerSkeleton() {
  return (
    <section className="w-full space-y-6" aria-hidden>
      <div className={`h-[170px] w-full rounded-2xl sm:h-[230px] lg:h-[300px] ${shimmer}`} />
    </section>
  );
}

/** Screen category tiles placeholder. */
export function CatchCategoriesSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className={`mx-auto h-6 w-56 ${shimmer}`} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-100 bg-white p-3">
            <div className={`h-16 w-16 rounded-full ${shimmer}`} />
            <div className={`h-3 w-3/4 ${shimmer}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Screen coupon banner-grid placeholder: full-width + 2×2 halves. */
export function CatchCouponsSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className={`h-6 w-48 ${shimmer}`} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={`h-40 rounded-2xl sm:h-52 md:col-span-2 lg:h-56 ${shimmer}`} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-36 rounded-2xl sm:h-44 lg:h-52 ${shimmer}`} />
        ))}
      </div>
    </section>
  );
}
