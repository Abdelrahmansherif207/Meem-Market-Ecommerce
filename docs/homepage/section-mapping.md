# Catch Beauty Homepage — Section Mapping

**Status:** Phase 4 implemented (Catch Beauty visual identity on the homepage).

**Visual source:** approved Phase 2 Catch Beauty specification + live CMS
artwork. No new Stitch screens were generated for this phase.

**Live CMS contract:** `GET /general/content-pages/home` currently returns
19 sections. Sections render in the merchant-controlled order. The homepage
uses the existing endpoints and payloads; no new API endpoints were invented.

## Section mapping

| # | CMS type | Live title (EN) | Component | Data source | Behavior |
|---|---|---|---|---|---|
| 1 | `sliders` | New Collection | `CatchHeroVideoSection` → `CatchHeroVideoPlayer` (temporary) | Static `public/hero/*` campaign assets; CMS sliders section supplies the title | Campaign video hero: desktop full-width overlay banner (≈2.2:1) with centred eyebrow/title/white pill CTA; mobile 9:16 video only; CTA → `/sliders/new-collection-s2`; muted inline loop, pauses off-screen/hidden, reduced-motion poster only; CMS carousel is disabled but kept for restoration |
| 2 | `categories` | Shop by Category | `CatchCategoriesSection` | `general/categories?limit=79…` | CMS-ordered horizontal rail; 4 visible mobile, `columns_count` (max 8) desktop; every returned category rendered; tiles → `/category/[slug]`; “View all” → `/categories` |
| 3 | `tags` | Popular Tags | — (disabled) | `general/tags?…` | Intentionally renders nothing: the live CMS returns one tag (“New Arrivals”) that duplicates the New Arrivals shelf |
| 4 | `banners` | Valentine's Day | `CatchBannerSection` | `general/banners?slug=…&with_products=1` | Art-directed wide banner in a layout-reserving well; banner → `/banners/[slug]`; optional product shelf below |
| 5 | `flash-sales` | Flash Deals | `CatchFlashSaleSection` → `CatchShelfIsland` | `general/flash-sales?…` | Fluid product shelf with CMS timer/countdown, badge text and currency refetch |
| 6 | `products` | Flash Sale Products | `CatchProductShelfSection` → `CatchShelfIsland` | Section `products?type=…` endpoint | Fluid shelf (2 mobile / 3 tablet / 5 desktop); every CMS product rendered |
| 7 | `products` | New Arrivals | `CatchProductShelfSection` | Same pattern | Same |
| 8 | `banners` | New Collection | `CatchBannerSection` | `general/banners?slug=new-collection-s2&with_products=1` | Banner + shelf |
| 9 | `products` | Best Sellers | `CatchProductShelfSection` | Same pattern | Same |
| 10 | `promotions` | Special Offers | `CatchPromotionsSection` | `general/promotions?limit=6…` | All valid promotions; 1 / 2-column grid; full-bleed 1500/282 artwork with no card chrome; odd last tile spans both columns; tiles → `/promotions/[slug]` when a slug exists |
| 11 | `banners` | Back to School | `CatchBannerSection` | Same pattern | Banner + shelf |
| 12 | `products` | Deals Ending This Week | `CatchProductShelfSection` | Same pattern | Shelf; the CMS timer renders in the section header |
| 13 | `products` | Deals & Discounts | `CatchProductShelfSection` | Same pattern | Shelf |
| 14 | `banners` | Black Friday Deals | `CatchBannerSection` | Same pattern | Banner + shelf |
| 15 | `products` | Last Chance | `CatchProductShelfSection` | Same pattern | Shelf |
| 16 | `brands` | Top Brands | `CatchBrandsSection` | `general/brands?limit=8…` | All valid brands; 2 mobile / 4 tablet / `min(columns_count, brand count)` desktop; logos contained; tiles → `/brands/[slug]`; “View all” → `/brands` |
| 17 | `banners` | Cyber Monday | `CatchBannerSection` | Same pattern | Banner + shelf |
| 18 | `banners` | Summer Sale | `CatchBannerSection` | Same pattern | Banner + shelf |
| 19 | `coupons` | Coupons & Vouchers | `CatchCouponsSection` → `CatchCouponBanner` | `general/coupons?limit=8…` | Contained 2:1 tiles; 2 mobile / 2 tablet / `columns_count` (max 6) desktop; click copies the code when the API provides one |

