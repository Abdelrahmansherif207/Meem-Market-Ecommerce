# Stitch Homepage → Section Mapping

**Design source:** Google Stitch project `6326555564353219150`, screen
`9c6a3dde1a984cfeb74a3c6a39bf0c78` ("Catch Beauty - Home"), retrieved via the
Stitch MCP and implemented as-is (no new designs were generated).

**Live CMS contract:** `GET /general/content-pages/home` returns the section
manifest (19 sections on the production backend). Sections render in the
merchant-controlled order; each section type maps to a homepage-owned
component that consumes the same endpoints the previous pipeline used.

| # | Reference section | CMS section type | Data source (existing, reused) | Static/Dynamic | Preserved interactions |
|---|---|---|---|---|---|
| 1 | Ribbon ticker (National Beauty Week) | — (fixed position, top) | — | **Static** (marketing copy, i18n) | "Explore Deals" → `/categories` |
| 2 | Hero 8-col visual + arrows/dots | `sliders` | `homePageService.fetchSectionData` → `general/sliders?slug=new-collection` | Dynamic | Swiper autoplay/arrows/dots, links `/sliders/[slug]` |
| 3 | Two editorial side cards | — | — | **Static** (design copy + design images) → `/tags`, `/categories` | — |
| 4 | Shop by Department (square tiles) | `categories` — **currently commented out** (see `DISABLED_SECTION_TYPES`) | CMS `general/categories?limit=79…` endpoint | Dynamic (disabled) | Re-enable by removing the type from `HomeSectionRenderer.tsx`; tiles → `/category/[slug]`; accent tiles; View All → `/categories` |
| 5 | (reference: none) Popular Tags | `tags` — **currently commented out** | CMS tags endpoint | Dynamic (disabled) | Chips → `/tags/[slug]` |
| 6 | "Flash Duo Deal"-style campaign banners | `banners` (adjacent sections pair into a 2-col dark+blush grid) | CMS `general/banners?slug=…&with_products=1` | Dynamic (+static CTA labels) | Banner → `/banners/[slug]`; product rails beneath |
| 7 | Daily Flash Deals strip w/ countdown | `flash-sales` | CMS flash-sales endpoint → `flashSaleService.getFlashSale(slug)` | Dynamic | Real countdown (`sale.end_date`), cards, currency refetch |
| 8 | Perks strip (Genuine / Delivery / Payments / Returns) | — (anchored after flash strip) | — | **Static** (value-prop copy, i18n) | — |
| 9 | Iconic Brands tiles | `brands` | CMS brands endpoint (`brandService` fallback) | Dynamic | Tiles → `/brands/[slug]`; View All → `/brands` |
| 10 | Product rails ("Most Wanted" style) | `products` ×5 (each = its own rail, per product-owner decision) | Each section's own `products?type=…` endpoint via existing actions | Dynamic | Card add/bag chip, wishlist, variants → PDP, currency refetch skeletons |
| 11 | Special Offers | `promotions` | Existing `PromotionsSection` (shared component, re-toned by scoped tokens) | Dynamic | Promotion tiles → `/promotions/[slug]` |
| 12 | Coupons & Vouchers (no reference equivalent — retained) | `coupons` | Existing `CouponsVouchersSection` claim/apply flow | Dynamic | Claim kept working |
| 13 | Catch Beauty Journal | — (fixed position, bottom) | — | **Static** (design copy + design images, no dead links) | — |
| 14 | Desktop chrome (top utility bar / search row / department bar) | layout-owned | `categoryMenuService`, `productService.searchProducts`, locale/currency switchers, auth/wishlist/cart stores | Dynamic | All chrome behavior preserved (search, mega menu, badges, auth modal) |
| 15 | Footer (perk strip, newsletter band, columns, payments) | layout-owned | `assembleFooterContent` (existing footer data + settings) + `categoryMenuService` top-level categories | Mostly dynamic; newsletter/payments/app badges **static** | All links/socials/contact preserved |

## Data-honesty rules applied

- **Ratings** render `4.9 ★` from the real `ratings` field. The list API does
  not expose review counts, so the mock's "(329)" is not fabricated.
- **Stock state** derives strictly from the real `quantity` threshold
  (0 → out of stock; ≤ 4 → "Only N left"; ≤ 19 → "Selling fast"; else
  "In stock"); the meter bar renders the state level, not an invented ratio.
- **BNPL installments** (Tabby/Tamara rows from the mock) render only when
  `settings.payment_gateways` enables them — currently disabled, so hidden.
- **Currency** is the real per-product currency via the canonical `Price`
  component (USD $ on the production catalog; the mock's `£`/`SAR` is not
  shipped as fact).
- **No invented API endpoints**; no mock products/prices on dynamic sections.
