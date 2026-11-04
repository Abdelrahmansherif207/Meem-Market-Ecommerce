# Meem Market — Homepage Endpoint Results

**Source backend:** `https://meem.mohammedtareq.me/api/v1` (set in `.env` → `NEXT_PUBLIC_API_URL`, inlined at build time)
**Generated:** 2026-11-03 · **Sections from CMS:** 19 · **Page:** `/general/content-pages/home`

> **Root cause of the earlier "empty homepage":** the app was previously built &
> served against `catch.mohammedtareq.me` (mostly empty CMS, DB errors on
> products). `.env` was switched to `meem.mohammedtareq.me/api/v1`, and because
> `NEXT_PUBLIC_*` values are **baked in at `next build` time**, a rebuild +
> server restart was required. All requests now hit Meem successfully.

---

## 1 · CMS homepage section map (19 sections, in backend order)

| # | Type | Title | Front settings | Endpoint |
|---|------|-------|----------------|----------|
| 1 | sliders | New Collection | autoplay, speed 5000 | `general/sliders?slug=new-collection` |
| 2 | categories | Shop by Category | **grid, 8 cols, square shape** | `general/categories?limit=79&categoriesId=1…79` |
| 3 | tags | Popular Tags | autoplay, speed 3000 | `general/tags?limit=10&tagsId=1,2,3,6,7,8,13,14` |
| 4 | banners | Valentine's Day | cols 5, autoplay off | `general/banners?slug=valentines-day&with_products=1` |
| 5 | flash-sales | Flash Deals | grid, 5 cols, show_timer (timer_end `2026-09-04`, already past), theme colorful, autoplay 4000 | `general/flash-sales?limit=10&flashSalesId=2,3,4,5` |
| 6 | products | Flash Sale Products | cols 5, badge `FLASH SALE` | `general/products?type=flash_sales_product` |
| 7 | products | New Arrivals | cols 5, badge `NEW` | `general/products?type=new_arrivals` |
| 8 | banners | New Collection | cols 5, autoplay off | `general/banners?slug=new-collection&with_products=1` |
| 9 | products | Best Sellers | cols 5 | `general/products?type=best_product_sales` |
| 10 | promotions | Special Offers | grid, 3 cols | `general/promotions?limit=6&promotionsId=7,1,3,13,11` |
| 11 | banners | Back to School | cols 5, autoplay off | `general/banners?slug=back-to-school&with_products=1` |
| 12 | products | Deals Ending This Week | cols 5, show_timer (`2026-09-06`, past), badge `ENDING SOON` | `general/products?type=flash_sales_end_week` |
| 13 | products | Deals & Discounts | cols 5, badge `SALE` | `general/products?type=all_product_discounts` |
| 14 | banners | Black Friday Deals | cols 5, autoplay off | `general/banners?slug=black-friday-deals&with_products=1` |
| 15 | products | Last Chance | cols 5, badge `LOW STOCK` | `general/products?type=product_discount_today_or_low_qty` |
| 16 | brands | Top Brands | grid, 8 cols | `general/brands?limit=8&brandsId=12,14,1,3,4,5,6,10` |
| 17 | banners | Cyber Monday | cols 5, autoplay off | `general/banners?slug=cyber-monday&with_products=1` |
| 18 | banners | Summer Sale | cols 5, autoplay off | `general/banners?slug=summer-sale&with_products=1` |
| 19 | coupons | Coupons & Vouchers | grid, 4 cols | `general/coupons?limit=8&couponsId=1,2,3,7,8,12,9,14` |

Long `categoriesId[0..N]` query arrays shortened to `…=id1,id2,…` for readability; the app always uses the exact CMS-provided endpoint string.

---

## 2 · Endpoint results (all `HTTP 200 · success: true`, `lang: en`)