Unknown section types render nothing (with a console warning). The `tags`
type is skipped silently because it is intentionally disabled.

> **Temporary hero swap:** the CMS `sliders` section is filtered out in
> `HomePage.tsx` and `CatchSectionRenderer` returns `null` for it, so the
> campaign video renders first without duplicate fetching. The original
> `CatchHeroSliderSection` / `CatchHeroSlider` files are untouched and can be
> restored by removing the filter and the disabled cases.

> **Banner artwork normalization:** the Valentine's Day, Black Friday, and
> Cyber Monday CMS creatives are served at 1150×368, so they render narrower
> than the 1380×260 Summer / Back-to-School strips. Local 1380×260 re-exports
> in `public/banners/` are mapped by slug in `CatchBannerSection`; remove the
> map and files once the CMS artwork is re-uploaded at the wide ratio.

## Page shell

- `src/features/home/HomePage.tsx` fetches the page manifest through
  `guardLoad` (3 retries) and wraps the content in `.catch-surface`.
- The main container is `max-w-[1440px]` with responsive padding
  (`px-3` / `sm:px-4` / `lg:px-8`) and responsive section spacing
  (`gap-y-10` / `sm:gap-y-12` / `lg:gap-y-16`).
- `CatchHelpBanner` renders after the CMS sections, inside the same ivory
  surface, and is width-aligned with the main container.
- Route-level `loading.tsx` shows the shell skeleton; each section has its
  own Suspense skeleton and `SectionErrorBoundary` fallback.
- Global API failure renders the shared `ErrorState` with a retry action.

## Product card

The canonical card lives at
`src/features/products/components/ProductCard.tsx` and is used by:

- homepage shelves (`CatchShelfIsland`)
- category listing (`CategoryProducts`)
- tag listing (`TagProductsIsland`)
- brand listing (`BrandProductsIsland`)
- promotion listing (`PromotionProductsIsland`)
- flash-sale listing (`FlashSaleProductsIsland`, `EndingSoonClient`)
- banner/slider product grids (`PaginatedProductGrid`)
- legacy home slider (`ProductSlider`)

`src/features/home/redesign/CatchProductCard.tsx` is a compatibility re-export
only; new code imports the products feature directly.

Preserved behavior:

- whole-card navigation through an overlay link (no nested interactive elements)
- wishlist heart: guests open the auth modal and the heart stays empty;
  authenticated users get an optimistic toggle with rollback
- cart: add, increment, decrement, remove; variant products link to the PDP
  instead of adding directly
- out-of-stock state (`isInStock === false`) and low-stock chip
- currency-aware `Price` rendering and the currency refetch loading state
- CMS badge text, flash-sale countdown chip, tags, brand, rating and
  review count when the API provides them

## Deliberately deferred / unchanged

- Footer visual redesign is deferred; `CatchFooter` and
  `CatchPaymentStrip` keep their current content and behavior.
- Header WIP files are untouched.
- No PDP redesign was started in this phase.
- No new dependencies were added.

## Verification (Phase 4)

- TypeScript: `tsc --noEmit` passes.
- ESLint: passes with only pre-existing warnings.
- Production build: succeeds.
- Browser matrix: EN + AR at 320, 375, 390, 430, 768, 1024 and 1440 px.
  - `document.scrollWidth === viewport` at every size (no horizontal overflow).
  - Category rail: 4 visible mobile, 8 visible desktop; 70 CMS categories,
    all scrollable.
  - Shelves: 2 / 3 / 5 visible at mobile / tablet / desktop.
  - Hero/banner wells keep the CMS aspect ratios (hero 1150/368, banner
    1500/377); no forced cropping.
  - Cart add/increment/decrement/remove verified; guest wishlist opens the
    auth modal; the currency switcher is hidden because the live CMS setting
    `currency_selection_enabled` is `false`.
  - Loading skeletons verified during the streamed response; section
    boundaries and the global error path are wired to the shared
    `ErrorState`.
