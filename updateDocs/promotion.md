## Changes

### New Feature: `src/features/promotions/`

**types.ts**
- `PromotionImage` — `{ desktop: string; mobile: string }`
- `Promotion` — `{ id, name, slug, status, image }`
- `PromotionDetail` extends `Promotion` with `products: PromotionProduct[]`
- `PromotionProduct` — product shape returned by `/general/promotions/{slug}` with `{ id, name, slug, price, current_price, has_variants, quantity, in_stock, is_fast_shipping_available, ratings, image, discount_active, flash_sale_active }`

**services/promotionService.ts**
- `getPromotions(locale, limit?)` → `GET /general/promotions?limit=10`
- `getPromotion(slug, locale)` → `GET /general/promotions/{slug}`

### Task 1: Homepage Promotion Banner Section

**components/PromotionsSection.tsx** — Server component that fetches promotions list via `promotionService.getPromotions`. Returns `null` on error or empty (satisfies loading/empty/error states). Delegates rendering to `PromotionsSectionClient`.

**components/PromotionsSectionClient.tsx** — `"use client"` Swiper carousel with:
- Desktop/mobile image switching via `<picture>` + `<source media="(min-width: 640px)">`
- Promotion name overlay with gradient at bottom
- Links to `/{locale}/promotions/{slug}`
- `Autoplay`, `Navigation`, `Pagination` modules
- `BannerArrows` for prev/next navigation
- Responsive breakpoints: 640px/768px/1024px

**components/PromotionsSectionSkeleton.tsx** — 3 banner-shaped `Skeleton` placeholders.

**SectionRenderer.tsx** — `"promotions"` type now maps to `PromotionsSection` (instead of `FlashSalesSection`). Skeleton maps to `PromotionsSectionSkeleton`. `"flash-sales"`, `"coupons"`, `"brands"` remain on `FlashSalesSection`.

### Task 2: Promotion Detail Page

**components/PromotionDetailPage.tsx** — Server component that:
- Fetches promotion detail via `promotionService.getPromotion`
- **Loading:** Wrapped in `<Suspense>` with `PromotionDetailSkeleton`
- **Empty products:** Renders hero banner + name + "No products available for this promotion." text
- **Error (fetch throws):** Renders "Failed to load promotion" with link to homepage
- Renders hero banner (`<picture>` responsive), promotion name as `<h1>`, product grid with `ProductCard`

**components/PromotionDetailSkeleton.tsx** — Breadcrumb placeholder + hero skeleton + 6 product card skeletons.

**Route: `src/app/[locale]/promotions/[slug]/page.tsx`**
- `generateMetadata` fetches promotion name and OG image for SEO
- Pre-validates promotion exists before rendering (404 → `notFound()`)
- `<Breadcrumb>` with home + slug
- `<Suspense>` with `PromotionDetailSkeleton` fallback

