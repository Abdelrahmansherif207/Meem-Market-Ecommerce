import type { CSSProperties } from "react";
import type { SectionFrontSetting } from "../types";

const shimmer = "animate-pulse rounded-xl bg-catch-border-soft";

/** Hero placeholder: the same reserved media well as the real hero/slider. */
export function CatchHeroSkeleton({
  variant = "hero",
}: {
  variant?: "hero" | "sliders";
}) {
  const isSliders = variant === "sliders";
  return (
    <div
      className={`catch-media-well rounded-2xl ${shimmer}`}
      style={
        {
          "--media-aspect": isSliders ? "1150 / 368" : "2.2 / 1",
          "--media-aspect-mobile": isSliders ? "1150 / 368" : "9 / 16",
        } as CSSProperties
      }
    />
  );
}

/** Dark hashtag strip placeholder. */
export function CatchTagsSkeleton() {
  return (
    <section
      className="w-full overflow-hidden rounded-2xl bg-black py-3"
      aria-hidden
    >
      <div className="mx-4 h-3 w-24 animate-pulse rounded bg-white/20" />
      <div className="mt-2 flex gap-2 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-white/10"
          />
        ))}
      </div>
    </section>
  );
}

/** Shelf placeholder: title row + fluid 2 / 3 / 5 card grid. */
export function CatchShelfSkeleton({
  setting,
}: {
  setting?: SectionFrontSetting;
}) {
  void setting;
  return (
    <section className="space-y-4" aria-hidden>
      <div className="flex items-center justify-between">
        <div className={`h-6 w-48 ${shimmer}`} />
        <div className={`h-4 w-16 ${shimmer}`} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-catch-border-soft bg-white p-2.5"
          >
            <div className={`aspect-square w-full ${shimmer}`} />
            <div className={`h-3 w-1/2 ${shimmer}`} />
            <div className={`h-3 w-full ${shimmer}`} />
            <div className={`h-3 w-2/3 ${shimmer}`} />
            <div className={`h-5 w-1/2 ${shimmer}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Wide-banner placeholder with the live artwork ratio. */
export function CatchBannerSkeleton() {
  return (
    <section className="w-full" aria-hidden>
      <div
        className={`catch-media-well rounded-2xl ${shimmer}`}
        style={
          {
            "--media-aspect": "1500 / 377",
            "--media-aspect-mobile": "1500 / 377",
          } as CSSProperties
        }
      />
    </section>
  );
}

/** Category rail placeholder: 4 visible mobile / 8 desktop. */
export function CatchCategoriesSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className="flex items-center justify-between">
        <div className={`h-6 w-56 ${shimmer}`} />
        <div className={`h-4 w-16 ${shimmer}`} />
      </div>
      <div className="grid grid-flow-col auto-cols-[calc((100%-2.25rem)/4)] gap-3 overflow-hidden lg:auto-cols-[calc((100%-7rem)/8)] lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-catch-border-soft bg-white p-2"
          >
            <div className={`aspect-square w-full ${shimmer}`} />
            <div className={`mx-auto h-3 w-3/4 ${shimmer}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Brand grid placeholder: 2 / 4 / 6 tiles. */
export function CatchBrandsSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className={`h-6 w-40 ${shimmer}`} />
      <div className="catch-cms-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-catch-border-soft bg-white p-3"
          >
            <div className={`aspect-[4/3] w-full ${shimmer}`} />
            <div className={`mx-auto h-3 w-1/2 ${shimmer}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Promotions placeholder: five full-bleed tiles, 2 columns, odd last spans both. */
export function CatchPromotionsSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className={`h-6 w-40 ${shimmer}`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`catch-media-well rounded-xl ${shimmer} ${
              i === 4 ? "sm:col-span-2" : ""
            }`}
            style={
              {
                "--media-aspect": "1500 / 282",
                "--media-aspect-mobile": "1500 / 282",
              } as CSSProperties
            }
          />
        ))}
      </div>
    </section>
  );
}

/** Coupon placeholder: contained 2:1 tiles, 2 / 2 / 4. */
export function CatchCouponsSkeleton() {
  return (
    <section className="space-y-4" aria-hidden>
      <div className={`h-6 w-48 ${shimmer}`} />
      <div className="catch-cms-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`aspect-[2/1] rounded-2xl ${shimmer}`} />
        ))}
      </div>
    </section>
  );
}
