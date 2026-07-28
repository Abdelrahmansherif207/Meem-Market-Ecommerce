## Changes

### New Feature: `src/features/brands/`

**types.ts**
- `BrandImage` — `{ desktop: string; mobile: string }`
- `Brand` — `{ id, name, slug, image: BrandImage, status }`
- `BrandProduct` — product shape from brand endpoints: `{ id, name, slug, price, price_after_discount, rating, image: { thumbnail } }`
- `BrandDetail` extends `Brand` with `products: BrandProduct[]`

Note: `BrandProduct` uses `price_after_discount` and `rating` fields (different from `CategoryProduct` which uses `current_price` and `ratings`).

**services/brandService.ts**
- `getBrands(locale, limit?)` → `GET /general/brands?limit=N`
- `getBrand(slug, locale)` → `GET /general/brands/{slug}`
- `getCachedBrands` — React `cache()` wrapper

### Task 1: Brand Listing Page — `/brands`

**components/BrandCard.tsx** — `"use client"` card with:
- Circular brand image (with broken image fallback showing first letter)
- Brand name below
- Links to `/{locale}/brands/{slug}`
- Priority loading for first 6 items

**components/BrandListingClient.tsx** — `"use client"` with:
- Search input filtering brands by name (case-insensitive)
- Sort dropdown (A-Z, Z-A, Newest)
- Empty state: "No brands match" + clear button or "No brands yet" + "Browse Products" CTA (search vs no search)
- Grid of BrandCard components

**components/BrandListingPage.tsx** — Server component wrapping `BrandListingClient`. Handles network error state with retry link to home.

**components/skeletons/BrandListingSkeleton.tsx** — 12 circular skeleton placeholders in grid + search bar skeleton.

**Route: `src/app/[locale]/brands/page.tsx`** — `<Suspense>` with skeleton fallback, metadata.

### Task 2: Brand Detail Page — `/brands/{slug}`

**components/BrandDetailPage.tsx** — Server component that:
- Fetches brand detail via `brandService.getBrand`
- Renders circular brand image + name as hero
- Product grid with `ProductCard`, mapping `price_after_discount` → `price`, `rating` → omitted (no matching UI)
- **Loading:** `<Suspense>` with `BrandDetailSkeleton`
- **Empty products:** Brand info shown + "No products from this brand yet." + "Browse All Products" CTA
- **Network error:** "Failed to load brand" + "Back to Brands" link

**components/skeletons/BrandDetailSkeleton.tsx** — Breadcrumb placeholder + circular image + 6 product card skeletons.

**Route: `src/app/[locale]/brands/[slug]/page.tsx`** — Pre-validates existence (404 → `notFound()`), `<Suspense>` with skeleton, `<Breadcrumb>` (Home > Brands > slug), `generateMetadata` with brand name + OG image.

### Task 3: Homepage Brand Strip

**components/BrandsStripClient.tsx** — `"use client"` Swiper with:
- Circular brand cards via `BrandCard` (reused from listing)
- `Autoplay` module with `pauseOnMouseEnter: true`
- Left/right `BannerArrows` navigation
- Responsive breakpoints: 3 → 4 → 5 → 8 slides
- `SectionTitle` with optional `title` prop

**components/BrandsStripSection.tsx** — Server component, fetches 8 brands via `getBrands(locale, 8)`. Returns `null` on error or empty.

**components/skeletons/BrandsStripSkeleton.tsx** — 8 circular skeleton placeholders in a horizontal strip.

### SectionRenderer.tsx
- `"brands"` type now maps to `BrandsStripSection` + `BrandsStripSkeleton` (replaced previous `FlashSalesSection` mapping)
- `"flash-sales"` and `"coupons"` remain on `FlashSalesSection`

### Task 5: Brand Filter Dropdown
Already exists in the category sidebar via the products endpoint's `filters.brand` array. The current implementation shows brands as checkboxes in `ProductsSidebar`. Enhancement (logo thumbnails) deferred — requires fetching from `GET /general/brands` separately.

### Task 4: "Shop by Brand" Section — BLOCKED
Blocked by **KAN-80**: `GET /general/brands-products` returns a flat product list instead of brands with nested products. Cannot group by brand until API is fixed.

## API Bugs
- **KAN-80**: `GET /general/brands-products` returns flat products, not grouped by brand
- `lang` header ignored by backend — all data returns in Arabic regardless of `Accept-Language` or `lang` header
