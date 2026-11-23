import type { CSSProperties } from "react";
import type { SectionFrontSetting } from "../types";
import {
  parseIntegerSetting,
  resolveCategoryGridConfig,
} from "./categoryGrid";

const shimmer = "animate-pulse rounded-xl bg-catch-border-soft";

/** Hero placeholder: the same reserved media well as the real hero/slider. */
export function HeroSkeleton({
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
export function TagsSkeleton() {
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

/**
 * Shelf placeholder: title row + 2 mobile / 3 tablet / CMS desktop card grid,
 * matching `ProductShelfIsland`'s literal column count.
 */
export function ShelfSkeleton({
  setting,
}: {
  setting?: SectionFrontSetting;
}) {
  const desktopColumns = parseIntegerSetting(setting?.columns_count, 5);
  return (
    <section className="space-y-4" aria-hidden>
      <div className="flex items-center justify-between">
        <div className={`h-6 w-48 ${shimmer}`} />
        <div className={`h-4 w-16 ${shimmer}`} />
      </div>
      <div
        className="catch-cms-grid"
        style={
          {
            "--cms-cols-mobile": 2,
            "--cms-cols-tablet": 3,
            "--cms-cols-desktop": desktopColumns,
          } as CSSProperties
        }
      >
        {Array.from({ length: desktopColumns }).map((_, i) => (
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
export function BannerSkeleton() {
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

/**
 * Category placeholder: mirrors the resolved grid (columns, tile mode and the
 * per-breakpoint caps) so the skeleton occupies the same shape as the real
 * section. The rail layout keeps the old single-row placeholder.
 */
export function CategoriesSkeleton({
  setting,
}: {
  setting?: SectionFrontSetting;
}) {
  const config = resolveCategoryGridConfig(setting);
  const sliderColumns = parseIntegerSetting(setting?.columns_count, 8);
  // The real section renders the largest breakpoint's tile count and hides
  // the overflow per breakpoint; the placeholder does the same.
  const placeholderCount = config.maxVisible;

  return (
    <section className="space-y-4" aria-hidden>
      <div className="flex items-center justify-between">
        <div className={`h-6 w-56 ${shimmer}`} />
        <div className={`h-4 w-16 ${shimmer}`} />
      </div>
      {config.layout === "slider" ? (
        <div
          className="catch-category-rail"
          style={{ "--cat-cols": sliderColumns } as CSSProperties}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-col gap-2 rounded-2xl border border-catch-border-soft bg-white p-2"
            >
              <div className={`aspect-square w-full ${shimmer}`} />
              <div className={`mx-auto h-3 w-3/4 ${shimmer}`} />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="catch-category-grid"
          data-cat-tile-mobile={config.mobile.tileMode}
          data-cat-tile-tablet={config.tablet.tileMode}
          data-cat-tile-desktop={config.desktop.tileMode}
          style={
            {
              "--cat-cols-mobile": config.mobile.columns,
              "--cat-cols-tablet": config.tablet.columns,
              "--cat-cols-desktop": config.desktop.columns,
            } as CSSProperties
          }
        >
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <div
              key={i}
              className="catch-category-tile"
              data-cat-hide-mobile={i >= config.mobile.slots ? "true" : undefined}
              data-cat-hide-tablet={i >= config.tablet.slots ? "true" : undefined}
              data-cat-hide-desktop={i >= config.desktop.slots ? "true" : undefined}
            >
              <div className="catch-category-tile__image">
                <div className={`h-full w-full ${shimmer}`} />
              </div>
              <div className={`mx-auto h-3 w-3/4 ${shimmer}`} />
              <div className={`mx-auto h-2.5 w-1/2 ${shimmer}`} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** Brand grid placeholder: 2 mobile / 4 tablet / CMS desktop columns. */
export function BrandsSkeleton({
  setting,
}: {
  setting?: SectionFrontSetting;
}) {
  const desktopColumns = parseIntegerSetting(setting?.columns_count, 6);
  return (
    <section className="space-y-4" aria-hidden>
      <div className={`h-6 w-40 ${shimmer}`} />
      <div
        className="catch-cms-grid"
        style={
          {
            "--cms-cols-mobile": 2,
            "--cms-cols-tablet": 4,
            "--cms-cols-desktop": desktopColumns,
          } as CSSProperties
        }
      >
        {Array.from({ length: desktopColumns }).map((_, i) => (
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
export function PromotionsSkeleton() {
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
export function CouponsSkeleton() {
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

/**
 * Route-level placeholder for `app/[locale]/loading.tsx`, built from the
 * section skeletons so navigation never pulls in the retired home sections.
 */
export function PageSkeleton({ sections = 4 }: { sections?: number }) {
  const blocks = [
    <HeroSkeleton key="hero" />,
    <ShelfSkeleton key="shelf" />,
    <CategoriesSkeleton key="categories" />,
    <CouponsSkeleton key="coupons" />,
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-y-10 px-3 py-6 sm:gap-y-12 sm:px-4 lg:gap-y-16 lg:px-8">
      {Array.from({ length: sections }).map((_, i) => (
        <div key={i}>{blocks[i % blocks.length]}</div>
      ))}
    </main>
  );
}
