# Product Details Page — Stitch screen mapping

Source screens (Stitch MCP, project `15869096413823851060` — "Pixel-Perfect Website Replicator"):

| Screen | Screen ID | Downloaded HTML |
| --- | --- | --- |
| Nice One - Desktop Product Details Page | `e29544601e5148008190a5cb1f81d6e5` (1280×5828) | `stitch-src/details-desktop.html` |
| Nice One - Mobile Product Details Page | `a9c3aa0eccdf497d911b5e840fb28b99` (390×5004) | `stitch-src/details-mobile.html` |

Implemented as **one responsive composition** (`src/features/products/components/niceone/`)
covering both breakpoints; the old components (`ProductInfo`, `ProductGallery`,
`ProductActions`, `ProductVariants`, `ProductReviews`, ...) are kept in the repo
untouched and simply unused.

## Hard rules honored

- **Zero logic/API changes** — services, server actions, `useCartActions`,
  `useCurrencyRefetch`, `ReviewForm`, wishlist/cart stores, and the RSC data
  flow in `ProductDetailsPage` / `ProductDetailIsland` were **not** modified
  (only the JSX composition shell swapped).
- Design-only values (no backend support) are **static**, mirroring the
  data-honesty policy from `docs/homepage/static-sections.md`.

## Palette mapping (Stitch → app `@theme` tokens)

| Stitch value (screen) | App token |
| --- | --- |
| CTA `#1b1b1b` / ink `#222222` | `--color-ink` / `--color-secondary` (Button `variant="secondary"`) |
| Price red `#fa1f67` / `#e6004c`; countdown pill; "flash" badge | `--color-discount` |
| Discount pill bg `#ffe...` rose | `--color-primary-tint` + `border-discount/20` |
| Page bg `#f8f9fa`/`#fbfbfb` | body `--color-background` |
| Borders `#e5e7eb` / `#f0f0f2` | `--color-line` |
| Muted `#6b7280` | `--color-neutral` / text tokens |
| Bundle band `#f0f6fc` | scoped `--pdp-band` = `--color-primary-tint` (`styles/pdp.css`) |
| Stars amber `#fbbf24`, verified check emerald | `fill-yellow-400`, `--color-success` |
| Tabby `#3efebe` / Tamara `#fcdcd0` badges | kept exact (third-party brands, `styles/pdp.css`) |
| Help-band purple, header, footer | supplied by the shared layout (`CatchHeader`/`CatchFooter`) — out of this scope |

## Stitch block → component → data source

| Stitch block | New component | Data source |
| --- | --- | --- |
| Breadcrumb trail | `NiceOneBreadcrumb` (replaces shared `Breadcrumb` on this page) | product `categories` (server, unchanged logic) |
| Hero card: vertical thumb rail + main image + lightbox | `NiceOneGallery` | `getSortedImages` (API images) |
| Countdown pill `18:22:05` | `NiceOneCountdown` | **Live** from `end_date` when `has_flash_sale`/`has_discount`; hidden otherwise |
| Title, stars `4.9 (255)`, price `94 · 197.00 · -52%`, VAT | `NiceOneHeroInfo` | API + existing price utils; **VAT note is static** |
| Wishlist circle heart | `NiceOneWishlistHeart` | existing `useWishlistActions` (incl. variant guard) |
| "Want to pay in installments?" Tabby/Tamara | `NiceOneInstallmentsWidget` | **static** (no BNPL backend) |
| Variant options (not shown in screens; required by cart logic) | `NiceOneVariantSelector` (ink-bordered chips) | API `variants` |
| Add To Bag / quantity stepper | `NiceOneBuyBox` (desktop), `NiceOneStickyBar` (mobile fixed) | existing `useCartActions` (same payload as `ProductActions`) |
| Description / How to use / About the brand / Specifications accordion | `NiceOneInfoAccordions` | Description = API HTML via `ProductDescription`; Specifications = SKU + dimensions; **"How to use"/"About the brand" hidden** (no API field) |
| Brand authenticity card + "View all" | `NiceOneBrandCard` | first category as anchor (no brand field); authenticity line **static** |
| "Usually bought together" band | `NiceOneBundleSection` | `related_products` slice; **Stitch-identical carousel**: main card + next-item preview box with chevron + index dots (plain state, wrap-around, no Swiper library); hidden when empty |
| "Recommended Products" row/cards + "Ends in" badges + quick-add | `NiceOneRecommendedRail` / card | `related_products` (same items the old slider received); flash items get an honest "Flash deal" badge (no per-card end dates in API) |
| Customer reviews card, sort, Add Review, list | `NiceOneReviewsSection` | API reviews via **existing `ReviewForm` + auth modal**; sort is client-side; `Helpful/Reply` are **static**; usernames masked client-side (design has no review dates in the payload → none rendered) |
| Sticky bottom bar (Total Price + ADD TO BAG) | `NiceOneStickyBar` (`lg:hidden`) | existing `useCartActions`; stacked above `MobileBottomNav` |
| Loading states | `Skeleton` usage inside each component | currency `isRefreshing` from the island (unchanged) |

## i18n

New namespace `niceOnePdp` added to `messages/en.json` + `messages/ar.json`
(VAT, installments, add-to-bag, accordions, reviews, band titles, flash
badge, ...). Reusable legacy strings keep coming from the `product`
namespace (in-stock, SKU, quantity, review form, dimensions).

## Notes / caveats

- The screens bake in SAR `ر.س`; the implementation keeps the app's
  dynamic currency resolution (`useDisplayCurrency`) — label/format follows
  the selected currency, same as the rest of the site.
- Initial add quantity is fixed to 1 per the screens; multi-quantity is
  handled by the pill stepper after first add (same as product cards).
- Pre-existing (untouched, unrelated) type error in the user's uncommitted
  home redesign: `src/features/home/redesign/CatchHeroSliderSection.tsx:79`
  — `detail.products` is not on `Slider` type.