| Endpoint | Count | Sample data |
|----------|------:|-------------|
| `general/content-pages/home` | **19 sections** | order 1→19 as above, `is_active: true` |
| `general/sliders?slug=new-collection` | 1 slide | **"New Collection"** (single-object payload) |
| `general/categories?limit=79…` (grid) | **79 categories** | Face, Skincare, Eyes, Lips, Fragrance tree w/ products_count |
| `general/categories?limit=16 …` (Best) | 16 | Eyes (18), Highlighter (4), Bronzer (6), Blush (5), Blush & Bronzer (13) … |
| `general/categories?parent_only=1 …` | 15 | Eyeshadow (2), Eyes (18), Highlighter (4), Contour (1), Bronzer (6) … |
| `general/sliders?…` (date-window probe) | 10 | includes "Cyber Monday" |
| `general/tags?limit=10 …` | 10 | Sustainable, Natural Ingredients, Unisex, Women, Men, Sale, Best Seller, New Arrival, Limited Edition, Gift Set (+ mehr in full list) |
| `general/banners?slug=valentines-day` | banner + **9 products** | "Valentine's Day" — Romantic gifts and offers |
| `general/banners?slug=new-collection` | banner + **17 products** | "New Collection" — Discover our latest fashion trends |
| `general/banners?slug=back-to-school` | banner + **16 products** | "Back to School" — Special offers on school supplies |
| `general/banners?slug=black-friday-deals` | banner + **11 products** | "Black Friday Deals" — Massive discounts on electronics |
| `general/banners?slug=cyber-monday` | banner + **12 products** | "Cyber Monday" — Exclusive online deals |
| `general/banners?slug=summer-sale` | banner + **14 products** | "Summer Sale" — Up to 50% off on all items |
| `general/flash-sales?limit=10 & flashSalesId=2,3,4,5` | **3 active sales** | Black Friday (ends 2026-12-05) · Ramadan Offers (ends 2026-11-18) · Fashion Week Sale (ends 2026-11-13) |
| `general/flash-sales/black-friday` (detail) | 6 products | full detail incl. images |
| `general/products?limit=20&order=desc&order_price=asc` | 20 | e.g. USB-C Multiport Docking Station — 60 USD, qty 200 |
| `general/products?type=new_arrivals` | 10 | e.g. RGB Mechanical Gaming Keyboard (0 qty → "out of stock" path, variants) |
| `general/products?type=flash_sales_product` | 10 | e.g. Huda Beauty Faux Filter Foundation — 39.99 USD, qty 150, variants |
| `general/products?type=flash_sales_end_week` | 8 | e.g. Face Mask Spatula — 6.4 USD |
| `general/products?type=brands_product` | 10 | e.g. Maybelline Fit Me Foundation — 29.99 USD |
| `general/products?type=all_product_discounts` | 10 | e.g. Foundation Mixing Palette — 10 USD |
| `general/products?type=product_for_parent_category` | 10 | e.g. SPF30 Sunscreen — 22 USD |
| `general/products?type=best_product_sales` | 10 | paginated `{data:[]} + filters` |
| `general/products?type=flash_sales_end_today` | **0** | empty list → section hidden (expected behavior) |
| `general/products?type=product_discount_today_or_low_qty` | **0** | empty list → section hidden |
| `general/brands?limit=8…` | 8 | Dove, L'Oréal, IKEA, Adidas, Nike, LG, Sony, Apple |
| `general/promotions?limit=6…` | 5 | Free Shipping on Orders Over 500 · Free Gift Wrap with Purchase · Beauty Products 25% Off · Buy 2 Get 1 Free · Summer Special 20% Off |
| `general/promotions?…` (date-window probe) | 10 | + Free Tote Bag…, Furniture & Home 35% Off… |
| `general/coupons?limit=8…` | 8 | App Exclusive · Student Discount · Refer a Friend · Bulk Purchase · Loyalty Discount · Free Shipping · First Order · Summer Sale (each w/ `borderColor`, `code: null`) |
| `general/nav-data?level=3` (header menu) | 6 top-level | Face · Skincare · Eyes · Lips · Brushes & Tools · Fragrance (nested children, bilingual) |
| `general/settings` | 1 | currency **USD**, `currency_selection_enabled: false`, gateways {myfatoorah, stripe, paypal, tap, tabby, tamara} |

### Notes
- **Empty rails are legitimate:** `flash_sales_end_today` and `product_discount_today_or_low_qty` return `0` products — the homepage hides those sections (same contract as the shared renderer).
- **Payload shapes vary:** plain arrays (tags/promos/brands/coupons/flash-sales), paginated wrappers `{ data: { data, links, filters } }` (products), and **single objects** (banner details, `sliders?slug=`). The homepage normalizes all shapes (`normalizeList`) so `.filter` never crashes.
- **Coupon `discount`/`code` values are empty in the CMS** — cards render names/images/borders only.
- **Out of scope 404s** (other routes' info pages, pre-existing): `general/pages/{shipping,faq,returns,terms}` → `route could not be found`.

---

## 3 · Previous backend comparison (`catch.mohammedtarek.me` — now unused by the app)

| Endpoint | Was returning on Catch | Meem now |
|----------|------------------------|----------|
| content-pages/home | 18 sections (older map) | **19 sections** |
| sliders | `[]` (empty) | 1 slide ✓ (+10 in window probe) |
| flash-sales | `[]` | **3 active sales** w/ future end dates |
| products (all rails) | `[]` or HTTP **409 Database error** | 10–20 items per rail（two legit `0`s） |
| brands / promotions / tags / coupons | `[]` | real rows ✓ |
| banner | 1 banner, 0 products | 6 banners, 9–17 products each |

---

## 4 · Live homepage verification (production build, 2026-11-03)

`npx tsc --noEmit` → 0 errors · `npx eslint` → 0 problems · `next build` → exit 0, 44 pages.

| Check | `/en` | `/ar` |
|-------|------:|------:|
| HTTP status | 200 (1,229 KB HTML) | 200 (1,226 KB HTML) |
| `dir` | ltr | **rtl** (`<html lang="ar" dir="rtl">`) |
| `.home-theme` scoped design | ✓ | ✓ |
| Hero slider rendered | ✓ (1 slide) | ✓ |
| Product cards rendered | **133** (`home-card`) | **133** |
| Add-to-cart bars (`aria-label`) | **102** | rendered |
| Discount pills (vermilion) | 66 | rendered |
| Gold badges (CMS `badge_text`) | 38 | rendered |
| Flash frame + live countdown | ✓ ("Ends in") | ✓ ("ينتهي بعد") |
| Banner cards → `/banners/…` | 12 | rendered |
| Brand rings → `/brands/…` | 16 | rendered |
| Tag chips → `/tags/…` | 100 | rendered |
| Promo cards → `/promotions/…` | 5 | rendered |
| Category chips → `/category/…` | 157 | rendered |
| Server-side API failures in HTML | **0** | **0** |

Arabic CMS content verified (Arabic section titles, `عرض الكل` View-All links, Arabic labels from `messages/ar.json`).
